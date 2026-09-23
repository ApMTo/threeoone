import { API_ENDPOINTS } from "@/constants/api";
import type { Category, CreateCategoryInput } from "@/entities/category";
import { apiClient } from "@/lib/api/client";

export const categoriesService = {
  async list(rootsOnly = false): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>(API_ENDPOINTS.categories.root, {
      params: rootsOnly ? { rootsOnly: true } : undefined,
      skipAuth: true,
    });
    return data;
  },

  async getById(id: string): Promise<Category> {
    const { data } = await apiClient.get<Category>(API_ENDPOINTS.categories.byId(id), {
      skipAuth: true,
    });
    return data;
  },

  async getBySlug(slug: string): Promise<Category> {
    const { data } = await apiClient.get<Category>(API_ENDPOINTS.categories.bySlug(slug), {
      skipAuth: true,
    });
    return data;
  },

  async create(payload: CreateCategoryInput): Promise<Category> {
    const { data } = await apiClient.post<Category>(API_ENDPOINTS.categories.root, payload);
    return data;
  },
};
