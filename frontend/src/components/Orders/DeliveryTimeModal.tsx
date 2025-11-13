import { useAppForm } from '@/config/use-app-form';
import styles from './DeliveryTimeModal.module.css';

type Props = {
  orderId: number;
  onSubmit: (isoDateTime: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
};

type DeliveryTimeFormValues = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
};

const now = new Date();

export const DeliveryTimeModal = ({ orderId, onSubmit, onCancel, isSubmitting }: Props) => {

  const form = useAppForm({
    defaultValues: {
      year: now.getFullYear().toString(),
      month: (now.getMonth() + 1).toString().padStart(2, '0'),
      day: now.getDate().toString().padStart(2, '0'),
      hour: now.getHours().toString().padStart(2, '0'),
      minute: now.getMinutes().toString().padStart(2, '0'),
    } as DeliveryTimeFormValues,
    onSubmit: ({ value }) => {
      const { year, month, day, hour, minute } = value;
      const formattedDateTime = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
      const dateObject = new Date(formattedDateTime);
      onSubmit(dateObject.toISOString());
    },
  });

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Estimate Delivery Time for Order #{orderId}</h3>
        <form.AppForm>
          <form.FormContainer extraError={null}>
            <div className={styles.fieldGroup}>
              <form.AppField
                name="year"
                children={(field) => <field.TextField label="Year" />}
              />
              <form.AppField
                name="month"
                children={(field) => <field.TextField label="Month" />}
              />
              <form.AppField
                name="day"
                children={(field) => <field.TextField label="Day" />}
              />
            </div>
            <div className={styles.fieldGroup}>
              <form.AppField
                name="hour"
                children={(field) => <field.TextField label="Hour" />}
              />
              <form.AppField
                name="minute"
                children={(field) => <field.TextField label="Minute" />}
              />
            </div>

            <div className={styles.actions}>
              <form.Button
                label="Cancel"
                type="button"
                onClick={onCloseModal}
              />
              <form.Button
                label="Confirm"
                loadingMessage="Confirming..."
                isPending={isSubmitting}
              />
            </div>
          </form.FormContainer>
        </form.AppForm>
      </div>
    </div>
  );

  function onCloseModal() {
    onCancel();
  }
};