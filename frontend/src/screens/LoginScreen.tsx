import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { Login } from "@/components/Login/Login";
import { normalizeRole, useToken } from "@/services/TokenContext";
import { useLogin } from "@/services/UserServices";
import { useLocation } from "wouter";
import styles from "./LoginScreen.module.css";
import { LoginRequest } from "@/models/Login";

export const LoginScreen = () => {
  const { mutate, error, isPending } = useLogin();
  return (
    <CommonLayout>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <h1>Log In</h1>
          <Login onSubmit={mutate} submitError={error} isPending={isPending} />
          <a href="/signup" className={styles.signupLink}>
            Don't have an account? Sign up
          </a>
        </div>
      </div>
    </CommonLayout>
  );
};
