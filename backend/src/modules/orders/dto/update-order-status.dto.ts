import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../../../generated/prisma/client';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  @Type(() => String)
  status!: OrderStatus;
}
