import { useProducts } from "@/components/Product/ProductContext";
import { OrderDTO, OrderDetailDTO } from "@/models/Order";
import styles from "./Orders.module.css";

type OrdersProps = {
  orders: OrderDTO[];
  isLoading: boolean;
  error: string | null;
  title: string;
  emptyStateMessage: string;
  showStatusChangers?: boolean;
  onStartPreparation?: (orderId: number) => void;
  onMarkReady?: (orderId: number) => void;
  onMarkComplete?: (orderId: number) => void;
  onCancelOrder?: (orderId: number) => void;
};

export const Orders = ({
  orders,
  isLoading,
  error,
  title,
  emptyStateMessage,
  showStatusChangers = false,
  onStartPreparation,
  onMarkReady,
  onMarkComplete,
  onCancelOrder,
}: OrdersProps) => {
  const { productsMap, combosMap } = useProducts();

  const getOrderItemName = (detail: OrderDetailDTO) => {
    if (detail.productId) {
      return productsMap[detail.productId]?.name || `Product #${detail.productId}`;
    }
    if (detail.comboId) {
      return combosMap[detail.comboId]?.name || `Combo #${detail.comboId}`;
    }
    return "Unknown Item";
  };

  return (
    <>
      <h2 className={styles.viewTitle}>{title}</h2>

      {isLoading && <p>Loading orders...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!isLoading && !error && (!orders || orders.length === 0) && (
        <div className={styles.emptyState}>
          <div className={styles.emptyInner}>
            <div className={styles.emptyIcon} aria-hidden>🍽️</div>
            <div>
              <h3>{emptyStateMessage}</h3>
              <p className={styles.emptySubtitle}>There are currently no orders to display in this category.</p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && orders && orders.length > 0 && (
        <div className={styles.ordersList}>
          {orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <h3>Order #{order.id}</h3>
              </div>
              <p className={styles.timestamp}>
                Placed on: {new Date(order.creationDate).toLocaleString()}
              </p>
              {order.estimatedDeliveryTime && (
                <p className={`${styles.timestamp} ${styles.deliveryTime}`}>
                  <strong>
                    Estimated Delivery: {new Date(order.estimatedDeliveryTime).toLocaleString()}
                  </strong>
                </p>
              )}
              <ul className={styles.orderItems}>
                {order.details.map((detail) => (
                  <li key={detail.id} className={styles.item}>
                    <span className={styles.quantity}>{detail.quantity}x</span>
                    <span className={styles.itemName}>{getOrderItemName(detail)}</span>
                  </li>
                ))}
              </ul>
              <div className={styles.orderFooter}>
                <strong>Total: ${Number(order.totalPrice).toFixed(2)}</strong>
              </div>

              {showStatusChangers && (
                <div className={styles.actions}>
                  {order.stateId === 1 && (
                    <>
                      <button className={styles.primaryBtn} onClick={() => onStartPreparation?.(order.id)}>
                        Start Preparation
                      </button>
                      <button className={styles.secondaryBtn} onClick={() => onCancelOrder?.(order.id)}>
                        Cancel
                      </button>
                    </>
                  )}
                  {order.stateId === 2 && (
                    <button className={styles.primaryBtn} onClick={() => onMarkReady?.(order.id)}>
                      Mark as Ready
                    </button>
                  )}
                  {order.stateId === 3 && (
                    <button className={styles.primaryBtn} onClick={() => onMarkComplete?.(order.id)}>
                      Mark as Picked Up
                    </button>
                  )}
                  {order.stateId === 4 && <div className={styles.infoText}>Order Picked Up</div>}
                  {order.stateId === 5 && <div className={styles.infoText}>Order Canceled</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};