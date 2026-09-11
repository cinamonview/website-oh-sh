package com.ohsh.website.member;

import jakarta.servlet.http.HttpSession;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EmailVerificationController {

    private final EmailService emailService;

    public EmailVerificationController(EmailService emailService) {
        this.emailService = emailService;
    }

    // 인증번호 발송
    @PostMapping("/api/email/send-code")
    public ResponseEntity<?> sendCode(
            @RequestBody Map<String, String> request,
            HttpSession session) {

        String email = request.get("email");

        if (email == null || email.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "이메일을 입력해주세요."));
        }

        // 6자리 인증번호 생성
        String code = String.format("%06d", new SecureRandom().nextInt(1_000_000));

        // 세션에 인증 정보 저장
        session.setAttribute("emailVerifyCode", code);
        session.setAttribute("emailVerifyEmail", email);
        session.setAttribute("emailVerifyExpiry", LocalDateTime.now().plusMinutes(5));
        session.setAttribute("emailVerified", false);

        try {
            emailService.sendVerificationCode(email, code);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "이메일 발송에 실패했습니다."));
        }

        return ResponseEntity.ok(Map.of("success", true, "message", "인증번호가 발송되었습니다."));
    }

    // 인증번호 확인
    @PostMapping("/api/email/verify-code")
    public ResponseEntity<?> verifyCode(
            @RequestBody Map<String, String> request,
            HttpSession session) {

        String inputCode = request.get("code");

        String savedCode = (String) session.getAttribute("emailVerifyCode");
        LocalDateTime expiry = (LocalDateTime) session.getAttribute("emailVerifyExpiry");

        if (savedCode == null || expiry == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "인증번호를 먼저 발송해주세요."));
        }

        if (LocalDateTime.now().isAfter(expiry)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "인증번호가 만료되었습니다. 다시 발송해주세요."));
        }

        if (!savedCode.equals(inputCode)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "인증번호가 올바르지 않습니다."));
        }

        // 인증 완료 표시
        session.setAttribute("emailVerified", true);

        return ResponseEntity.ok(Map.of("success", true, "message", "이메일 인증이 완료되었습니다."));
    }
}
