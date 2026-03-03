# GitPoor

> GitHub 커밋 기반 스터디 그룹 관리 서비스\
> "코딩 안 하면 벌금 낸다"를 실제 데이터로 구현한 프로젝트

---

## 1. 프로젝트 소개

> 2026.01.13 ~ (진행중) \
> 개인 프로젝트 \
> 2026년 3월 N일 기준 1차 MVP 완성 \
> Link: https://gitpoor.vercel.app/

### 문제 정의

스터디 그룹에서 "정말 코딩했는지"를 객관적으로 확인하기 어렵다.

- 출석 체크는 신뢰도가 낮고
- 자기 보고 방식은 검증이 불가능하며
- 관리자가 직접 확인하는 방식은 지속 가능하지 않다

### 해결 방식

GitHub 커밋 데이터를 직접 수집하여:

- 개인 커밋 히스토리 시각화
- 그룹 단위 커밋 현황 추적
- 벌칙 시스템 기반 동기 부여 구조 구현

---

## 2. 1차 MVP 주요 기능

- GitHub OAuth 로그인 (Supabase Auth)
- 오늘 커밋 동기화 및 스트릭 시스템
- 월 단위 커밋 히스토리(잔디) 조회
- 그룹 생성 / 초대 / 나가기 / 삭제
- 그룹 멤버의 오늘 커밋 현황 확인
- 표준화된 API 응답 구조 및 에러 처리 체계

---

## 3. 아키텍처 설계

### 📌 설계 핵심

- **DB 접근은 `services/`에 집중**
- **페이지(Server Component)는 서비스 직접 호출**
- **버튼 액션(Client Component)은 `/api` 라우트를 통해 서비스 재사용**
- **RLS + service_role 조합으로 권한 제어**
- **초기 렌더에 필요한 데이터는 `page.tsx`에서 prefetch 후 Client Component에 `initialData`로 전달**
  - Client-side Waterfall(`useEffect` fetch)을 제거하여 초기 표시 지연을 줄임

---

### 🔹 Read 흐름 (SSR 중심)

```
page.tsx (Server Component)
↓
services/
↓
Supabase (DB)
```

- 서버에서 데이터를 포함한 HTML을 직접 생성
- 초기 Client-side Waterfall 제거
- 클라이언트 번들 최소화

---

### 🔹 Write 흐름 (REST API 기반)

```
Client Component (버튼 클릭)
↓
/ api route
↓
services/
↓
Supabase (DB)
↓
ApiResponse 반환
```

- 서비스 레이어는 `throw AppError`
- API Route는 `try/catch`로 `fail(code, message)` 변환
- 클라이언트는 `handleActionError`로 사용자 메시지 처리

---

## 4. Supabase RLS 설계 철학

- 기본 데이터 접근은 RLS로 통제
- 교차 조회(예: 그룹 멤버 커밋 조회)는 service_role 사용
- 단, service_role 실행 전 반드시 세션 기반 권한 검증 수행

---

## 5. 프로젝트 구조

### App Router 구조

```
src/app/
├── (main)/              # 공통 Header + BottomNav 레이아웃
│   ├── home/            # 대시보드 (프로필 + 그룹 리스트)
│   ├── history/         # 커밋 히스토리 (잔디 달력)
│   ├── groups/[id]/     # 그룹 상세
│   └── notifications/   # 초대 알림
├── (no-header)/         # Header 없는 레이아웃
│   └── groups/[id]/members/[memberId]/  # 멤버 커밋 상세
├── api/                 # REST API Route Handlers
│   ├── commits/         # 커밋 CRUD + 동기화
│   ├── groups/          # 그룹 CRUD + 탈퇴
│   └── invitations/     # 초대 발송 + 응답
└── auth/                # OAuth 콜백 + 로그아웃
```

### 전체 구조

```
git-poor-web/
├── src/
│   ├── app/                    # App Router 페이지 + API
│   ├── components/             # 공통 UI 컴포넌트
│   │   ├── common/             # Header, BottomNav
│   │   ├── providers/          # Context Provider
│   │   └── ui/                 # 범용 UI (Card, Button, Modal, Pagination)
│   ├── lib/                    # 유틸리티 + 인프라
│   │   ├── error/              # AppError, handleActionError
│   │   ├── http/               # ApiResponse 타입, response-service
│   │   ├── supabase/           # 클라이언트 (server, client, admin, middleware)
│   │   └── utils/              # 날짜, 인증, 캘린더, Git 정보, 성능 측정
│   ├── services/               # 비즈니스 로직 (서비스 레이어)
    └── types/                  # TypeScript 타입 정의
```

---

## 6. 2차 MVP 로드맵

- 벌칙 자동 집계 시스템
- 그룹 시간 정책 실제 반영
- 초대 코드 기반 가입 방식
- 잔디 개인화(커밋 기반 단계 조정)
- 그룹 관리 기능 확장

---

## 7. 기술 스택

- Next.js (App Router)
- React 19
- TypeScript
- Supabase (PostgreSQL + RLS + Auth)
- Tailwind CSS
- Octokit (GitHub API)

---

## 8. Troubleshooting

- [[에러 핸들링 구조 개선]](./docs/troubleshooting/error-handling-refactor.md) \
   페이지 크래시와 액션 실패 분리 설계
- [[HTTP 응답 구조 표준화]](./docs/troubleshooting/http-response-standardization.md) \
   ApiResponse 타입 + helper 함수 도입
- [[History 서버 Prefetch 성능 개선]](./docs/troubleshooting/history-server-prefetch-performance.md) \
   Client Waterfall 제거 (~602ms → ~3ms)

## Demo

본 서비스는 GitHub OAuth 기반 인증을 통해 실제 커밋 데이터를 연동하여 동작합니다.

실제 계정 연결 없이도 기능 흐름을 확인할 수 있도록 **Preview 모드**를 제공합니다.
Preview 모드에서는 읽기 전용 데이터로 홈, 히스토리, 그룹 기능을 체험할 수 있습니다.

- Preview 모드 제공 예정
- 시연 영상 링크 추가 예정
