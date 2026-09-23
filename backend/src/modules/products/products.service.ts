import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProductStatus } from '../../generated/prisma/client';
import { normalizeHexColor, slugify } from '../../common/utils/slugify';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto, ListProductsQueryDto } from './dto/create-product.dto';

export type ProductSizeResponse = {
  id: string;
  label: string;
  quantity: number;
};

export type ProductColorResponse = {
  id: string;
  hex: string;
  name: string | null;
  quantity: number;
  sizes: ProductSizeResponse[];
};

export type ProductResponse = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: { amount: number; currency: string };
  imageUrl: string | null;
  images: string[];
  status: ProductStatus;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
  };
  colors: ProductColorResponse[];
  stock: number;
  createdAt: string;
  updatedAt: string;
};

type ProductWithRelations = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: Prisma.Decimal;
  currency: string;
  imageUrl: string | null;
  status: ProductStatus;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  colors: Array<{
    id: string;
    hex: string;
    name: string | null;
    sizes: Array<{
      id: string;
      label: string;
      quantity: number;
    }>;
  }>;
  category: {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
  };
};

const productInclude = {
  colors: {
    orderBy: { hex: 'asc' as const },
    include: {
      sizes: { orderBy: { label: 'asc' as const } },
    },
  },
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
    },
  },
} satisfies Prisma.ProductInclude;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto): Promise<ProductResponse> {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (!category.parentId) {
      throw new BadRequestException('Products must belong to a subcategory');
    }

    const colors = this.normalizeColors(dto.colors);
    const slug = await this.ensureUniqueSlug(dto.slug?.trim() || slugify(dto.name));

    try {
      const product = await this.prisma.product.create({
        data: {
          name: dto.name.trim(),
          slug,
          description: dto.description?.trim() || '',
          price: dto.price,
          currency: (dto.currency || 'USD').toUpperCase(),
          imageUrl: dto.imageUrl?.trim() || null,
          status: dto.status ?? ProductStatus.active,
          categoryId: dto.categoryId,
          colors: {
            create: colors.map((color) => ({
              hex: color.hex,
              name: color.name,
              sizes: {
                create: color.sizes,
              },
            })),
          },
        },
        include: productInclude,
      });

      return this.toResponse(product);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Product with this slug or variant already exists');
      }
      throw error;
    }
  }

  async findAll(query: ListProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 24;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.status ? { status: query.status } : { status: ProductStatus.active }),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, products] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: products.map((product) => this.toResponse(product)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOne(id: string): Promise<ProductResponse> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });

    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }

    return this.toResponse(product);
  }

  async findBySlug(slug: string): Promise<ProductResponse> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: productInclude,
    });

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }

    return this.toResponse(product);
  }

  private normalizeColors(colors: CreateProductDto['colors']) {
    const seenHex = new Set<string>();

    return colors.map((color) => {
      let hex: string;
      try {
        hex = normalizeHexColor(color.hex);
      } catch {
        throw new BadRequestException(`Invalid color: ${color.hex}`);
      }

      if (seenHex.has(hex)) {
        throw new BadRequestException(`Duplicate color: ${hex}`);
      }
      seenHex.add(hex);

      const seenLabels = new Set<string>();
      const sizes = color.sizes.map((size) => {
        const label = size.label.trim().toUpperCase();
        if (!label) {
          throw new BadRequestException(`Size label is required for color ${hex}`);
        }
        if (seenLabels.has(label)) {
          throw new BadRequestException(`Duplicate size ${label} for color ${hex}`);
        }
        seenLabels.add(label);

        return {
          label,
          quantity: size.quantity,
        };
      });

      return {
        hex,
        name: color.name?.trim() || null,
        sizes,
      };
    });
  }

  private async ensureUniqueSlug(base: string): Promise<string> {
    let slug = base;
    let attempt = 1;

    while (await this.prisma.product.findUnique({ where: { slug }, select: { id: true } })) {
      attempt += 1;
      slug = `${base}-${attempt}`;
    }

    return slug;
  }

  private toResponse(product: ProductWithRelations): ProductResponse {
    const colors = product.colors.map((color) => {
      const quantity = color.sizes.reduce((sum, size) => sum + size.quantity, 0);
      return {
        id: color.id,
        hex: color.hex,
        name: color.name,
        quantity,
        sizes: color.sizes.map((size) => ({
          id: size.id,
          label: size.label,
          quantity: size.quantity,
        })),
      };
    });

    const stock = colors.reduce((sum, color) => sum + color.quantity, 0);
    const imageUrl = product.imageUrl;

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      price: {
        amount: Number(product.price),
        currency: product.currency,
      },
      imageUrl,
      images: imageUrl ? [imageUrl] : [],
      status: product.status,
      categoryId: product.categoryId,
      category: product.category,
      colors,
      stock,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }
}
