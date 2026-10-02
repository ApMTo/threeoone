import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { UserRole } from '../../generated/prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthUser } from '../auth/types/auth.type';
import { CreateOrderDto, ListOrdersQueryDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  create(
    @Req() req: Request & { user: AuthUser },
    @Body() dto: CreateOrderDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.ordersService.create(req.user.id, dto, idempotencyKey);
  }

  @Post(':id/confirm-payment')
  confirmPayment(
    @Req() req: Request & { user: AuthUser },
    @Param('id') id: string,
  ) {
    return this.ordersService.confirmPayment(req.user.id, id);
  }

  @Get()
  list(
    @Req() req: Request & { user: AuthUser },
    @Query() query: ListOrdersQueryDto,
  ) {
    if (req.user.role === 'admin') {
      return this.ordersService.listAll(query);
    }
    return this.ordersService.listForUser(req.user.id, query);
  }

  @Get(':id')
  findOne(
    @Req() req: Request & { user: AuthUser },
    @Param('id') id: string,
  ) {
    if (req.user.role === 'admin') {
      return this.ordersService.findOneAdmin(id);
    }
    return this.ordersService.findOneForUser(req.user.id, id);
  }
}

@Controller('webhooks')
export class StripeWebhookController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('stripe')
  @SkipThrottle()
  @HttpCode(200)
  handleStripe(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string | undefined,
  ) {
    if (!req.rawBody) {
      throw new BadRequestException('Raw body missing for Stripe webhook');
    }
    return this.ordersService.handleStripeWebhook(req.rawBody, signature);
  }
}

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin)
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  list(@Query() query: ListOrdersQueryDto) {
    return this.ordersService.listAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOneAdmin(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto.status);
  }
}
