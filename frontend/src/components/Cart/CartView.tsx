import React from 'react';
import { useCart } from './Cart';
import { useProducts } from '../Product/ProductContext';
import { OrderService } from '../../services/OrderService';
import styles from './CartView.module.css';

export const CartView: React.FC = () => {
    const { validItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
    const { productsMap, combosMap } = useProducts();

    const handleQuantityChange = (id: number, type: "product" | "combo", newQuantity: number) => {
        if (newQuantity < 1) {
            removeFromCart(id, type);
        } else {
            updateQuantity(id, type, newQuantity);
        }
    };

    const handleCheckout = async () => {
        try {
            const orderDetails = validItems.map((item: any) => ({
                productId: item.type === 'product' ? item.id : null,
                comboId: item.type === 'combo' ? item.id : null,
                quantity: item.quantity,
                price: item.type === 'product' ? productsMap[item.id].price : combosMap[item.id].price,
                discount: 0
            }));

                const order = await OrderService.createOrder({ details: orderDetails });
                // Confirmar la orden inmediatamente después de crearla (simular pago)
                await OrderService.confirmOrder(order.id);
            clearCart();
            alert('¡Pedido confirmado! El personal de cocina comenzará a prepararlo pronto.');
        } catch (error) {
            console.error('Error al procesar el pedido:', error);
            alert('Hubo un error al procesar tu pedido. Por favor intenta nuevamente.');
        }
    };

    if (validItems.length === 0) {
        return <div className={styles.emptyCart}>Your cart is empty</div>;
    }

    return (
        <div className={styles.cartContainer}>
            <h2>Your order</h2>
            <div className={styles.cartItems}>
                {validItems.map((item: any) => {
                    const product = item.type === 'product' ? productsMap[item.id] : null;
                    const combo = item.type === 'combo' ? combosMap[item.id] : null;
                    const name = product ? product.name : combo ? combo.name : '';
                    const price = product ? product.price : combo ? combo.price : 0;

                    return (
                        <div key={`${item.type}-${item.id}`} className={styles.cartItem}>
                            <div className={styles.itemInfo}>
                                <span className={styles.itemName}>{name}</span>
                                <span className={styles.itemPrice}>${price * item.quantity}</span>
                            </div>
                            <div className={styles.itemControls}>
                                <button 
                                    onClick={() => handleQuantityChange(item.id, item.type, item.quantity - 1)}
                                    className={styles.quantityButton}
                                >
                                    -
                                </button>
                                <span className={styles.quantity}>{item.quantity}</span>
                                <button 
                                    onClick={() => handleQuantityChange(item.id, item.type, item.quantity + 1)}
                                    className={styles.quantityButton}
                                >
                                    +
                                </button>
                                <button 
                                    onClick={() => removeFromCart(item.id, item.type)}
                                    className={styles.removeButton}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className={styles.cartFooter}>
                <div className={styles.total}>
                    <span>Total:</span>
                    <span>${totalPrice}</span>
                </div>
                <button 
                    onClick={handleCheckout}
                    className={styles.checkoutButton}
                >
                    Confirm and Pay
                </button>
            </div>
        </div>
    );
};