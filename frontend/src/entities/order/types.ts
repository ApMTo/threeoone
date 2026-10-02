import type { ID, Money } from "@/types/common";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  id: ID;
  productId: ID;
  productName: string;
  productSlug?: string | null;
  sizeId?: string | null;
  sizeLabel?: string | null;
  colorId?: string | null;
  colorName?: string | null;
  imageUrl?: string | null;
  quantity: number;
  unitPrice: Money;
  totalPrice: Money;
};

export type ShippingAddress = {
  fullName: string;
  phone: string;
  company?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode: string;
  country: string;
};

export type OrderCustomer = {
  id: ID;
  email: string;
  fullName: string;
};

export type Order = {
  id: ID;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: Money;
  shippingCost: Money;
  tax: Money;
  total: Money;
  shippingAddress: ShippingAddress;
  customer?: OrderCustomer;
  notes?: string | null;
  paidAt?: string | null;
  estimatedDelivery: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderResult = Order & {
  clientSecret: string;
  customerSessionClientSecret: string;
};
