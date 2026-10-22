import type { CustomerDetails } from "./customer";

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

export type Order = {
  id: string;
  createdAt: number;
  items: OrderItem[];
  customer: CustomerDetails;
  subtotal: number;
  total: number;
};
