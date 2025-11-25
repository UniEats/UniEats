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

// Helper to format time cleanly
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
          <div className={styles.emptyIcon} aria-hidden>
            🧑‍🍳
          </div>
          <div>
            <h3>{emptyStateMessage}</h3>
            <p className={styles.emptySubtitle}>Good job! No pending orders in this section.</p>
          </div>
        </div>
      )}

      {!isLoading && !error && orders && orders.length > 0 && (
        <div className={styles.ordersList}>
          {orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <h3>Order #{order.id}</h3>
                <span>{formatTime(order.creationDate)}</span>
              </div>

              <div className={styles.timestamp}>
                <span>
                  Placed: {new Date(order.creationDate).toLocaleDateString()} at {formatTime(order.creationDate)}
                </span>
                {order.estimatedDeliveryTime && (
                  <div className={styles.deliveryTime}>Target: {formatTime(order.estimatedDeliveryTime)}</div>
                )}
              </div>

              <ul className={styles.orderItems}>
                {order.details.map((detail) => (
                  <li key={detail.id} className={styles.item}>
                    <div className={styles.quantity}>{detail.quantity}</div>
                    <div className={styles.itemName}>{getOrderItemName(detail)}</div>
                  </li>
                ))}
              </ul>

              {/* Total is less critical for kitchen, but kept for reference */}
              <div className={styles.orderFooter}>Total: ${Number(order.totalPrice).toFixed(2)}</div>

              {showStatusChangers && (
                <div className={styles.actions}>
                  {order.stateId === 1 && ( // CONFIRMED
                    <>
                      <button className={styles.primaryBtn} onClick={() => onStartPreparation?.(order.id)}>
                        Start Prep
                      </button>
                      <button className={styles.secondaryBtn} onClick={() => onCancelOrder?.(order.id)}>
                        Cancel Order
                      </button>
                    </>
                  )}
                  {order.stateId === 2 && ( // IN PREPARATION
                    <button className={styles.primaryBtn} onClick={() => onMarkReady?.(order.id)}>
                      Mark Ready
                    </button>
                  )}
                  {order.stateId === 3 && ( // READY
                    <button className={styles.primaryBtn} onClick={() => onMarkComplete?.(order.id)}>
                      Complete (Picked Up)
                    </button>
                  )}
                  {order.stateId === 4 && <div className={styles.infoText}>Completed</div>}
                  {order.stateId === 5 && <div className={styles.infoText}>Canceled</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};
