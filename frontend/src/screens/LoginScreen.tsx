import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { Login } from "@/components/Login/Login";
import { useLogin } from "@/services/UserServices";
import { useLocation } from "wouter";
import styles from "./LoginScreen.module.css";

export const LoginScreen = () => {
  const { mutate, error, isPending } = useLogin();
  const [, navigate] = useLocation();

  const handleSubmit = (credentials: { username: string; password: string }) => {
    mutate(credentials, {
      onSuccess: () => {
        navigate("/"); 
      }
    });
  };

  return (
    <CommonLayout>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <h1>Log In</h1>
          <Login onSubmit={handleSubmit} submitError={error} isPending={isPending} />
          <a href="/signup" className={styles.signupLink}>
            Don't have an account? Sign up
          </a>
        </div>
      </div>
    </CommonLayout>
  );
};
