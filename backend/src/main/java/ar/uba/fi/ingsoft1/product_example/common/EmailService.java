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
        message.setSubject("Email verification");
        message.setText("Your verification code is: " + code);
        mailSender.send(message);
    }

    public void sendPasswordResetEmail(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Password recovery");
        message.setText(
            "Your verification code to recover your password is: " +
                code +
                "\n\n" +
                "If you did not request to recover your password, ignore this message."
        );
        mailSender.send(message);
    }

    public void sendAccountLockedEmail(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your account has been blocked [FIUBA Dining Hall]");
        message.setText(
            "We detected the limit of failed login attempts for your account.\n\n" +
                "For your security, we have temporarily blocked your account.\n\n" +
                "To unlock it, please reset your password using the following verification code:\n\n" +
                "Verification code\n: " +
                code +
                "\n\n" +
                "You can change it at /reset-password \n\n" +
                "Even if you haven't tried to log in, we recommend changing your password anyway to protect your account."
        );
        mailSender.send(message);
    }
}
