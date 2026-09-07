package com.ohsh.website;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TestMemberRepository extends JpaRepository<TestMember, Long> {
}