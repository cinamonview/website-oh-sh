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

    public void sendTemporaryPassword(String toEmail, String temporaryPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("[website-oh-sh] 임시 비밀번호 안내");
        message.setText(
            "안녕하세요.\n\n" +
            "비밀번호 찾기 요청에 따라 임시 비밀번호를 발급해 드립니다.\n\n" +
            "임시 비밀번호: " + temporaryPassword + "\n\n" +
            "임시 비밀번호로 로그인한 후 MyPage에서 새로운 비밀번호로 변경해 주세요.\n\n" +
            "본인이 요청하지 않은 경우 비밀번호를 변경해 주세요."
        );
        mailSender.send(message);
    }
}
