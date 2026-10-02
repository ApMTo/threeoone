import type { PaginationParams, SortParams } from "@/types/api";

export type ProductListParams = PaginationParams &
  SortParams & {
    categoryId?: string;
    search?: string;
    status?: string;
    includeInactive?: boolean;
  };

export type OrderListParams = PaginationParams & {
  status?: string;
};

export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  products: {
    all: ["products"] as const,
    lists: () => [...queryKeys.products.all, "list"] as const,
    list: (params: ProductListParams = {}) => [...queryKeys.products.lists(), params] as const,
    details: () => [...queryKeys.products.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
    detailBySlug: (slug: string) => [...queryKeys.products.details(), "slug", slug] as const,
  },
  categories: {
    all: ["categories"] as const,
    lists: () => [...queryKeys.categories.all, "list"] as const,
    list: () => [...queryKeys.categories.lists()] as const,
    details: () => [...queryKeys.categories.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
  },
  cart: {
    all: ["cart"] as const,
    current: () => [...queryKeys.cart.all, "current"] as const,
  },
  orders: {
    all: ["orders"] as const,
    lists: () => [...queryKeys.orders.all, "list"] as const,
    list: (params: OrderListParams = {}) => [...queryKeys.orders.lists(), params] as const,
    details: () => [...queryKeys.orders.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },
  shipping: {
    all: ["shipping"] as const,
    methods: () => [...queryKeys.shipping.all, "methods"] as const,
  },
  account: {
    all: ["account"] as const,
    profile: () => [...queryKeys.account.all, "profile"] as const,
    addresses: () => [...queryKeys.account.all, "addresses"] as const,
  },
} as const;
