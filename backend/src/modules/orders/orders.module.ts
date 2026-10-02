import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import {
  AdminOrdersController,
  OrdersController,
  StripeWebhookController,
} from './orders.controller';
import { OrdersService } from './orders.service';
import { StripeService } from './stripe.service';

@Module({
  imports: [AuthModule],
  controllers: [OrdersController, StripeWebhookController, AdminOrdersController],
  providers: [OrdersService, StripeService],
  exports: [OrdersService],
})
export class OrdersModule {}
