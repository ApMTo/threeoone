import type { ID } from "@/types/common";

export type Category = {
  id: ID;
  slug: string;
  name: string;
  description?: string | null;
  parentId?: ID | null;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  children?: Category[];
};

export type CreateCategoryInput = {
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  slug?: string;
};
