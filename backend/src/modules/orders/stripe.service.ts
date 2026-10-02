import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { AppConfigService } from '../../config/config.service';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor(private readonly config: AppConfigService) {
    this.stripe = new Stripe(this.config.stripeSecretKey);
  }

  get client(): Stripe {
    return this.stripe;
  }

  async createCustomer(params: {
    email: string;
    name: string;
    userId: string;
  }): Promise<Stripe.Customer> {
    return this.stripe.customers.create(
      {
        email: params.email,
        name: params.name,
        metadata: { userId: params.userId },
      },
      {
        idempotencyKey: `cus_user_${params.userId}`,
      },
    );
  }

  async createCustomerSession(customerId: string): Promise<Stripe.CustomerSession> {
    return this.stripe.customerSessions.create({
      customer: customerId,
      components: {
        payment_element: {
          enabled: true,
          features: {
            payment_method_redisplay: 'enabled',
            payment_method_save: 'enabled',
            payment_method_save_usage: 'off_session',
            payment_method_remove: 'enabled',
          },
        },
      },
    });
  }

  async createPaymentIntent(params: {
    amountCents: number;
    currency: string;
    orderId: string;
    orderNumber: string;
    customerId: string;
    customerEmail?: string;
  }): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create(
      {
        amount: params.amountCents,
        currency: params.currency.toLowerCase(),
        customer: params.customerId,
        payment_method_types: ['card'],
        metadata: {
          orderId: params.orderId,
          orderNumber: params.orderNumber,
        },
        receipt_email: params.customerEmail,
      },
      {
        // Retries for the same order reuse the same PaymentIntent.
        idempotencyKey: `pi_order_${params.orderId}`,
      },
    );
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<void> {
    try {
      await this.stripe.paymentIntents.cancel(paymentIntentId);
    } catch {
      // Already succeeded/cancelled — ignore.
    }
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    const secret = this.config.stripeWebhookSecret;
    if (!secret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }
    return this.stripe.webhooks.constructEvent(rawBody, signature, secret);
  }
}
