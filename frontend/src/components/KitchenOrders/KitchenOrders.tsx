import { useEffect, useMemo, useState } from 'react';
import { useAccessTokenGetter, useHandleResponse } from '@/services/TokenContext';
import { BASE_API_URL } from '@/config/app-query-client';
import styles from './KitchenOrders.module.css';
import { useProducts } from "../Product/ProductContext";
import { useProductList } from "@/services/ProductServices";
import { useComboList } from "@/services/ComboServices";

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
    creationDate?: string; 
    createdAt?: string;    
    totalPrice: string | number;
    stateId: number;
    details: OrderDetailDTO[];
};

type OrderState = {
  id: number;
  name: string;
};

export const KitchenOrders = () => {
    const [orders, setOrders] = useState<OrderDTO[]>([]);
    const [orderStates, setOrderStates] = useState<OrderState[]>([]);
    const [selectedState, setSelectedState] = useState<OrderState | null>(null);
    const [_loading, setLoading] = useState(true);
    const [_error, setError] = useState<string | null>(null);
    const { productsMap, combosMap } = useProducts();
    const [activeOrder, setActiveOrder] = useState<OrderDTO | null>(null);
    const [checkState, setCheckState] = useState<Record<string, boolean>>({});
    const [submitting, setSubmitting] = useState(false);

    const productsQuery = useProductList();
    const combosQuery = useComboList();
    const getAccessToken = useAccessTokenGetter();
    const handleResponse = useHandleResponse();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
      const fetchStates = async () => {
        try {
          const resp = await fetch(`${BASE_API_URL}/orders/states`, {
            headers: {
              Authorization: `Bearer ${await getAccessToken()}`,
              Accept: 'application/json',
            },
          });
          const data = await handleResponse(resp, (json) => json as OrderState[]);
          setOrderStates(data);
          if (data.length > 0) setSelectedState(data[0]);
        } catch (err) {
          console.error('Error fetching order states:', err);
          setError('Error al cargar los estados');
        }
      };
      fetchStates();
    }, []);

    useEffect(() => {
      if (!selectedState) return;
      loadOrdersByState(selectedState.id);
    }, [selectedState]);

    const loadOrdersByState = async (stateId: number) => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_API_URL}/orders/state/${stateId}`, {
                method: 'GET',
                headers: { Accept: 'application/json', Authorization: `Bearer ${await getAccessToken()}` },
            });
            const data = await handleResponse(response, (json) => json as OrderDTO[]);
            setOrders(Array.isArray(data) ? data : []);
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
            const orderResp = await fetch(`${BASE_API_URL}/orders/${orderId}`, {
                method: 'GET',
                headers: { Accept: 'application/json', Authorization: `Bearer ${await getAccessToken()}` },
            });
            const freshOrder = await handleResponse(orderResp, (json) => json as OrderDTO);
            if ((freshOrder as OrderDTO).stateId === 1) {
                const startResp = await fetch(`${BASE_API_URL}/orders/${orderId}/start-preparation`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${await getAccessToken()}` },
                });
                await handleResponse(startResp, (json) => json);
            }
            await loadOrdersByState(selectedState?.id ?? 0);
        } catch (err) {
            setError('Error al actualizar el estado del pedido');
            console.error('Error updating order:', err);
        }
    };

    const handleMarkReady = async (orderId: number) => {
      try {
        setSubmitting(true);
        const orderResp = await fetch(`${BASE_API_URL}/orders/${orderId}`, {
          method: 'GET',
          headers: { Accept: 'application/json', Authorization: `Bearer ${await getAccessToken()}` },
        });
        const freshOrder = await handleResponse(orderResp, (json) => json as OrderDTO);

        if (freshOrder.stateId !== 2) {
          setError('El pedido no está en preparación.');
          return;
        }

        setActiveOrder(freshOrder);
        setCheckState(buildInitialChecklist(freshOrder));
      } catch (err) {
        console.error('Error preparando para marcar como listo:', err);
        setError('No se pudo cargar el pedido para marcar como listo.');
      } finally {
        setSubmitting(false);
      }
    };

    const handleMarkComplete = async (orderId: number) => {
      try {
        const response = await fetch(`${BASE_API_URL}/orders/${orderId}/pickup`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${await getAccessToken()}` },
        });
        await handleResponse(response, (json) => json);
        await loadOrdersByState(selectedState?.id ?? 0);
      } catch (err) {
        console.error('Error marking order complete:', err);
        setError('No se pudo marcar el pedido como completo');
      }
    };

    const closeOverlay = () => {
        setActiveOrder(null);
        setCheckState({});
    };

    const buildInitialChecklist = (order: OrderDTO) => {
        const map: Record<string, boolean> = {};
        const pMap = indexProductsById();
        const cMap = indexCombosById();
        for (const d of order.details || []) {
            if (d.productId) {
                const p = pMap[d.productId];
                const ings = getProductIngredients(p);
                ings.forEach((ing) => {
                    const ingId = String(ing.id ?? ing.name);
                    const key = `p:${p?.id ?? d.productId}:i:${ingId}`;
                    map[key] = false;
                });
            } else if (d.comboId) {
                const combo = cMap[d.comboId];
                if (combo && combo.products) {
                    combo.products.forEach((cp: { id: number; name?: string; quantity?: number }) => {
                        const product = pMap[cp.id];
                        const ings = getProductIngredients(product);
                        ings.forEach((ing) => {
                            const ingId = String(ing.id ?? ing.name);
                            const key = `c:${combo.id}:p:${product?.id ?? cp.id}:i:${ingId}`;
                            map[key] = false;
                        });
                    });
                }
            }
        }
        return map;
    };

    type IngredientEntry = { id?: number | string; name: string; quantity?: number };
    type ProductWithIngredientsLocal = { id?: number; name?: string; ingredients?: unknown };
    type ComboProductEntry = { id: number; name?: string; quantity?: number };
    type ComboLocal = { id: number; name?: string; products?: ComboProductEntry[] };

    const getProductIngredients = (product?: ProductWithIngredientsLocal | null): IngredientEntry[] => {
        if (!product) return [];
        const ings: IngredientEntry[] = [];
            const prodIngredients = (product as ProductWithIngredientsLocal).ingredients;
        if (Array.isArray(prodIngredients)) {
            for (const it of prodIngredients) {
                if (!it) continue;
                const rec = it as Record<string, unknown>;
                const id = (typeof rec['id'] === 'number' || typeof rec['id'] === 'string') ? (rec['id'] as number | string) : undefined;
                const name = typeof rec['name'] === 'string' ? (rec['name'] as string) : String(it);
                const quantity = typeof rec['quantity'] === 'number' ? (rec['quantity'] as number) : undefined;
                ings.push({ id, name, quantity });
            }
            return ings;
        }
        // or ingredients may be a map/object { id: name }
            if (prodIngredients && typeof prodIngredients === 'object') {
                Object.entries(prodIngredients).forEach(([k, v]) => {
                    ings.push({ id: k, name: String(v) });
                });
            return ings;
        }
        return [];
    };

    const indexProductsById = (): Record<number, ProductWithIngredientsLocal> => {
        const byId: Record<number, ProductWithIngredientsLocal> = {};
        const list = (productsQuery.data || []) as unknown[];
        if (Array.isArray(list) && list.length > 0) {
            list.forEach((p) => {
                const item = p as ProductWithIngredientsLocal;
                if (item && typeof item.id === 'number') byId[item.id] = item;
            });
        }
        try {
            (Object.values(productsMap || {}) as ProductWithIngredientsLocal[]).forEach((p) => {
                if (typeof p?.id === 'number' && !byId[p.id]) byId[p.id] = p;
            });
        } catch {
            // ignore map merging errors
        }
        if (Object.keys(byId).length === 0) {
            console.warn('KitchenOrders: no product data available from productsQuery or productsMap. Check permissions or token.');
        }

        return byId;
    };

    const indexCombosById = (): Record<number, ComboLocal> => {
        const byId: Record<number, ComboLocal> = {};
        const list = (combosQuery.data || []) as unknown[];
        if (Array.isArray(list) && list.length > 0) {
            list.forEach((c) => {
                const item = c as ComboLocal;
                if (item && typeof item.id === 'number') byId[item.id] = item;
            });
        }
        try {
            (Object.values(combosMap || {}) as ComboLocal[]).forEach((c) => {
                if (typeof c?.id === 'number' && !byId[c.id]) byId[c.id] = c;
            });
        } catch {
            // ignore map merging errors
        }

        if (Object.keys(byId).length === 0) {
            console.warn('KitchenOrders: no combo data available from combosQuery or combosMap.');
        }

        return byId;
    };

    const allChecked = useMemo(() => {
        const keys = Object.keys(checkState);
        if (keys.length === 0) return false; 
        return keys.every(k => checkState[k]);
    }, [checkState]);

    const toggleCheck = (key: string) => {
        setCheckState((prev: Record<string, boolean>) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleFinalize = async () => {
        if (!activeOrder) return;
        try {
            setSubmitting(true);
            const orderResp = await fetch(`${BASE_API_URL}/orders/${activeOrder.id}`, {
                method: 'GET',
                headers: { Accept: 'application/json', Authorization: `Bearer ${await getAccessToken()}` },
            });
            const freshOrder = await handleResponse(orderResp, (json) => json as OrderDTO) as OrderDTO;

            if (freshOrder.stateId === 1) {
                setError('El pedido aún no está en preparación. Inícielo antes de marcarlo como listo.');
                return;
            }

            if (freshOrder.stateId === 2) {
                const markResp = await fetch(`${BASE_API_URL}/orders/${activeOrder.id}/mark-ready`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${await getAccessToken()}` },
                });
                await handleResponse(markResp, (json) => json);
                closeOverlay();
                if (selectedState) {
                    await loadOrdersByState(selectedState.id);
                }
            } else {
                setError('No se puede finalizar: el pedido no está en preparación.');
            }
        } catch (err) {
            console.error('Error finalizando pedido:', err);
            setError('No se pudo finalizar el pedido');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
          <h2>Kitchen Orders</h2>

          {_loading && <div className={styles.info}>Cargando pedidos...</div>}
          {_error && <div className={styles.error}>{_error}</div>}

          <div className={styles.stateButtons}>
            {orderStates.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedState(s)}
                className={`${styles.stateButton} ${selectedState?.id === s.id ? styles.active : ''}`}
              >
                {s.name.charAt(0).toUpperCase() + s.name.slice(1)}
              </button>
            ))}
          </div>

          {(!orders || orders.length === 0) ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyInner}>
                <div className={styles.emptyIcon} aria-hidden>🍽️</div>
                <div>
                  <h3>No {selectedState?.name} orders</h3>
                  <p className={styles.emptySubtitle}>
                    There are no orders in this state. Please wait for new orders or check your connection.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.ordersList}>
                {orders.map((order) => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <h3>Order #{order.id}</h3>
                      <span className={styles.timestamp}>
                        {new Date(order.createdAt ?? order.creationDate ?? '').toLocaleString()}
                      </span>
                    </div>

                    <div className={styles.actions}>
                      {order.stateId === 1 && (
                        <button
                          className={styles.primaryBtn}
                          onClick={() => handleStartPreparation(order.id)}
                        >
                          Start Preparation
                        </button>
                      )}

                      {order.stateId === 2 && (
                        <button
                          className={styles.primaryBtn}
                          onClick={() => handleMarkReady(order.id)}
                        >
                          Mark as Ready
                        </button>
                      )}

                      {order.stateId === 3 && (
                        <button
                          className={styles.primaryBtn}
                          onClick={() => handleMarkComplete(order.id)}
                        >
                          Mark as Picked Up
                        </button>
                      )}

                      {order.stateId === 4 && (
                        <div className={styles.infoText}>Picked up</div>
                      )}

                      {order.stateId === 5 && (
                        <div className={styles.infoText}>Canceled</div>
                      )}

                      {order.stateId === 1 && (
                        <button
                          className={styles.secondaryBtn}
                          onClick={async () => {
                            try {
                              const resp = await fetch(`${BASE_API_URL}/orders/${order.id}/cancel`, {
                                method: 'POST',
                                headers: { Authorization: `Bearer ${await getAccessToken()}` },
                              });
                              await handleResponse(resp, (json) => json);
                              await loadOrdersByState(selectedState?.id ?? 0);
                            } catch (err) {
                              console.error('Error canceling order:', err);
                              setError('No se pudo cancelar el pedido');
                            }
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}

            {activeOrder && (
                <div className={styles.prepOverlay} role="dialog" aria-modal="true" aria-labelledby="prep-title">
                    <div className={styles.prepHeader}>
                        <h3 id="prep-title">In preparation — Order #{activeOrder.id}</h3>
                        <button type="button" className={styles.closeBtn} onClick={closeOverlay} aria-label="Cerrar">✕</button>
                    </div>
                    <div className={styles.prepBody}>
                        {(productsQuery.isLoading || combosQuery.isLoading) && (
                            <div className={styles.info}>Loading ingredient details…</div>
                        )}
                        {(productsQuery.error || combosQuery.error) && (
                            <div className={styles.error}>Could not load product or combo details</div>
                        )}

                        {!productsQuery.isLoading && !combosQuery.isLoading && (
                            <div className={styles.checklist}>
                                {Object.keys(checkState).length === 0 && (
                                    <div className={styles.info}>
                                        <p>No ingredients were found for this order.</p>
                                        <p>Check the order or review the data in the backend.</p>
                                    </div>
                                )}
                                {(activeOrder.details || []).map((d: OrderDetailDTO) => {
                                    if (d.productId) {
                                        const p = indexProductsById()[d.productId];
                                        if (!p) return (
                                            <div key={`d-${d.id}`} className={styles.section}>
                                                <h4>Product #{d.productId}</h4>
                                                <div className={styles.info}>Product not found</div>
                                            </div>
                                        );
                                        return (
                                            <div key={`d-${d.id}`} className={styles.section}>
                                                <h4>{d.quantity}× {p.name}</h4>
                                                        <ul className={styles.checkboxList}>
                                                            {getProductIngredients(p).map((ing) => {
                                                                const ingId = String(ing.id ?? ing.name);
                                                                const key = `p:${p.id}:i:${ingId}`;
                                                                return (
                                                                    <li key={key}>
                                                                        <label className={styles.checkboxItem}>
                                                                            <input type="checkbox" checked={!!checkState[key]} onChange={() => toggleCheck(key)} />
                                                                            <span>{ing.name}</span>
                                                                        </label>
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                            </div>
                                        );
                                    }
                                    if (d.comboId) {
                                        const combo = indexCombosById()[d.comboId];
                                        return (
                                            <div key={`d-${d.id}`} className={styles.section}>
                                                <h4>{d.quantity}× {combo ? combo.name : `Combo #${d.comboId}`}</h4>
                                                {(combo?.products || []).map((cp: ComboProductEntry) => {
                                                    const p = indexProductsById()[cp.id];
                                                    const totalQty = (cp.quantity || 1) * (d.quantity || 1);
                                                    return (
                                                        <div key={`c-${combo?.id}-p-${cp.id}`} className={styles.subSection}>
                                                            <h5>{totalQty}× {p ? p.name : `Producto #${cp.id}`}</h5>
                                                                {p ? (
                                                                <ul className={styles.checkboxList}>
                                                                    {getProductIngredients(p).map((ing) => {
                                                                        const ingId = String(ing.id ?? ing.name);
                                                                        const key = `c:${combo?.id}:p:${p.id}:i:${ingId}`;
                                                                        return (
                                                                            <li key={key}>
                                                                                <label className={styles.checkboxItem}>
                                                                                    <input type="checkbox" checked={!!checkState[key]} onChange={() => toggleCheck(key)} />
                                                                                    <span>{ing.name}</span>
                                                                                </label>
                                                                            </li>
                                                                        );
                                                                    })}
                                                                </ul>
                                                            ) : (
                                                                <div className={styles.info}>Product not found</div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        )}
                    </div>
                    <div className={styles.prepFooter}>
                        <button type="button" className={styles.secondaryBtn} onClick={closeOverlay} disabled={submitting}>
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className={styles.primaryBtn}
                            onClick={handleFinalize}
                            disabled={!allChecked || submitting}
                            aria-disabled={!allChecked || submitting}
                            title={!allChecked ? 'Check all items before marking as ready' : 'Finalizing'}
                        >
                            {submitting ? 'Finalizing…' : 'Ready'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};