package com.ohsh.website.member;

import java.security.SecureRandom;
import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service 
public class MemberService {

    private static final String TEMPORARY_PASSWORD_CHARACTERS =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final int TEMPORARY_PASSWORD_LENGTH = 12;
    private final SecureRandom secureRandom = new SecureRandom();
    
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    public MemberService(MemberRepository memberRepository, PasswordEncoder passwordEncoder){
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Member save(Member member){
        member.setPassword(passwordEncoder.encode(member.getPassword()));
        return memberRepository.save(member);
    }

    public boolean checkLoginId(String loginId) {
        return memberRepository.existsByLoginId(loginId);
    }

    public Optional<String> resetPassword(String loginId, String email) {
        return memberRepository.findByLoginId(loginId)
                .filter(member -> member.getEmail().equals(email))
                .map(member -> {
                    String temporaryPassword = generateTemporaryPassword();
                    member.setPassword(passwordEncoder.encode(temporaryPassword));
                    memberRepository.save(member);
                    return temporaryPassword;
                });
    }

    public boolean login(String loginId, String rawPassword) {
        Optional<Member> memberOptional = memberRepository.findByLoginId(loginId);
        if (memberOptional.isEmpty()) {
            return false;
        }

        Member member = memberOptional.get();
        return passwordEncoder.matches(rawPassword, member.getPassword());
    }

    public Optional<Member> findByLoginId(String loginId) {
        return memberRepository.findByLoginId(loginId);
    }

    public Optional<Member> updateMember(String loginId, String name, String email, String phone) {
        Optional<Member> memberOptional = memberRepository.findByLoginId(loginId);
        if (memberOptional.isEmpty()) {
            return Optional.empty();
        }

        Member member = memberOptional.get();
        member.setName(name);
        member.setEmail(email);
        member.setPhone(phone);

        return Optional.of(memberRepository.save(member));
    }

    public boolean changePassword(String loginId, String currentPassword, String newPassword) {
        Optional<Member> memberOptional = memberRepository.findByLoginId(loginId);
        if (memberOptional.isEmpty()) {
            return false;
        }

        Member member = memberOptional.get();

        if (!passwordEncoder.matches(currentPassword, member.getPassword())) {
            return false;
        }

        member.setPassword(passwordEncoder.encode(newPassword));
        memberRepository.save(member);

        return true;
    }

    private String generateTemporaryPassword() {
        StringBuilder temporaryPassword = new StringBuilder(TEMPORARY_PASSWORD_LENGTH);
        for (int index = 0; index < TEMPORARY_PASSWORD_LENGTH; index++) {
            int characterIndex = secureRandom.nextInt(TEMPORARY_PASSWORD_CHARACTERS.length());
            temporaryPassword.append(TEMPORARY_PASSWORD_CHARACTERS.charAt(characterIndex));
        }
        return temporaryPassword.toString();
    }
    /*
    Member.java
→ 회원 데이터의 모양

MemberRepository.java
→ 회원 데이터를 DB에 저장/조회하는 통로

MemberService.java
→ 회원가입, 로그인 같은 "회원 관련 업무" 처리
    */
}
