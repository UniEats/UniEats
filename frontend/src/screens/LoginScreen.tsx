import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { Login } from "@/components/Login/Login";
import { useLogin } from "@/services/UserServices";
import styles from "./LoginScreen.module.css";

export const LoginScreen = () => {
  const { mutate, error } = useLogin();
  return (
    <CommonLayout>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <h1>Log In</h1>
          <Login onSubmit={mutate} submitError={error} />
          <a href="/signup" className={styles.signupLink}>
            Don't have an account? Sign up
          </a>
        </div>
      </div>
    </CommonLayout>
  );
};
