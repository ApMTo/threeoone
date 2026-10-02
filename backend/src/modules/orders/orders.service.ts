import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { OrderStatus, Prisma, ProductStatus } from '../../generated/prisma/client';
import { AppConfigService } from '../../config/config.service';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../../mail/mail.service';
import { RedisService } from '../../redis/redis.service';
import { CreateOrderDto, ListOrdersQueryDto } from './dto/create-order.dto';
import { StripeService } from './stripe.service';

const DEFAULT_SHIPPING_COST = 10.99;
const ORDER_IDEMPOTENCY_TTL_SECONDS = 60 * 60 * 24;
const ORDER_IDEMPOTENCY_PENDING_TTL_SECONDS = 60 * 15;

export type MoneyResponse = {
  amount: number;
  currency: string;
};

export type OrderItemResponse = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string | null;
  sizeId: string | null;
  sizeLabel: string | null;
  colorId: string | null;
  colorName: string | null;
  imageUrl: string | null;
  quantity: number;
  unitPrice: MoneyResponse;
  totalPrice: MoneyResponse;
};

export type OrderResponse = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItemResponse[];
  subtotal: MoneyResponse;
  shippingCost: MoneyResponse;
  tax: MoneyResponse;
  total: MoneyResponse;
  shippingAddress: {
    fullName: string;
    phone: string;
    company: string | null;
    line1: string;
    line2: string | null;
    city: string;
    state: string | null;
    postalCode: string;
    country: string;
  };
  customer?: {
    id: string;
    email: string;
    fullName: string;
  };
  notes: string | null;
  paidAt: string | null;
  estimatedDelivery: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderResponse = OrderResponse & {
  clientSecret: string;
  customerSessionClientSecret: string;
};

