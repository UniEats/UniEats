import type { ReactNode } from "react";

import { Modal } from "@/components/Modal/Modal";

import styles from "./PaymentModal.module.css";

export type PaymentMethod = "credit" | "cash" | "qr";

type PaymentModalProps = {
  method: PaymentMethod;
  onClose: () => void;
  onConfirm: (method: PaymentMethod) => void;
};

const QR_PLACEHOLDER = "https://pngimg.com/d/qr_code_PNG33.png";

const renderPaymentView = (method: PaymentMethod): ReactNode => {
  if (method === "qr") {
    return (
      <div className={styles.paymentView}>
        <h4>Scan to Pay</h4>
        <p>Scan this QR code with your preferred payment app.</p>
        <img src={QR_PLACEHOLDER} alt="Mock QR Code" className={styles.qrCodeImage} />
      </div>
    );
  }

  if (method === "credit") {
    return (
      <div className={styles.paymentView}>
        <h4>Enter Card Details</h4>
        <form className={styles.mockForm}>
          <label htmlFor="card-number">Card Number</label>
          <input id="card-number" type="text" placeholder="**** **** **** ****" disabled />
          <label htmlFor="expiry">Expiry</label>
          <input id="expiry" type="text" placeholder="MM/YY" disabled />
          <label htmlFor="cvc">CVC</label>
          <input id="cvc" type="text" placeholder="***" disabled />
        </form>
      </div>
    );
  }

  if (method === "cash") {
    return (
      <div className={styles.paymentView}>
        <h4>Pay with Cash</h4>
        <p>Please pay at the counter when you pick up your order.</p>
      </div>
    );
  }

  return null;
};

export const PaymentModal = ({ method, onClose, onConfirm }: PaymentModalProps) => {
  return (
    <Modal onClose={onClose} ariaLabelledBy="payment-title">
      <h3 id="payment-title">Confirm Payment</h3>
      {renderPaymentView(method)}
      <div className={styles.modalActions}>
        <button onClick={onClose} className={styles.cancelButton}>
          Cancel
        </button>
        <button onClick={() => onConfirm(method)} className={styles.confirmButton}>
          Confirm Payment
        </button>
      </div>
    </Modal>
  );
};
