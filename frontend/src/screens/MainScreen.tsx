import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { AdminDashboard } from "@/screens/AdminDashboard/AdminDashboard";
import { useUserRole } from "@/services/TokenContext";

import styles from "./MainScreen.module.css";

export const MainScreen = () => {
  const role = useUserRole();

  if (role !== "ROLE_ADMIN") {
    return (
      <CommonLayout>
        <section className={styles.infoBox}>
          <h2 className={styles.infoTitle}>Admin access required</h2>
          <p>Only administrators can create new ingredients, tags, and products.</p>
          <p>Please contact an administrator if you need changes made to the catalog.</p>
        </section>
      </CommonLayout>
    );
  }

  return <AdminDashboard />;
};
