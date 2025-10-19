import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useSignup } from "@/services/UserServices";

import { Signup } from "../components/Signup/Signup";
import styles from "./SignupScreen.module.css";

export const SignupScreen = () => {
    const { mutate, error } = useSignup();

    return (
        <CommonLayout>
            <div className={styles.signupContainer}>
                <div className={styles.signupCard}>
                    <h1>Registro</h1>
                    <Signup onSubmit={mutate} submitError={error} />
                    <a href="/login" className={styles.loginLink}>
                        ¿Ya tenés cuenta? Iniciá sesión
                    </a>
                </div>
            </div>
        </CommonLayout>
    );
};