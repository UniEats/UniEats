import { useState, useEffect } from "react";
import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useSignup } from "@/services/UserServices";
import { Signup } from "../components/Signup/Signup";
import styles from "./SignupScreen.module.css";

export const SignupScreen = () => {
    const [successMessage, setSuccessMessage] = useState("");
    const { mutate, error, data, isSuccess, isPending } = useSignup();

    useEffect(() => {
        if (isSuccess && data?.message && !error) {
            setSuccessMessage(data.message);
            const timer = setTimeout(() => {
                window.location.href = "/verify";
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess, data]);

    return (
        <CommonLayout>
            <div className={styles.signupContainer}>
                <div className={styles.signupCard}>
                    <h1>Registro</h1>
                    <Signup onSubmit={mutate} submitError={error} isPending={isPending} />
                    {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
                    <a href="/login" className={styles.loginLink}>
                        Have an account? Log in
                    </a>
                </div>
            </div>
        </CommonLayout>
    );
};
