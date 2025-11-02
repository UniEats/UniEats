import { useEffect, useState } from 'react';
import { OrderService } from '../../services/OrderService';
import styles from './KitchenOrders.module.css';
import { useProducts } from "../Product/ProductContext";

// Backend DTO shapes
type OrderDetailDTO = {
    id: number;
    orderId: number;
    productId: number | null;
    comboId: number | null;
    quantity: number;
    price: string | number;
    discount: string | number;
    totalPrice: string | number;
};

type OrderDTO = {
    id: number;
    userId: number;
    creationDate?: string; // backend
    createdAt?: string;    // potential frontend alias
    totalPrice: string | number;
    stateId: number;
    details: OrderDetailDTO[];
};

export const KitchenOrders = () => {
    const [orders, setOrders] = useState<OrderDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { productsMap, combosMap } = useProducts();

    useEffect(() => {
        loadConfirmedOrders();
    }, []);

    const loadConfirmedOrders = async () => {
        try {
            const confirmedOrders = await OrderService.getConfirmedOrders();
            const list = Array.isArray(confirmedOrders)
                ? confirmedOrders
                : (confirmedOrders && Array.isArray((confirmedOrders as any).content))
                    ? (confirmedOrders as any).content
                    : [];
            setOrders(list as OrderDTO[]);
            // Debug: helps detect unexpected shapes in production
            if (!Array.isArray(confirmedOrders)) {
                // eslint-disable-next-line no-console
                console.warn('Unexpected confirmed orders payload shape:', confirmedOrders);
            }
            setError(null);
        } catch (err) {
            setError('Error al cargar los pedidos');
            console.error('Error loading orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStartPreparation = async (orderId: number) => {
        try {
            await OrderService.startPreparation(orderId);
            // Refresh orders list
            loadConfirmedOrders();
        } catch (err) {
            setError('Error al actualizar el estado del pedido');
            console.error('Error updating order:', err);
        }
    };

    if (loading) return <div>Loading orders...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!orders || orders.length === 0) return <div>There are no confirmed orders to prepare</div>;

    return (
        <div className={styles.container}>
            <h2>Confirmed Orders</h2>
            <div className={styles.ordersList}>
                {orders.map((order: OrderDTO) => {
                    const when = order.createdAt ?? order.creationDate ?? '';
                    const details = Array.isArray(order.details) ? order.details : [];
                    return (
                        <div key={order.id} className={styles.orderCard}>
                            <div className={styles.orderHeader}>
                                <h3>Order #{order.id}</h3>
                                <span className={styles.timestamp}>
                                    {when ? new Date(when).toLocaleString() : ''}
                                </span>
                            </div>
                            <div className={styles.orderItems}>
                                {details.map((item, index) => {
                                    const name = item.productId
                                        ? (productsMap[item.productId]?.name ?? `Producto #${item.productId}`)
                                        : item.comboId
                                            ? (combosMap[item.comboId]?.name ?? `Combo #${item.comboId}`)
                                            : 'Ítem';
                                    return (
                                        <div key={index} className={styles.item}>
                                            <span className={styles.quantity}>{item.quantity}x</span>
                                            <span>{name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <button
                                className={styles.startButton}
                                onClick={() => handleStartPreparation(order.id)}
                            >
                                Start preparation
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};