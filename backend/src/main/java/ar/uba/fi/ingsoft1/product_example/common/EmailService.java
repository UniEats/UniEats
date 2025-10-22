package ar.uba.fi.ingsoft1.product_example.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Verificación de correo");
        message.setText("Tu código de verificación es: " + code);
        mailSender.send(message);
    }

    public void sendPasswordResetEmail(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Recuperación de contraseña");
        message.setText(
            "Tu código de verificación para recuperar tu contraseña es: " +
                code +
                "\n\n" +
                "Si no solicitaste recuperar tu contraseña, ignora este mensaje."
        );
        mailSender.send(message);
    }

    public void sendAccountLockedEmail(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Tu cuenta ha sido bloqueada [Comedor FIUBA]");
        message.setText(
            "Detectamos el numero limite de intentos fallidos de inicio de sesión en tu cuenta.\n\n" +
                "Por tu seguridad, hemos bloqueado temporalmente tu cuenta.\n\n" +
                "Para desbloquearla, por favor reinicia tu contraseña usando el siguiente código de verificación:\n\n" +
                "Código de verificación: " +
                code +
                "\n\n" +
                "Puedes cambiarla en /reset-password \n\n" +
                "Si no intentaste iniciar sesión, te recomendamos cambiar tu contraseña de todos modos para proteger tu cuenta."
        );
        mailSender.send(message);
    }
}
