import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { slugify } from '../../common/utils/slugify';
import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

export type CategoryResponse = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  children?: CategoryResponse[];
};

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto): Promise<CategoryResponse> {
    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }

      if (parent.parentId) {
        throw new BadRequestException('Subcategories cannot have their own children');
      }
    }

    const slug = await this.ensureUniqueSlug(dto.slug?.trim() || slugify(dto.name));

    try {
      const category = await this.prisma.category.create({
        data: {
          name: dto.name.trim(),
          slug,
          description: dto.description?.trim() || null,
          imageUrl: dto.imageUrl?.trim() || null,
          parentId: dto.parentId || null,
        },
      });

      return this.toResponse(category);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Category with this slug already exists');
      }
      throw error;
    }
  }

  async findAll(rootsOnly = false): Promise<CategoryResponse[]> {
    if (rootsOnly) {
      const roots = await this.prisma.category.findMany({
        where: { parentId: null },
        include: {
          children: { orderBy: { name: 'asc' } },
        },
        orderBy: { name: 'asc' },
      });

      return roots.map((root) => ({
        ...this.toResponse(root),
        children: root.children.map((child) => this.toResponse(child)),
      }));
    }

    const categories = await this.prisma.category.findMany({
      orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
    });

    return categories.map((category) => this.toResponse(category));
  }

  async findOne(id: string): Promise<CategoryResponse> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { children: { orderBy: { name: 'asc' } } },
    });

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    return {
      ...this.toResponse(category),
      children: category.children.map((child) => this.toResponse(child)),
    };
  }

  async findBySlug(slug: string): Promise<CategoryResponse> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: { children: { orderBy: { name: 'asc' } } },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    return {
      ...this.toResponse(category),
      children: category.children.map((child) => this.toResponse(child)),
    };
  }

  private async ensureUniqueSlug(base: string): Promise<string> {
    let slug = base;
    let attempt = 1;

    while (await this.prisma.category.findUnique({ where: { slug }, select: { id: true } })) {
      attempt += 1;
      slug = `${base}-${attempt}`;
    }

    return slug;
  }

  private toResponse(category: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    parentId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): CategoryResponse {
    return {
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl,
      parentId: category.parentId,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }
}
