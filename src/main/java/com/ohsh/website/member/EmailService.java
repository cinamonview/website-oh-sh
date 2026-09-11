package com.ohsh.website.member;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationCode(String toEmail, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("[website-oh-sh] 이메일 인증번호 안내");
        message.setText(
            "안녕하세요.\n\n" +
            "이메일 인증번호는 다음과 같습니다.\n\n" +
            "인증번호: " + code + "\n\n" +
            "인증번호는 5분간 유효합니다.\n\n" +
            "본인이 요청하지 않은 경우 이 메일을 무시해 주세요."
        );
        mailSender.send(message);
    }
}
