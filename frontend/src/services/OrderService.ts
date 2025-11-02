import axios from 'axios';
import { Order } from '../models/Order';

interface OrderCreateDTO {
    details: {
        productId: number | null;
        comboId: number | null;
        quantity: number;
        price: number;
        discount: number;
    }[];
}

export class OrderService {
    private static getBaseUrl() {
        const w = (window as any);
        const env = w?._env_ ?? {};
        const base = env.VITE_BACKEND_URL ?? env.baseApiUrl ?? '/api';
        return String(base).replace(/\/$/, '');
    }
    private static BASE_URL = `${OrderService.getBaseUrl()}/orders`;

    private static getAuthHeaders() {
        try {
            const raw = localStorage.getItem('tokens');
            if (raw) {
                const tokens = JSON.parse(raw) as { accessToken?: string };
                if (tokens?.accessToken) {
                    return {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${tokens.accessToken}`,
                    } as const;
                }
            }
        } catch (e) {}
        return { 'Content-Type': 'application/json' } as const;
    }

    static async createOrder(orderData: OrderCreateDTO): Promise<Order> {
        const response = await axios.post<Order>(this.BASE_URL, orderData, {
            headers: this.getAuthHeaders(),
        });
        return response.data;
    }

    static async confirmOrder(orderId: number): Promise<Order> {
        const response = await axios.post<Order>(`${this.BASE_URL}/${orderId}/confirm`, {}, {
            headers: this.getAuthHeaders(),
        });
        return response.data;
    }
    static async getConfirmedOrders(): Promise<any[]> {
        const response = await axios.get<any>(`${this.BASE_URL}/confirmed`, {
            headers: this.getAuthHeaders(),
        });
        const data = response.data;
        if (Array.isArray(data)) return data;
        if (data && Array.isArray((data as any).content)) return (data as any).content;
        // Unexpected shape; return empty array to avoid runtime crash
        return [];
    }

    static async startPreparation(orderId: number): Promise<Order> {
        const response = await axios.post<Order>(`${this.BASE_URL}/${orderId}/start-preparation`, {}, {
            headers: this.getAuthHeaders(),
        });
        return response.data;
    }

    static async markReady(orderId: number): Promise<Order> {
        const response = await axios.post<Order>(`${this.BASE_URL}/${orderId}/mark-ready`, {}, {
            headers: this.getAuthHeaders(),
        });
        return response.data;
    }

    static async pickup(orderId: number): Promise<Order> {
        const response = await axios.post<Order>(`${this.BASE_URL}/${orderId}/pickup`, {}, {
            headers: this.getAuthHeaders(),
        });
        return response.data;
    }

    static async cancelOrder(orderId: number): Promise<Order> {
        const response = await axios.post<Order>(`${this.BASE_URL}/${orderId}/cancel`, {}, {
            headers: this.getAuthHeaders(),
        });
        return response.data;
    }
}