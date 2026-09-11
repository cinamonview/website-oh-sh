package com.ohsh.website.member;

import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service 
public class MemberService {
    
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
    /*
    Member.java
→ 회원 데이터의 모양

MemberRepository.java
→ 회원 데이터를 DB에 저장/조회하는 통로

MemberService.java
→ 회원가입, 로그인 같은 "회원 관련 업무" 처리
    */
}
