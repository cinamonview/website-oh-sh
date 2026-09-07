# PRD (Product Requirements Document)
## website-oh-sh 개인 웹사이트 프로젝트

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 프로젝트명 | website-oh-sh |
| 기간 | 2026.09.07(월) ~ 09.09(수) (+α는 진행상황에 따라 결정) |
| 발표일 | 2026.09.10 |
| 주제 | Spring Boot + MariaDB + React를 활용한 개인 웹사이트 |
| 목적 | 회원 인증, 게시판, 부가기능을 포함한 풀스택 웹 애플리케이션 구현 |

---

## 2. 기술 스택

| 구분 | 기술 |
|---|---|
| Frontend | React (Vite), React Router DOM, Zustand, HTML5, CSS3, JavaScript |
| Backend | Spring Boot 4.1.1 (Java 21) |
| DB | MariaDB |
| ORM/Mapper | Spring Data JPA, MyBatis |
| 인증/보안 | Spring Security |
| 기타 | Spring Mail (이메일 인증/비밀번호 찾기), Lombok |
| 빌드 도구 | Gradle |

---

## 3. 프로젝트 구조

```
website-oh-sh/                      ← Spring Boot 프로젝트 루트
├── build.gradle
├── src/
│   └── main/
│       ├── java/com/ohsh/website/
│       │   ├── WebsiteApplication.java
│       │   ├── SecurityConfig.java       (인증/인가 설정)
│       │   ├── WebCorsConfig.java        (CORS 설정)
│       │   ├── member/                   (회원 도메인)
│       │   ├── board/                    (게시판 도메인)
│       │   └── ...
│       └── resources/
│           ├── application.properties
│           └── static/                   ← React 빌드 결과물 위치
└── frontend-react/                 ← React 프로젝트
    ├── vite.config.js              (outDir → ../src/main/resources/static)
    ├── src/
    │   ├── App.jsx
    │   ├── pages/
    │   └── components/
    └── ...
```

---

## 4. 환경 설정 현황 (완료됨)

- [x] Spring Boot 4.1.1 + Java 21 프로젝트 생성
- [x] MariaDB 데이터베이스(`website`) 및 전용 계정(`ohsh_user`) 생성
- [x] Spring Data JPA / JDBC / MyBatis 연동
- [x] Spring Security 기본 설정 + API 경로 permitAll 처리
- [x] React(Vite) 프로젝트 생성 (`frontend-react`)
- [x] CORS 설정 (`localhost:5173` 허용)
- [x] React → Spring Boot API 연동 테스트 완료 (`/api/hello`)

---

## 5. 기능 요구사항

### 5.1 회원 인증

| 기능 | 세부 내용 |
|---|---|
| 회원가입 | 아이디, 패스워드, 이름, 이메일, 전화번호 입력 |
| 유효성 검사 | 아이디 중복확인, 비밀번호 확인(재입력) |
| 이메일 인증 | 회원가입 시 이메일 인증 절차 포함 |
| 로그인 / 로그아웃 | 세션 또는 토큰 기반 인증 |
| 회원정보 수정 | 로그인 후 본인 정보 변경 가능 |

**DB 테이블(안): `member`**

| 컬럼명 | 타입 | 설명 |
|---|---|---|
| member_id | VARCHAR | PK, 로그인 아이디 |
| password | VARCHAR | 암호화 저장 |
| name | VARCHAR | 이름 |
| email | VARCHAR | 이메일 (인증용) |
| phone | VARCHAR | 전화번호 |
| email_verified | BOOLEAN | 이메일 인증 여부 |
| created_at | DATETIME | 가입일 |

---

### 5.2 게시판

#### (1) 자유게시판 — 비회원제
- 목록 / 읽기 / 쓰기 / 수정 / 삭제 (CRUD)
- 파일 첨부 기능 없음
- **React로 화면 제작**
- 페이징 기능 포함

#### (2) Q&A 게시판 — 회원제
- CRUD 기본 기능
- 댓글 기능 (열람 페이지 하단에 표시)
- 댓글 입력 / 수정 / 삭제 지원
- 페이징 기능 포함

#### (3) 자료실 게시판 — 회원제
- 첨부파일 타입별 출력 분기
  - 이미지(png, gif, jpg 등) → `<img>` 태그 출력
  - 동영상(mp4, avi 등) → `<video>` 태그 출력
  - 음원(mp3 등) → `<audio>` 태그 출력
  - 그 외 → 다운로드 링크만 제공
- 페이징 기능 포함

**DB 테이블(안): `board`, `comment`, `attachment`**

| 테이블 | 주요 컬럼 |
|---|---|
| board | board_id(PK), board_type(자유/QNA/자료실), title, content, writer, view_count, like_count, created_at |
| comment | comment_id(PK), board_id(FK), writer, content, created_at |
| attachment | file_id(PK), board_id(FK), original_name, saved_path, file_type, file_size |

---

### 5.3 추가 기능

| 기능 | 세부 내용 |
|---|---|
| 쿠키1 - 조회수 중복 방지 | 게시물 조회수는 하루 1회만 증가 (새로고침 시 미증가) |
| 쿠키2 - 아이디 저장 | 로그인 페이지에서 아이디 저장 기능 |
| 비밀번호 찾기 | 이메일로 임시 비밀번호 발송 → 로그인 후 비밀번호 변경 유도, 발송 시 DB의 비밀번호도 즉시 갱신 |
| 좋아요 기능 | 게시물 읽기 화면에서 좋아요 클릭 시 카운트 +1 (`fetch()` 함수로 구현) |

---

## 6. 화면(UI) 참고 사이트

- Start Bootstrap
- Theme Wagon
- HTML5 UP
- Creative-Tim

각 템플릿 페이지 하단 "You can find the Github Repo here" 링크에서 소스 확인 가능.

---

## 7. 개발 우선순위 (제안)

1. DB 테이블 설계 확정 (member, board, comment, attachment)
2. 회원가입 / 로그인 / 로그아웃 API + 화면
3. 자유게시판 (비회원, React 제작) — 구조 검증용으로 우선 적합
4. Q&A 게시판 (회원제 + 댓글)
5. 자료실 게시판 (파일 업로드/타입별 출력)
6. 추가 기능 (쿠키, 비밀번호 찾기, 좋아요)
7. UI 템플릿 적용 및 전체 스타일링

---

## 8. 미확정 사항 (진행하며 결정 필요)

- [ ] 인증 방식: 세션 기반 vs JWT 토큰 기반
- [ ] 비밀번호 암호화 방식 (BCrypt 권장)
- [ ] 파일 업로드 저장 위치 (로컬 파일시스템 vs 별도 스토리지)
- [ ] 페이징 처리 방식 (Spring Data JPA Pageable vs MyBatis 수동 처리)
- [ ] React 상태관리 범위 (Zustand 사용 범위 설정)
