import type { ID, Money } from "@/types/common";

export type ProductStatus = "draft" | "active" | "archived";

export type ProductSize = {
  id: ID;
  label: string;
  quantity: number;
};

export type ProductColor = {
  id: ID;
  hex: string;
  name: string | null;
  /** Total stock across all sizes for this color */
  quantity: number;
  sizes: ProductSize[];
};

export type ProductCategoryRef = {
  id: ID;
  name: string;
  slug: string;
  parentId: ID | null;
};

export type Product = {
  id: ID;
  slug: string;
  name: string;
  description: string;
  price: Money;
  imageUrl?: string | null;
  images: string[];
  categoryId: ID;
  category?: ProductCategoryRef;
  colors: ProductColor[];
  stock: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
};

export type ProductSummary = Pick<
  Product,
  | "id"
  | "slug"
  | "name"
  | "price"
  | "imageUrl"
  | "images"
  | "colors"
  | "stock"
  | "status"
  | "categoryId"
  | "category"
>;

export type CreateProductSizeInput = {
  label: string;
  quantity: number;
};

export type CreateProductColorInput = {
  hex: string;
  name?: string;
  sizes: CreateProductSizeInput[];
};

export type CreateProductInput = {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  imageUrl?: string;
  categoryId: string;
  status?: ProductStatus;
  colors: CreateProductColorInput[];
};
