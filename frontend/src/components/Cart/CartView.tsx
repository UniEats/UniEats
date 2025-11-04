import React from 'react';
import { useCart, CartItem } from './Cart';
import { useProducts, MenuItem } from '../Product/ProductContext';
import { OrderService } from '../../services/OrderService';
import { Combo } from '@/models/Combo';
import styles from './CartView.module.css';
import type { ComboProduct } from "@/models/Combo";

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

    const checkStock = (): string[] => {
        const outOfStock: string[] = [];

        validItems.forEach(item => {
            if (item.type === "product") {
                const product = productsMap[item.id];
                if (product && product.stock < item.quantity) {
                    outOfStock.push(product.name);
                }
            } else if (item.type === "combo") {
                const combo = combosMap[item.id];
                if (combo) {
                    const missing = combo.products.some((p: ComboProduct) => {
                        const product = productsMap[p.id];
                        return product && product.stock < p.quantity * item.quantity;
                    });
                    if (missing) {
                        outOfStock.push(combo.name);
                    }
                }
            }
        });

        return outOfStock;
    };



    const handleCheckout = async () => {
        try {
            const outOfStock = checkStock();
            if (outOfStock.length > 0) {
                alert(`There is not stock enough for: ${outOfStock.join(", ")}`);
                return;
            }

            const orderDetails = validItems.map((item: CartItem) => {
                const product = item.type === 'product' ? productsMap[item.id] : undefined;
                const combo = item.type === 'combo' ? combosMap[item.id] : undefined;
                const price = product ? product.price : combo ? combo.price : 0;
                return {
                    productId: item.type === 'product' ? item.id : null,
                    comboId: item.type === 'combo' ? item.id : null,
                    quantity: item.quantity,
                    price,
                    discount: 0
                };
            });

            const order = await OrderService.createOrder({ details: orderDetails });
            await OrderService.confirmOrder(order.id);

            clearCart();
            alert('Order Confirmed! The kitchen staff will start preparing it soon.');
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            console.error("Error processing order:", err);
            alert(err.response?.data?.message || "Error processing order. Please retry later.");
        }
    };

    if (validItems.length === 0) {
        return <div className={styles.emptyCart}>Your cart is empty</div>;
    }

    return (
        <div className={styles.cartContainer}>
            <h2>Your order</h2>
            <div className={styles.cartItems}>
                {validItems.map((item: CartItem) => {
                    const product = item.type === 'product' ? (productsMap[item.id] as MenuItem | undefined) : undefined;
                    const combo = item.type === 'combo' ? (combosMap[item.id] as Combo | undefined) : undefined;
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