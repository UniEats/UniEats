import { PropsWithChildren, useEffect } from "react";
import { createPortal } from "react-dom";

import styles from "./Modal.module.css";

type ModalProps = {
  onClose: () => void;
  ariaLabelledBy?: string;
};

export const Modal = ({ onClose, ariaLabelledBy, children }: PropsWithChildren<ModalProps>) => {
  const labelledBy = ariaLabelledBy;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onClick={() => {
        onClose();
      }}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <button
          type="button"
          className={styles.closeButton}
          aria-label="Close modal"
          onClick={() => {
            onClose();
          }}
        >
          ×
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
};
