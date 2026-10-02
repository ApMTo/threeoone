export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    confirm: "/auth/confirm",
    logout: "/auth/logout",
    me: "/auth/me",
    refresh: "/auth/refresh",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },
  products: {
    root: "/products",
    byId: (id: string) => `/products/${id}`,
    bySlug: (slug: string) => `/products/slug/${slug}`,
    archive: (id: string) => `/products/${id}/archive`,
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
    confirmPayment: (id: string) => `/orders/${id}/confirm-payment`,
    updateStatus: (id: string) => `/admin/orders/${id}/status`,
  },
  shipping: {
    methods: "/shipping/methods",
    quote: "/shipping/quote",
  },
  users: {
    me: "/users/me",
    password: "/users/me/password",
    addresses: "/users/me/addresses",
  },
  health: "/health",
} as const;
