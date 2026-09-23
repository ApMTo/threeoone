export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    confirm: "/auth/confirm",
    logout: "/auth/logout",
    me: "/auth/me",
    refresh: "/auth/refresh",
  },
  products: {
    root: "/products",
    byId: (id: string) => `/products/${id}`,
    bySlug: (slug: string) => `/products/slug/${slug}`,
  },
  categories: {
    root: "/categories",
    byId: (id: string) => `/categories/${id}`,
    bySlug: (slug: string) => `/categories/slug/${slug}`,
  },
  cart: {
    root: "/cart",
    items: "/cart/items",
    item: (id: string) => `/cart/items/${id}`,
  },
  orders: {
    root: "/orders",
    byId: (id: string) => `/orders/${id}`,
  },
  shipping: {
    methods: "/shipping/methods",
    quote: "/shipping/quote",
  },
  users: {
    me: "/users/me",
    addresses: "/users/me/addresses",
  },
} as const;
