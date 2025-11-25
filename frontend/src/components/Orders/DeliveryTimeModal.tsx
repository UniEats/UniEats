import { z } from "zod";

import { useAppForm } from "@/config/use-app-form";

import styles from "./DeliveryTimeModal.module.css";

type Props = {
  orderId: number;
  onSubmit: (isoDateTime: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
};

const DurationSchema = z.object({
  minutes: z.number().min(1, "Duration must be at least 1 minute").max(1440, "Duration cannot exceed 24 hours"),
});

const PRESET_TIMES = [15, 30, 45, 60];

export const DeliveryTimeModal = ({ orderId, onSubmit, onCancel, isSubmitting }: Props) => {
  const calculateCompletionTime = (mins: number) => {
    const now = new Date();
    const future = new Date(now.getTime() + mins * 60000);
    return future.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const form = useAppForm({
    defaultValues: {
      minutes: 30,
    },
    validators: {
      onChange: DurationSchema,
    },
    onSubmit: ({ value }) => {
      const now = new Date();
      const deliveryTime = new Date(now.getTime() + value.minutes * 60000);
      onSubmit(deliveryTime.toISOString());
    },
  });

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <span className={styles.icon}>👨‍🍳</span>
        <h3>Start Preparation</h3>
        <p className={styles.subtitle}>How long will order #{orderId} take?</p>

        <form.AppForm>
          <form.FormContainer extraError={null}>
            <form.AppField name="minutes">
              {(field) => (
                <div>
                  <div className={styles.inputContainer}>
                    <input
                      type="number"
                      className={styles.durationInput}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      min={0} // Changed from 1 to 0 to align with step={5} (0, 5, 10, 15...)
                      step={5}
                      autoFocus
                    />
                    <span className={styles.unit}>min</span>
                  </div>

                  <div className={styles.presets}>
                    {PRESET_TIMES.map((time) => (
                      <button
                        key={time}
                        type="button"
                        className={styles.presetChip}
                        onClick={() => field.handleChange(time)}
                      >
                        {time}m
                      </button>
                    ))}
                  </div>

                  <div className={styles.timePreview}>
                    <span className={styles.previewLabel}>Estimated completion:</span>
                    <span className={styles.previewTime}>{calculateCompletionTime(field.state.value || 0)}</span>
                  </div>
                </div>
              )}
            </form.AppField>

            <div className={styles.actions}>
              <form.Button label="Cancel" type="button" onClick={onCancel} />
              <form.Button label="Confirm & Start" loadingMessage="Starting..." isPending={isSubmitting} />
            </div>
          </form.FormContainer>
        </form.AppForm>
      </div>
    </div>
  );
};
