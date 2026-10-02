import 'dotenv/config';

import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, ProductStatus, UserRole } from '../src/generated/prisma/client';

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env for seed: ${name}`);
  }
  return value;
}

type ColorSeed = {
  hex: string;
  name: string;
  sizes: Array<{ label: string; quantity: number }>;
};

type ProductSeed = {
  slug: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  colors: ColorSeed[];
};

const SIZES = [
  { label: 'S', quantity: 8 },
  { label: 'M', quantity: 12 },
  { label: 'L', quantity: 10 },
  { label: 'XL', quantity: 6 },
] as const;

const COLORS = {
  black: { hex: '#1a1a1a', name: 'Black' },
  white: { hex: '#f5f5f4', name: 'Off White' },
  sand: { hex: '#c4b5a0', name: 'Sand' },
  olive: { hex: '#556b2f', name: 'Olive' },
  navy: { hex: '#1e293b', name: 'Navy' },
  burgundy: { hex: '#7f1d1d', name: 'Burgundy' },
  stone: { hex: '#a8a29e', name: 'Stone' },
  charcoal: { hex: '#44403c', name: 'Charcoal' },
} as const;

function colors(...keys: Array<keyof typeof COLORS>): ColorSeed[] {
  return keys.map((key) => ({
    ...COLORS[key],
    sizes: SIZES.map((size) => ({ ...size })),
  }));
}

const CATALOG: Array<{
  slug: string;
  name: string;
  description: string;
  children: Array<{
    slug: string;
    name: string;
    description: string;
    products: ProductSeed[];
  }>;
}> = [
  {
    slug: 'men',
    name: 'Men',
    description: 'Essentials and statement pieces for men.',
    children: [
      {
        slug: 'men-t-shirts',
        name: 'T-Shirts',
        description: 'Everyday tees with clean silhouettes.',
        products: [
          {
            slug: 'eagles-of-armenia-tee',
            name: 'Eagles of Armenia Tee',
            description: 'Soft cotton tee with tonal eagle graphic.',
            price: 159,
            imageUrl: '/product1.png',
            colors: colors('black', 'white', 'sand'),
          },
          {
            slug: 'yerevan-script-tee',
            name: 'Yerevan Script Tee',
            description: 'Relaxed fit tee with subtle script print.',
            price: 129,
            imageUrl: '/product2.png',
            colors: colors('white', 'navy', 'olive'),
          },
          {
            slug: 'mountain-line-tee',
            name: 'Mountain Line Tee',
            description: 'Heavyweight cotton with minimal line artwork.',
            price: 139,
            imageUrl: '/product3.png',
            colors: colors('charcoal', 'sand'),
          },
          {
            slug: 'ararat-crest-tee',
            name: 'Ararat Crest Tee',
            description: 'Classic crewneck with crest embroidery.',
            price: 149,
            imageUrl: '/product1.png',
            colors: colors('black', 'burgundy'),
          },
          {
            slug: 'daily-rib-tee',
            name: 'Daily Rib Tee',
            description: 'Ribbed cotton tee for layering.',
            price: 119,
            imageUrl: '/product2.png',
            colors: colors('stone', 'white', 'olive'),
          },
        ],
      },
      {
        slug: 'men-hoodies',
        name: 'Hoodies',
        description: 'Layered comfort for cooler days.',
        products: [
          {
            slug: 'studio-fleece-hoodie',
            name: 'Studio Fleece Hoodie',
            description: 'Midweight fleece with clean kangaroo pocket.',
            price: 189,
            imageUrl: '/product3.png',
            colors: colors('charcoal', 'sand', 'navy'),
          },
          {
            slug: 'heritage-zip-hoodie',
            name: 'Heritage Zip Hoodie',
            description: 'Full-zip hoodie with tonal branding.',
            price: 199,
            imageUrl: '/product1.png',
            colors: colors('black', 'olive'),
          },
          {
            slug: 'oversized-studio-hoodie',
            name: 'Oversized Studio Hoodie',
            description: 'Dropped shoulder hoodie in brushed fleece.',
            price: 209,
            imageUrl: '/product2.png',
            colors: colors('stone', 'burgundy', 'white'),
          },
          {
            slug: 'cropped-box-hoodie',
            name: 'Cropped Box Hoodie',
            description: 'Boxy cropped silhouette with rib cuffs.',
            price: 179,
            imageUrl: '/product3.png',
            colors: colors('navy', 'sand'),
          },
        ],
      },
      {
        slug: 'men-pants',
        name: 'Pants',
        description: 'Tailored ease and everyday trousers.',
        products: [
          {
            slug: 'wide-canvas-pants',
            name: 'Wide Canvas Pants',
            description: 'Relaxed wide-leg canvas trousers.',
            price: 169,
            imageUrl: '/product1.png',
            colors: colors('sand', 'olive', 'charcoal'),
          },
          {
            slug: 'tapered-twill-pants',
            name: 'Tapered Twill Pants',
            description: 'Soft twill with a clean tapered leg.',
            price: 159,
            imageUrl: '/product2.png',
            colors: colors('navy', 'black', 'stone'),
          },
          {
            slug: 'drawstring-lounge-pants',
            name: 'Drawstring Lounge Pants',
            description: 'Easy drawstring pants for travel days.',
            price: 139,
            imageUrl: '/product3.png',
            colors: colors('charcoal', 'sand'),
          },
        ],
      },
    ],
  },
  {
    slug: 'women',
    name: 'Women',
    description: 'Soft structure and quiet details for women.',
    children: [
      {
        slug: 'women-tops',
        name: 'Tops',
        description: 'Tees, tanks, and light layers.',
        products: [
          {
            slug: 'soft-column-tee',
            name: 'Soft Column Tee',
            description: 'Longline tee with a clean column drape.',
            price: 129,
            imageUrl: '/product2.png',
            colors: colors('white', 'sand', 'black'),
          },
          {
            slug: 'rib-tank-set',
            name: 'Rib Tank',
            description: 'Fine rib tank for warm weather.',
            price: 99,
            imageUrl: '/product3.png',
            colors: colors('stone', 'olive', 'burgundy'),
          },
          {
            slug: 'boxy-washed-tee',
            name: 'Boxy Washed Tee',
            description: 'Garment-washed boxy tee.',
            price: 119,
            imageUrl: '/product1.png',
            colors: colors('sand', 'navy'),
          },
          {
            slug: 'sculpted-crew-top',
            name: 'Sculpted Crew Top',
            description: 'Slightly shaped crew in soft jersey.',
            price: 135,
            imageUrl: '/product2.png',
            colors: colors('black', 'charcoal', 'white'),
          },
        ],
      },
      {
        slug: 'women-knitwear',
        name: 'Knitwear',
        description: 'Knits with a quiet luxury feel.',
        products: [
          {
            slug: 'merino-crew-knit',
            name: 'Merino Crew Knit',
            description: 'Fine merino crewneck with clean seams.',
            price: 219,
            imageUrl: '/product3.png',
            colors: colors('sand', 'burgundy', 'navy'),
          },
          {
            slug: 'open-cardigan-knit',
            name: 'Open Cardigan Knit',
            description: 'Long open cardigan for layering.',
            price: 239,
            imageUrl: '/product1.png',
            colors: colors('stone', 'charcoal'),
          },
          {
            slug: 'cropped-polo-knit',
            name: 'Cropped Polo Knit',
            description: 'Cropped polo knit with tonal buttons.',
            price: 189,
            imageUrl: '/product2.png',
            colors: colors('olive', 'white', 'black'),
          },
          {
            slug: 'soft-rollneck',
            name: 'Soft Rollneck',
            description: 'Lightweight rollneck for transitional weather.',
            price: 199,
            imageUrl: '/product3.png',
            colors: colors('navy', 'sand'),
          },
          {
            slug: 'wide-sleeve-pullover',
            name: 'Wide Sleeve Pullover',
            description: 'Relaxed pullover with wide sleeves.',
            price: 209,
            imageUrl: '/product1.png',
            colors: colors('charcoal', 'burgundy', 'stone'),
          },
        ],
      },
      {
        slug: 'women-dresses',
        name: 'Dresses',
        description: 'Easy dresses for day and evening.',
        products: [
          {
            slug: 'column-slip-dress',
            name: 'Column Slip Dress',
            description: 'Bias-cut slip with a clean column line.',
            price: 249,
            imageUrl: '/product2.png',
            colors: colors('black', 'burgundy'),
          },
          {
            slug: 'soft-shirt-dress',
            name: 'Soft Shirt Dress',
            description: 'Relaxed shirt dress in washed cotton.',
            price: 229,
            imageUrl: '/product3.png',
            colors: colors('sand', 'olive', 'white'),
          },
          {
            slug: 'knit-midi-dress',
            name: 'Knit Midi Dress',
            description: 'Stretch knit midi with soft structure.',
            price: 259,
            imageUrl: '/product1.png',
            colors: colors('navy', 'charcoal', 'stone'),
          },
        ],
      },
    ],
  },
  {
    slug: 'accessories',
    name: 'Accessories',
    description: 'Small goods to finish the look.',
    children: [
      {
        slug: 'bags',
        name: 'Bags',
        description: 'Compact bags and everyday carriers.',
        products: [
          {
            slug: 'canvas-tote-bag',
            name: 'Canvas Tote Bag',
            description: 'Structured canvas tote with interior pocket.',
            price: 89,
            imageUrl: '/product1.png',
            colors: colors('sand', 'black', 'olive'),
          },
          {
            slug: 'crossbody-mini-bag',
            name: 'Crossbody Mini Bag',
            description: 'Compact crossbody with adjustable strap.',
            price: 119,
            imageUrl: '/product2.png',
            colors: colors('burgundy', 'navy', 'charcoal'),
          },
          {
            slug: 'weekend-duffel',
            name: 'Weekend Duffel',
            description: 'Soft duffel for short trips.',
            price: 159,
            imageUrl: '/product3.png',
            colors: colors('stone', 'olive'),
          },
        ],
      },
      {
        slug: 'hats',
        name: 'Hats',
        description: 'Caps and soft hats.',
        products: [
          {
            slug: 'washed-cap',
            name: 'Washed Cap',
            description: 'Soft washed cotton cap.',
            price: 49,
            imageUrl: '/product2.png',
            colors: colors('sand', 'navy', 'black'),
          },
          {
            slug: 'wool-beanie',
            name: 'Wool Beanie',
            description: 'Fine wool beanie with rolled cuff.',
            price: 59,
            imageUrl: '/product3.png',
            colors: colors('charcoal', 'burgundy', 'olive'),
          },
        ],
      },
    ],
  },
];

async function seedAdmin(prisma: PrismaClient): Promise<void> {
  const email = requiredEnv('ADMIN_EMAIL').toLowerCase();
  const password = requiredEnv('ADMIN_PASSWORD');
  const fullName = process.env.ADMIN_FULL_NAME?.trim() || 'Admin';
  const dateOfBirth = process.env.ADMIN_DATE_OF_BIRTH?.trim() || '1990-01-01';

  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      fullName,
      dateOfBirth: new Date(dateOfBirth),
      passwordHash,
      role: UserRole.admin,
    },
    create: {
      email,
      fullName,
      dateOfBirth: new Date(dateOfBirth),
      passwordHash,
      role: UserRole.admin,
    },
  });

  console.log(`Admin user ready: ${admin.email} (${admin.id})`);
}

async function seedCatalog(prisma: PrismaClient): Promise<void> {
  let productCount = 0;
  let categoryCount = 0;

  for (const root of CATALOG) {
    const parent = await prisma.category.upsert({
      where: { slug: root.slug },
      update: {
        name: root.name,
        description: root.description,
        parentId: null,
      },
      create: {
        slug: root.slug,
        name: root.name,
        description: root.description,
      },
    });
    categoryCount += 1;

    for (const child of root.children) {
      const subcategory = await prisma.category.upsert({
        where: { slug: child.slug },
        update: {
          name: child.name,
          description: child.description,
          parentId: parent.id,
        },
        create: {
          slug: child.slug,
          name: child.name,
          description: child.description,
          parentId: parent.id,
        },
      });
      categoryCount += 1;

      for (const product of child.products) {
        const existing = await prisma.product.findUnique({
          where: { slug: product.slug },
          select: { id: true },
        });

        if (existing) {
          await prisma.productColor.deleteMany({ where: { productId: existing.id } });
          await prisma.product.update({
            where: { id: existing.id },
            data: {
              name: product.name,
              description: product.description,
              price: product.price,
              currency: 'USD',
              imageUrl: product.imageUrl ?? null,
              status: ProductStatus.active,
              categoryId: subcategory.id,
              colors: {
                create: product.colors.map((color) => ({
                  hex: color.hex,
                  name: color.name,
                  sizes: {
                    create: color.sizes.map((size) => ({
                      label: size.label,
                      quantity: size.quantity,
                    })),
                  },
                })),
              },
            },
          });
        } else {
          await prisma.product.create({
            data: {
              slug: product.slug,
              name: product.name,
              description: product.description,
              price: product.price,
              currency: 'USD',
              imageUrl: product.imageUrl ?? null,
              status: ProductStatus.active,
              categoryId: subcategory.id,
              colors: {
                create: product.colors.map((color) => ({
                  hex: color.hex,
                  name: color.name,
                  sizes: {
                    create: color.sizes.map((size) => ({
                      label: size.label,
                      quantity: size.quantity,
                    })),
                  },
                })),
              },
            },
          });
        }

        productCount += 1;
      }
    }
  }

  console.log(`Catalog ready: ${categoryCount} categories, ${productCount} products`);
}

async function main(): Promise<void> {
  const databaseUrl = requiredEnv('DATABASE_URL');
  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter });

  try {
    await seedAdmin(prisma);
    await seedCatalog(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
