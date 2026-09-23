import type { ID, Money } from "@/types/common";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type OrderItem = {
  id: ID;
  productId: ID;
  productName: string;
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
  createdAt: string;
  updatedAt: string;
};
