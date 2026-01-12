export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Address {
  street: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress: Address;
}

export interface OrderStatusUpdate {
  id: string;
  status: OrderStatus;
  updatedAt: string;
}

export type MockWebSocketMessage =
  | { type: 'new_order'; payload: Order }
  | { type: 'order_status'; payload: OrderStatusUpdate };
