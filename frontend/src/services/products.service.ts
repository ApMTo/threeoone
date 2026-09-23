import { API_ENDPOINTS } from "@/constants/api";
import type {
  CreateProductInput,
  Product,
  ProductSummary,
} from "@/entities/product";
import { apiClient } from "@/lib/api/client";
import type { ProductListParams } from "@/lib/query/keys";
import type { PaginatedResponse } from "@/types/api";

export const productsService = {
  async list(params: ProductListParams = {}): Promise<PaginatedResponse<ProductSummary>> {
    const { data } = await apiClient.get<PaginatedResponse<ProductSummary>>(
      API_ENDPOINTS.products.root,
      { params, skipAuth: true },
    );
    return data;
  },

  async getById(id: string): Promise<Product> {
    const { data } = await apiClient.get<Product>(API_ENDPOINTS.products.byId(id), {
      skipAuth: true,
    });
    return data;
  },

  async getBySlug(slug: string): Promise<Product> {
    const { data } = await apiClient.get<Product>(API_ENDPOINTS.products.bySlug(slug), {
      skipAuth: true,
    });
    return data;
  },

  async create(payload: CreateProductInput): Promise<Product> {
    const { data } = await apiClient.post<Product>(API_ENDPOINTS.products.root, payload);
    return data;
  },
};
