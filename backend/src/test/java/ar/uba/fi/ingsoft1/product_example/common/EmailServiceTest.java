package ar.uba.fi.ingsoft1.product_example.common;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testSendVerificationEmail() {
        String to = "user@test.com";
        String code = "123456";

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);

        emailService.sendVerificationEmail(to, code);

        verify(mailSender, times(1)).send(captor.capture());
        SimpleMailMessage msg = captor.getValue();

        assertEquals(to, msg.getTo()[0]);
        assertEquals("Email verification", msg.getSubject());
        assertEquals("Your verification code is: " + code, msg.getText());
    }

    @Test
    void testSendPasswordResetEmail() {
        String to = "reset@test.com";
        String code = "987654";

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);

        emailService.sendPasswordResetEmail(to, code);

        verify(mailSender, times(1)).send(captor.capture());
        SimpleMailMessage msg = captor.getValue();

        assertEquals(to, msg.getTo()[0]);
        assertEquals("Password recovery", msg.getSubject());
        assert msg.getText().contains(code);
    }

    @Test
    void testSendAccountLockedEmail() {
        String to = "locked@test.com";
        String code = "LOCKED-1";

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);

        emailService.sendAccountLockedEmail(to, code);

        verify(mailSender, times(1)).send(captor.capture());
        SimpleMailMessage msg = captor.getValue();

        assertEquals(to, msg.getTo()[0]);
        assertEquals("Your account has been blocked [FIUBA Dining Hall]", msg.getSubject());
        assert msg.getText().contains(code);
        assert msg.getText().contains("temporarily blocked");
    }

    @Test
    void testSendVerificationEmail_WhenMailServerFails_ThrowsException() {
        String to = "user@test.com";
        String code = "123456";

        doThrow(new MailSendException("Connection failed"))
                .when(mailSender).send(any(SimpleMailMessage.class));

        Assertions.assertThrows(MailSendException.class, () ->
                emailService.sendVerificationEmail(to, code));
    }

    @Test
    void testSendPasswordResetEmail_WhenMailServerFails_ThrowsException() {
        String to = "reset@test.com";
        String code = "999999";

        doThrow(new MailSendException("Connection failed"))
                .when(mailSender).send(any(SimpleMailMessage.class));

        Assertions.assertThrows(MailSendException.class, () ->
                emailService.sendPasswordResetEmail(to, code));
    }
}
