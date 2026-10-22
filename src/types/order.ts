import type { CustomerDetails } from "./customer";

export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  createdAt: number;
  items: OrderItem[];
  customer: CustomerDetails;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: "cash-on-delivery";
  status: OrderStatus;
  notes?: string;
};

export type PlaceOrderInput = Pick<
  Order,
  "id" | "orderNumber" | "createdAt" | "customer" | "paymentMethod" | "notes"
> & {
  items: Pick<OrderItem, "productId" | "quantity">[];
};
