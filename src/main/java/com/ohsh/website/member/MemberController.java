package com.ohsh.website.member;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @PostMapping("/api/members")
    public ResponseEntity<?> save(
            @RequestBody Member member,
            HttpSession session) {

        Boolean emailVerified = (Boolean) session.getAttribute("emailVerified");
        String verifiedEmail = (String) session.getAttribute("emailVerifyEmail");

        if (!Boolean.TRUE.equals(emailVerified) || !member.getEmail().equals(verifiedEmail)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "이메일 인증을 완료해주세요."));
        }

        return ResponseEntity.ok(memberService.save(member));
    }

    @GetMapping("/api/members/check-login-id")
    public boolean checkLoginId(@RequestParam("loginId") String loginId) {
        return memberService.checkLoginId(loginId);
    }

    @PostMapping("/api/members/login")
    public Map<String, Object> login(
            @RequestBody Map<String, String> loginRequest,
            HttpSession session) {
        String loginId = loginRequest.get("loginId");
        String password = loginRequest.get("password");

        boolean success = memberService.login(loginId, password);

        if (success) {
            session.setAttribute("loginId", loginId);
            return Map.of(
                "success", true,
                "message", "로그인 성공"
            );
        } else {
            return Map.of(
                "success", false,
                "message", "아이디 또는 비밀번호가 올바르지 않습니다."
            );
        }
    }

    @GetMapping("/api/members/session")
    public Map<String, Object> getSession(HttpSession session) {
        String loginId = (String) session.getAttribute("loginId");

        if (loginId != null) {
            return Map.of(
                "loggedIn", true,
                "loginId", loginId
            );
        } else {
            return Map.of(
                "loggedIn", false
            );
        }
    }

    @PostMapping("/api/members/logout")
    public Map<String, Object> logout(HttpSession session) {
        session.invalidate();
        return Map.of(
            "success", true,
            "message", "로그아웃 성공"
        );
    }

    @GetMapping("/api/members/me")
    public ResponseEntity<?> getMe(HttpSession session) {
        String loginId = (String) session.getAttribute("loginId");

        if (loginId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "로그인이 필요합니다."));
        }

        Optional<Member> memberOptional = memberService.findByLoginId(loginId);
        if (memberOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "로그인이 필요합니다."));
        }

        Member member = memberOptional.get();

        Map<String, Object> memberInfo = new HashMap<>();
        memberInfo.put("id", member.getId());
        memberInfo.put("loginId", member.getLoginId());
        memberInfo.put("name", member.getName());
        memberInfo.put("email", member.getEmail());
        memberInfo.put("phone", member.getPhone());
        memberInfo.put("createdAt", member.getCreatedAt());
        memberInfo.put("updatedAt", member.getUpdatedAt());

        return ResponseEntity.ok(memberInfo);
    }

    @PutMapping("/api/members/me")
    public ResponseEntity<?> updateMe(
            @RequestBody Map<String, String> updateRequest,
            HttpSession session) {
        String loginId = (String) session.getAttribute("loginId");

        if (loginId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "로그인이 필요합니다."));
        }

        String name = updateRequest.get("name");
        String email = updateRequest.get("email");
        String phone = updateRequest.get("phone");

        Optional<Member> updatedMemberOptional = memberService.updateMember(loginId, name, email, phone);
        if (updatedMemberOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "로그인이 필요합니다."));
        }

        Member member = updatedMemberOptional.get();

        Map<String, Object> memberInfo = new HashMap<>();
        memberInfo.put("id", member.getId());
        memberInfo.put("loginId", member.getLoginId());
        memberInfo.put("name", member.getName());
        memberInfo.put("email", member.getEmail());
        memberInfo.put("phone", member.getPhone());
        memberInfo.put("createdAt", member.getCreatedAt());
        memberInfo.put("updatedAt", member.getUpdatedAt());

        return ResponseEntity.ok(memberInfo);
    }

    @PutMapping("/api/members/password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> passwordRequest,
            HttpSession session) {
        String loginId = (String) session.getAttribute("loginId");

        if (loginId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "로그인이 필요합니다."));
        }

        String currentPassword = passwordRequest.get("currentPassword");
        String newPassword = passwordRequest.get("newPassword");

        boolean memberExists = memberService.findByLoginId(loginId).isPresent();
        if (!memberExists) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "로그인이 필요합니다."));
        }

        boolean changed = memberService.changePassword(loginId, currentPassword, newPassword);

        if (!changed) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "현재 비밀번호가 올바르지 않습니다."));
        }

        return ResponseEntity.ok(Map.of("success", true, "message", "비밀번호가 변경되었습니다."));
    }
}