type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: true;
    user: { select: { id: true, email: true, fullName: true } };
  };
}>;

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly redis: RedisService,
    private readonly mailService: MailService,
    private readonly config: AppConfigService,
  ) {}

  async create(
    userId: string,
    dto: CreateOrderDto,
    idempotencyKey?: string,
  ): Promise<CreateOrderResponse> {
    const key = idempotencyKey?.trim();
    if (key) {
      if (key.length < 8 || key.length > 128) {
        throw new BadRequestException('Invalid Idempotency-Key');
      }

      const redisKey = `order:idem:${userId}:${key}`;
      const existing = await this.redis.get(redisKey);

      if (existing && existing !== 'pending') {
        return this.rehydratePaymentSession(userId, existing);
      }

      if (existing === 'pending') {
        throw new ConflictException(
          'Order creation already in progress. Retry in a moment.',
        );
      }

      const claimed = await this.redis.setNx(
        redisKey,
        'pending',
        ORDER_IDEMPOTENCY_PENDING_TTL_SECONDS,
      );

      if (!claimed) {
        const raced = await this.redis.get(redisKey);
        if (raced && raced !== 'pending') {
          return this.rehydratePaymentSession(userId, raced);
        }
        throw new ConflictException(
          'Order creation already in progress. Retry in a moment.',
        );
      }

      try {
        const created = await this.createOrderWithPayment(userId, dto);
        await this.redis.set(
          redisKey,
          created.id,
          ORDER_IDEMPOTENCY_TTL_SECONDS,
        );
        return created;
      } catch (error) {
        await this.redis.del(redisKey);
        throw error;
      }
    }

    return this.createOrderWithPayment(userId, dto);
  }

  private async createOrderWithPayment(
    userId: string,
    dto: CreateOrderDto,
  ): Promise<CreateOrderResponse> {
    if (!dto.items.length) {
      throw new BadRequestException('Order must include at least one item');
    }

    const shippingCost = DEFAULT_SHIPPING_COST;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        stripeCustomerId: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const stripeCustomerId = await this.ensureStripeCustomer(user);

    const order = await this.prisma.$transaction(async (tx) => {
      const lineItems: Array<{
        productId: string;
        productName: string;
        productSlug: string;
        sizeId: string;
        sizeLabel: string;
        colorId: string;
        colorName: string | null;
        imageUrl: string | null;
        quantity: number;
        unitPrice: Prisma.Decimal;
        totalPrice: Prisma.Decimal;
        currency: string;
      }> = [];

      let currency = 'USD';
      let subtotal = new Prisma.Decimal(0);

      for (const item of dto.items) {
        const size = await tx.productColorSize.findUnique({
          where: { id: item.sizeId },
          include: {
            color: {
              include: {
                product: true,
              },
            },
          },
        });

        if (!size || size.color.productId !== item.productId) {
          throw new BadRequestException(
            `Invalid product/size combination for product ${item.productId}`,
          );
        }

        const product = size.color.product;
        if (product.status !== ProductStatus.active) {
          throw new BadRequestException(`Product "${product.name}" is not available`);
        }

        const unitPrice = product.price;
        const lineTotal = unitPrice.mul(item.quantity);
        currency = product.currency;
        subtotal = subtotal.add(lineTotal);

        lineItems.push({
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          sizeId: size.id,
          sizeLabel: size.label,
          colorId: size.color.id,
          colorName: size.color.name,
          imageUrl: product.imageUrl,
          quantity: item.quantity,
          unitPrice,
          totalPrice: lineTotal,
          currency: product.currency,
        });

        // Atomic stock guard: prevents oversell under concurrent checkouts.
        const stock = await tx.productColorSize.updateMany({
          where: {
            id: size.id,
            quantity: { gte: item.quantity },
          },
          data: { quantity: { decrement: item.quantity } },
        });

        if (stock.count !== 1) {
          throw new BadRequestException(
            `Not enough stock for ${product.name} (${size.label}). Available: ${size.quantity}`,
          );
        }
      }

      const tax = new Prisma.Decimal(0);
      const shipping = new Prisma.Decimal(shippingCost);
      const total = subtotal.add(shipping).add(tax);
      const address = dto.shippingAddress;

      return tx.order.create({
        data: {
          orderNumber: this.generateOrderNumber(),
          userId,
          status: OrderStatus.pending,
          subtotal,
          shippingCost: shipping,
          tax,
          total,
          currency,
          shippingFullName: address.fullName.trim(),
          shippingPhone: address.phone.trim(),
          shippingCompany: address.company?.trim() || null,
          shippingLine1: address.line1.trim(),
          shippingLine2: address.line2?.trim() || null,
          shippingCity: address.city.trim(),
          shippingState: address.state?.trim() || null,
          shippingPostalCode: address.postalCode.trim(),
          shippingCountry: address.country.trim(),
          notes: dto.notes?.trim() || null,
          items: {
            create: lineItems.map((line) => ({
              productId: line.productId,
              productName: line.productName,
              productSlug: line.productSlug,
              sizeId: line.sizeId,
              sizeLabel: line.sizeLabel,
              colorId: line.colorId,
              colorName: line.colorName,
              imageUrl: line.imageUrl,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              totalPrice: line.totalPrice,
              currency: line.currency,
            })),
          },
        },
        include: {
          items: true,
          user: { select: { id: true, email: true, fullName: true } },
        },
      });
    });

    try {
      const paymentIntent = await this.stripeService.createPaymentIntent({
        amountCents: this.toStripeAmount(order.total),
        currency: order.currency,
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerId: stripeCustomerId,
        customerEmail: user.email,
      });

      const customerSession =
        await this.stripeService.createCustomerSession(stripeCustomerId);

      const updated = await this.prisma.order.update({
        where: { id: order.id },
        data: { stripePaymentIntentId: paymentIntent.id },
        include: {
          items: true,
          user: { select: { id: true, email: true, fullName: true } },
        },
      });

      if (!paymentIntent.client_secret) {
        throw new BadRequestException('Stripe did not return a client secret');
      }

      if (!customerSession.client_secret) {
        throw new BadRequestException(
          'Stripe did not return a customer session secret',
        );
      }

      return {
        ...this.toResponse(updated, true),
        clientSecret: paymentIntent.client_secret,
        customerSessionClientSecret: customerSession.client_secret,
      };
    } catch (error) {
      await this.prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          if (!item.sizeId) continue;
          await tx.productColorSize.update({
            where: { id: item.sizeId },
            data: { quantity: { increment: item.quantity } },
          });
        }
        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.cancelled },
        });
      });
      throw error;
    }
  }

  private async rehydratePaymentSession(
    userId: string,
    orderId: string,
  ): Promise<CreateOrderResponse> {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: true,
        user: { select: { id: true, email: true, fullName: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found for idempotency key');
    }

    if (order.status === OrderStatus.cancelled) {
      throw new BadRequestException(
        'Previous checkout attempt was cancelled. Start a new checkout.',
      );
    }

    if (!order.stripePaymentIntentId) {
      throw new BadRequestException('Order has no payment intent');
    }

    const paymentIntent = await this.stripeService.retrievePaymentIntent(
      order.stripePaymentIntentId,
    );

    if (!paymentIntent.client_secret) {
      throw new BadRequestException('Stripe did not return a client secret');
    }

    if (
      paymentIntent.status !== 'requires_payment_method' &&
      paymentIntent.status !== 'requires_confirmation' &&
      paymentIntent.status !== 'requires_action'
    ) {
      // Already paid / processing — client should confirm, not create again.
      if (paymentIntent.status === 'succeeded') {
        await this.markOrderPaid(order.id);
      }
      throw new ConflictException(
        `Payment already ${paymentIntent.status}. Open Orders to finish.`,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      throw new BadRequestException('Stripe customer is missing');
    }

    const customerSession = await this.stripeService.createCustomerSession(
      user.stripeCustomerId,
    );

    if (!customerSession.client_secret) {
      throw new BadRequestException(
        'Stripe did not return a customer session secret',
      );
    }

    return {
      ...this.toResponse(order, true),
      clientSecret: paymentIntent.client_secret,
      customerSessionClientSecret: customerSession.client_secret,
    };
  }

  async confirmPayment(userId: string, orderId: string): Promise<OrderResponse> {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: true,
        user: { select: { id: true, email: true, fullName: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.pending) {
      return this.toResponse(order, false);
    }

    if (!order.stripePaymentIntentId) {
      throw new BadRequestException('Order has no payment intent');
    }

    const paymentIntent = await this.stripeService.retrievePaymentIntent(
      order.stripePaymentIntentId,
    );

    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException(
        `Payment is not complete yet (status: ${paymentIntent.status})`,
      );
    }

    const expectedCents = this.toStripeAmount(order.total);
    if (paymentIntent.amount !== expectedCents) {
      throw new BadRequestException('Paid amount does not match order total');
    }

    if (
      paymentIntent.currency.toLowerCase() !== order.currency.toLowerCase()
    ) {
      throw new BadRequestException('Paid currency does not match order');
    }

    const paid = await this.markOrderPaid(order.id);
    if (paid.newlyPaid) {
      await this.sendOrderPaidEmail(paid.order);
    }
    return this.toResponse(paid.order, false);
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string | undefined) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    let event: Stripe.Event;
    try {
      event = this.stripeService.constructWebhookEvent(rawBody, signature);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('STRIPE_WEBHOOK_SECRET')
      ) {
        throw new ServiceUnavailableException(
          'Stripe webhook secret is not configured',
        );
      }
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    // Claim the event first so concurrent Stripe retries are no-ops.
    try {
      await this.prisma.stripeEvent.create({
        data: {
          id: event.id,
          type: event.type,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return { received: true, duplicate: true };
      }
      throw error;
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.applySuccessfulPaymentIntent(
            event.data.object as Stripe.PaymentIntent,
          );
          break;
        case 'payment_intent.payment_failed':
          await this.applyFailedPaymentIntent(
            event.data.object as Stripe.PaymentIntent,
          );
          break;
        case 'payment_intent.canceled':
          await this.applyCanceledPaymentIntent(
            event.data.object as Stripe.PaymentIntent,
          );
          break;
        default:
          this.logger.debug(`Ignoring Stripe event ${event.type}`);
      }

      return { received: true, type: event.type };
    } catch (error) {
      // Allow Stripe to retry if we failed after claiming the event.
      await this.prisma.stripeEvent.delete({ where: { id: event.id } }).catch(() => undefined);
      throw error;
    }
  }

  private async findOrderForPaymentIntent(paymentIntent: Stripe.PaymentIntent) {
    const orderId =
      typeof paymentIntent.metadata?.orderId === 'string'
        ? paymentIntent.metadata.orderId
        : null;

    if (orderId) {
      return this.prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
    }

    return this.prisma.order.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
      include: { items: true },
    });
  }

  private async applySuccessfulPaymentIntent(
    paymentIntent: Stripe.PaymentIntent,
  ) {
    const order = await this.findOrderForPaymentIntent(paymentIntent);

    if (!order) {
      this.logger.warn(
        `payment_intent.succeeded for unknown order (pi=${paymentIntent.id})`,
      );
      return;
    }

    if (order.status !== OrderStatus.pending) {
      this.logger.log(
        `Order ${order.orderNumber} already ${order.status}, skip paid transition`,
      );
      return;
    }

    const expectedCents = this.toStripeAmount(order.total);
    if (paymentIntent.amount !== expectedCents) {
      throw new BadRequestException(
        `Webhook amount mismatch for order ${order.id}`,
      );
    }

    if (paymentIntent.currency.toLowerCase() !== order.currency.toLowerCase()) {
      throw new BadRequestException(
        `Webhook currency mismatch for order ${order.id}`,
      );
    }

    if (
      order.stripePaymentIntentId &&
      order.stripePaymentIntentId !== paymentIntent.id
    ) {
      throw new BadRequestException(
        `Webhook payment intent mismatch for order ${order.id}`,
      );
    }

    const paid = await this.markOrderPaid(order.id);
    this.logger.log(
      `Order ${order.orderNumber} marked paid via webhook (${paymentIntent.id})`,
    );
    if (paid.newlyPaid) {
      await this.sendOrderPaidEmail(paid.order);
    }
  }

  private async applyFailedPaymentIntent(paymentIntent: Stripe.PaymentIntent) {
    const order = await this.findOrderForPaymentIntent(paymentIntent);
    if (!order) {
      this.logger.warn(
        `payment_intent.payment_failed for unknown order (pi=${paymentIntent.id})`,
      );
      return;
    }

    // Keep pending so the customer can retry with the same PaymentIntent / order.
    this.logger.warn(
      `Payment failed for order ${order.orderNumber} (pi=${paymentIntent.id}, status=${paymentIntent.status})`,
    );
  }

  private async applyCanceledPaymentIntent(paymentIntent: Stripe.PaymentIntent) {
    const order = await this.findOrderForPaymentIntent(paymentIntent);
    if (!order) {
      this.logger.warn(
        `payment_intent.canceled for unknown order (pi=${paymentIntent.id})`,
      );
      return;
    }

    if (order.status !== OrderStatus.pending) {
      this.logger.log(
        `Skip cancel for order ${order.orderNumber} (status=${order.status})`,
      );
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (!item.sizeId) continue;
        await tx.productColorSize.update({
          where: { id: item.sizeId },
          data: { quantity: { increment: item.quantity } },
        });
      }

      await tx.order.updateMany({
        where: { id: order.id, status: OrderStatus.pending },
        data: { status: OrderStatus.cancelled },
      });
    });

    this.logger.log(
      `Order ${order.orderNumber} cancelled via webhook (${paymentIntent.id}), stock restored`,
    );
  }

  async listForUser(userId: string, query: ListOrdersQueryDto) {
    return this.list({ userId }, query, false);
  }

  async listAll(query: ListOrdersQueryDto) {
    return this.list({}, query, true);
  }

  async findOneForUser(userId: string, id: string): Promise<OrderResponse> {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: true,
        user: { select: { id: true, email: true, fullName: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.toResponse(order, false);
  }

  async findOneAdmin(id: string): Promise<OrderResponse> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: { select: { id: true, email: true, fullName: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.toResponse(order, true);
  }

  async updateStatus(id: string, nextStatus: OrderStatus): Promise<OrderResponse> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: { select: { id: true, email: true, fullName: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    this.assertStatusTransition(order.status, nextStatus);

    if (nextStatus === OrderStatus.cancelled && order.status === OrderStatus.processing) {
      await this.prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          if (!item.sizeId) continue;
          await tx.productColorSize.update({
            where: { id: item.sizeId },
            data: { quantity: { increment: item.quantity } },
          });
        }

        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.cancelled },
        });
      });
    } else {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: nextStatus },
      });
    }

    return this.findOneAdmin(id);
  }

  private assertStatusTransition(current: OrderStatus, next: OrderStatus): void {
    const allowed: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.pending]: [],
      [OrderStatus.processing]: [OrderStatus.shipped, OrderStatus.cancelled],
      [OrderStatus.shipped]: [OrderStatus.delivered],
      [OrderStatus.delivered]: [],
      [OrderStatus.cancelled]: [],
    };

    if (!allowed[current].includes(next)) {
      throw new BadRequestException(
        `Cannot change order status from ${current} to ${next}`,
      );
    }
  }

  private async sendOrderPaidEmail(order: OrderWithItems): Promise<void> {
    if (!order.user?.email) return;

    try {
      const currency = order.currency;
      await this.mailService.sendOrderConfirmation({
        to: order.user.email,
        fullName: order.user.fullName || order.shippingFullName,
        orderNumber: order.orderNumber,
        total: `${Number(order.total).toFixed(2)} ${currency}`,
        items: order.items.map((item) => ({
          productName: item.productName,
          sizeLabel: item.sizeLabel,
          quantity: item.quantity,
          lineTotal: `${Number(item.totalPrice).toFixed(2)} ${item.currency}`,
        })),
        ordersUrl: new URL('/orders', this.config.frontendUrl).toString(),
      });
    } catch (error) {
      this.logger.error(
        `Failed to send order confirmation for ${order.orderNumber}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private async markOrderPaid(
    orderId: string,
  ): Promise<{ order: OrderWithItems; newlyPaid: boolean }> {
    // Atomic transition pending → processing (safe under webhook + confirm races).
    const result = await this.prisma.order.updateMany({
      where: { id: orderId, status: OrderStatus.pending },
      data: {
        status: OrderStatus.processing,
        paidAt: new Date(),
      },
    });

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: { select: { id: true, email: true, fullName: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return { order, newlyPaid: result.count === 1 };
  }

  private async list(
    where: Prisma.OrderWhereInput,
    query: ListOrdersQueryDto,
    includeCustomer: boolean,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [total, orders] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
          user: { select: { id: true, email: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: orders.map((order) => this.toResponse(order, includeCustomer)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  private async ensureStripeCustomer(user: {
    id: string;
    email: string;
    fullName: string;
    stripeCustomerId: string | null;
  }): Promise<string> {
    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    const customer = await this.stripeService.createCustomer({
      email: user.email,
      name: user.fullName,
      userId: user.id,
    });

    // If two requests race, keep the first stored id.
    const attached = await this.prisma.user.updateMany({
      where: { id: user.id, stripeCustomerId: null },
      data: { stripeCustomerId: customer.id },
    });

    if (attached.count === 1) {
      return customer.id;
    }

    const refreshed = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { stripeCustomerId: true },
    });
    if (refreshed?.stripeCustomerId) {
      return refreshed.stripeCustomerId;
    }
    throw new BadRequestException('Failed to attach Stripe customer');
  }

  private generateOrderNumber(): string {
    const stamp = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `TO1-${stamp}-${rand}`;
  }

  private toStripeAmount(value: Prisma.Decimal): number {
    return Math.round(Number(value.toFixed(2)) * 100);
  }

  private toMoney(value: Prisma.Decimal, currency: string): MoneyResponse {
    return {
      amount: Number(value),
      currency,
    };
  }

  private toResponse(order: OrderWithItems, includeCustomer: boolean): OrderResponse {
    const currency = order.currency;

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productSlug: item.productSlug,
        sizeId: item.sizeId,
        sizeLabel: item.sizeLabel,
        colorId: item.colorId,
        colorName: item.colorName,
        imageUrl: item.imageUrl,
        quantity: item.quantity,
        unitPrice: this.toMoney(item.unitPrice, item.currency || currency),
        totalPrice: this.toMoney(item.totalPrice, item.currency || currency),
      })),
      subtotal: this.toMoney(order.subtotal, currency),
      shippingCost: this.toMoney(order.shippingCost, currency),
      tax: this.toMoney(order.tax, currency),
      total: this.toMoney(order.total, currency),
      shippingAddress: {
        fullName: order.shippingFullName,
        phone: order.shippingPhone,
        company: order.shippingCompany,
        line1: order.shippingLine1,
        line2: order.shippingLine2,
        city: order.shippingCity,
        state: order.shippingState,
        postalCode: order.shippingPostalCode,
        country: order.shippingCountry,
      },
      ...(includeCustomer
        ? {
            customer: {
              id: order.user.id,
              email: order.user.email,
              fullName: order.user.fullName,
            },
          }
        : {}),
      notes: order.notes,
      paidAt: order.paidAt?.toISOString() ?? null,
      estimatedDelivery: 'Estimated delivery: 7–14 days',
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }
}

