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