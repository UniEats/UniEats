import { Product } from './Product';
import { Combo } from './Combo';

export interface OrderItem {
    product?: Product;
    combo?: Combo;
    quantity: number;
}

export interface Order {
    id: number;
    items: OrderItem[];
    status: 'PENDING' | 'CONFIRMED' | 'IN_PREPARATION' | 'READY' | 'DELIVERED' | 'CANCELLED';
    createdAt: string;
    updatedAt: string;
    totalAmount: number;
}

export interface OrderDetailDTO {
  id: number;
  orderId: number;
  productId: number | null;
  comboId: number | null;
  quantity: number;
  price: number;
  discount: number;
  totalPrice: number;
}

export interface OrderDTO {
  id: number;
  userId: number;
  creationDate: string;
  totalPrice: number;
  stateId: number;
  details: OrderDetailDTO[];
}