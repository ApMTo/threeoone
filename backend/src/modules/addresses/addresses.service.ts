import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';

export type AddressResponse = {
  id: string;
  fullName: string;
  phone: string;
  company: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string): Promise<AddressResponse[]> {
    const rows = await this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return rows.map((row) => this.toResponse(row));
  }

  async createForUser(
    userId: string,
    dto: CreateAddressDto,
  ): Promise<AddressResponse> {
    const existingCount = await this.prisma.address.count({ where: { userId } });
    const makeDefault = dto.isDefault === true || existingCount === 0;

    if (makeDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const row = await this.prisma.address.create({
      data: {
        userId,
        fullName: dto.fullName.trim(),
        phone: dto.phone.trim(),
        company: dto.company?.trim() || null,
        line1: dto.line1.trim(),
        line2: dto.line2?.trim() || null,
        city: dto.city.trim(),
        state: dto.state?.trim() || null,
        postalCode: dto.postalCode.trim(),
        country: dto.country.trim(),
        isDefault: makeDefault,
      },
    });

    return this.toResponse(row);
  }

  async removeForUser(userId: string, addressId: string): Promise<void> {
    const existing = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existing) {
      throw new NotFoundException('Address not found');
    }

    await this.prisma.address.delete({ where: { id: addressId } });

    if (existing.isDefault) {
      const next = await this.prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (next) {
        await this.prisma.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }
  }

  private toResponse(row: {
    id: string;
    fullName: string;
    phone: string;
    company: string | null;
    line1: string;
    line2: string | null;
    city: string;
    state: string | null;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }): AddressResponse {
    return {
      id: row.id,
      fullName: row.fullName,
      phone: row.phone,
      company: row.company,
      line1: row.line1,
      line2: row.line2,
      city: row.city,
      state: row.state,
      postalCode: row.postalCode,
      country: row.country,
      isDefault: row.isDefault,
    };
  }
}
