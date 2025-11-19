import { useEffect, useState, useCallback } from 'react';
import { Orders } from '@/components/Orders/Orders';
import { DeliveryTimeModal } from '@/components/Orders/DeliveryTimeModal';
import { BASE_API_URL } from '@/config/app-query-client';
import { OrderDTO } from '@/models/Order';
import { useAccessTokenGetter, useHandleResponse } from '@/services/TokenContext';
import styles from './KitchenOrders.module.css';

type OrderState = {
  id: number;
  name: string;
};

export const KitchenOrders = () => {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [orderStates, setOrderStates] = useState<OrderState[]>([]);
  const [selectedState, setSelectedState] = useState<OrderState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [preparingOrderId, setPreparingOrderId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const resp = await fetch(`${BASE_API_URL}/orders/states`, {
          headers: { Authorization: `Bearer ${await getAccessToken()}`, Accept: 'application/json' },
        });
        const data = await handleResponse(resp, (json) => json as OrderState[]);
        if (data) {
          setOrderStates(data);
          if (data.length > 0) setSelectedState(data[0]);
        }
      } catch (err) {
        console.error('Error fetching order states:', err);
        setError('Error loading states');
      }
    };
    fetchStates();
  }, [getAccessToken, handleResponse]);

  const loadOrdersByState = useCallback(async (stateId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_API_URL}/orders/state/${stateId}`, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${await getAccessToken()}` },
      });
      const data = await handleResponse(response, (json) => json as OrderDTO[]);
      setOrders(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Error loading orders');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  }, [getAccessToken, handleResponse]);
  
  useEffect(() => {
    if (!selectedState) return;
    loadOrdersByState(selectedState.id);
  }, [selectedState, loadOrdersByState]);

  const handleStateChange = async (orderId: number, action: string) => {
    try {
      const response = await fetch(`${BASE_API_URL}/orders/${orderId}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${await getAccessToken()}` },
      });
      await handleResponse(response, (json) => json);
      if (selectedState) {
        await loadOrdersByState(selectedState.id);
      }
    } catch (err) {
      setError(`Error updating order status: ${err instanceof Error ? err.message : String(err)}`);
      console.error(`Error on ${action}:`, err);
    }
  };

  const handleOpenPreparationModal = (orderId: number) => {
    setPreparingOrderId(orderId);
    setIsModalOpen(true);
  };

  const handleConfirmPreparation = async (isoDateTime: string) => {
    if (!preparingOrderId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_API_URL}/orders/${preparingOrderId}/start-preparation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAccessToken()}`
        },
        body: JSON.stringify({ estimatedDeliveryTime: isoDateTime })
      });

      await handleResponse(response, (json) => json);

      setIsModalOpen(false);
      setPreparingOrderId(null);
      if (selectedState) {
        await loadOrdersByState(selectedState.id);
      }
    } catch (err) {
      const errorMessage = `Error updating order status: ${err instanceof Error ? err.message : String(err)}`;
      setError(errorMessage);
      console.error(`Error on start-preparation:`, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {isModalOpen && preparingOrderId && (
        <DeliveryTimeModal
          orderId={preparingOrderId}
          onSubmit={handleConfirmPreparation}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      )}

      <div className={styles.stateButtons}>
        <ul>
          {orderStates.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => setSelectedState(s)}
                className={`${styles.stateButton} ${selectedState?.id === s.id ? styles.active : ''}`}
              >
                {s.name.charAt(0).toUpperCase() + s.name.slice(1)}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Orders
        orders={orders}
        isLoading={loading}
        error={error}
        title={`Kitchen Orders: ${selectedState?.name ?? 'All'}`}
        emptyStateMessage={`No ${selectedState?.name ?? ''} orders`}
        showStatusChangers={true}
        onStartPreparation={handleOpenPreparationModal}
        onMarkReady={(id) => handleStateChange(id, 'mark-ready')}
        onMarkComplete={(id) => handleStateChange(id, 'pickup')}
        onCancelOrder={(id) => handleStateChange(id, 'cancel')}
      />
    </div>
  );
};