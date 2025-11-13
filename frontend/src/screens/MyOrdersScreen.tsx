import { useQuery } from "@tanstack/react-query";
import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { Orders } from "@/components/Orders/Orders";
import { BASE_API_URL } from "@/config/app-query-client";
import { OrderDTO } from "@/models/Order";
import { useAccessTokenGetter, useHandleResponse } from "@/services/TokenContext";
import styles from "@/components/KitchenOrders/KitchenOrders.module.css";
import { useState, useEffect } from "react";

type OrderState = {
  id: number;
  name: string;
};

const useMyOrders = () => {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();

  return useQuery<OrderDTO[]>({
    queryKey: ["orders", "me"],
    queryFn: async () => {
      const response = await fetch(`${BASE_API_URL}/orders/my-orders`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${await getAccessToken()}` },
      });
      return handleResponse(response, (json) => json as OrderDTO[]);
    },
  });
};

const useOrderStates = () => {
  const getAccessToken = useAccessTokenGetter();
  const handleResponse = useHandleResponse();
  return useQuery<OrderState[]>({
    queryKey: ["orderStates"],
    queryFn: async () => {
      const resp = await fetch(`${BASE_API_URL}/orders/states`, {
        headers: { Authorization: `Bearer ${await getAccessToken()}`, Accept: "application/json" },
      });
      return handleResponse(resp, (json) => json as OrderState[]);
    },
  });
};

export const MyOrdersScreen = () => {
  const { data: allOrders, isLoading, error } = useMyOrders();
  const { data: orderStates = [] } = useOrderStates();
  const [selectedState, setSelectedState] = useState<OrderState | null>(null);

  useEffect(() => {
    if (orderStates.length > 0 && !selectedState) {
      setSelectedState(orderStates[0]);
    }
  }, [orderStates, selectedState]);

  const filteredOrders = allOrders?.filter(order => selectedState ? order.stateId === selectedState.id : true) || [];

  return (
    <CommonLayout>
      <div className={styles.container}>
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
          orders={filteredOrders}
          isLoading={isLoading}
          error={error ? "Could not load your orders. Please try again later." : null}
          title="My Orders"
          emptyStateMessage={`You have no ${selectedState?.name ?? ''} orders`}
          showStatusChangers={false}
        />
      </div>
    </CommonLayout>
  );
};