import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { Login } from "@/components/Login/Login";
import { normalizeRole, useToken } from "@/services/TokenContext";
import { useLogin } from "@/services/UserServices";
import { useLocation } from "wouter";
import styles from "./LoginScreen.module.css";
import { LoginRequest } from "@/models/Login";

export const LoginScreen = () => {
  const { mutate, error } = useLogin();
  const [, setTokenState] = useToken();
  const [, setLocation] = useLocation();

  const handleLogin = (loginData: LoginRequest) => {
    mutate(loginData, {
      onSuccess: (tokens) => {
        setTokenState({ state: "LOGGED_IN", tokens });

        const role = normalizeRole(tokens.role);
        if (role === "ROLE_STAFF") {
          setLocation("/kitchen");
        } else {
          setLocation("/");
        }
      },
    });
  };

  return (
    <CommonLayout>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <h1>Log In</h1>
          <Login onSubmit={handleLogin} submitError={error} />
          <a href="/signup" className={styles.signupLink}>
            Don't have an account? Sign up
          </a>
        </div>
      </div>
    </CommonLayout>
  );
};
