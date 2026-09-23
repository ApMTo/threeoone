import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../auth/types/auth.type';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';

@Controller('users/me/addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  list(@Req() req: Request & { user: AuthUser }) {
    return this.addressesService.listForUser(req.user.id);
  }

  @Post()
  create(
    @Req() req: Request & { user: AuthUser },
    @Body() dto: CreateAddressDto,
  ) {
    return this.addressesService.createForUser(req.user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() req: Request & { user: AuthUser },
    @Param('id') id: string,
  ): Promise<void> {
    await this.addressesService.removeForUser(req.user.id, id);
  }
}
