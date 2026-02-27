# 🛠 Error Handling 리팩토링 – 설계 의사결정 과정

## 1. 문제 상황

프로젝트가 점점 확장되면서 에러 처리 방식이 통일되지 않은 문제가
발생했다.

- 어떤 서비스 함수는 `return null`로 실패를 처리
- 어떤 곳은 `console.error`만 남기고 흐름을 계속 진행
- 어떤 액션은 alert를 띄우고, 어떤 곳은 아무 처리 없이 종료
- 페이지 단위 크래시와 버튼 액션 실패가 같은 방식으로 처리됨

그 결과:

- 에러 발생 시 UX가 일관되지 않았고
- 디버깅 시 "이 에러가 어디에서 처리되어야 하는지" 판단하기 어려웠다
- RLS/권한 오류 등 도메인 에러를 체계적으로 분기할 수 없었다

---

## 2. 설계 고민

에러를 처리하는 코드를 작성하려다가 다음 질문이 생겼다.

> "모든 에러를 같은 방식으로 처리하는 게 맞는가?"

특히 다음 두 상황이 근본적으로 다르다는 것을 인지했다.

1.  페이지 렌더링 자체가 불가능한 경우 (크래시)
2.  버튼 클릭 등 사용자 액션이 실패한 경우

이 둘은 UX 관점에서 완전히 다른 처리 방식이 필요했다.

---

## 3. 설계 결정

에러를 다음 두 축으로 명확히 분리하기로 결정했다.

### 3.1 페이지 크래시

- 필수 데이터 fetch 실패
- 렌더링 중 발생한 런타임 오류
- 화면이 성립하지 않는 경우

-> `throw`를 사용하여 Next.js `error.tsx`에서 처리
-> 전체 페이지 fallback UI로 대응

---

### 3.2 사용자 액션 실패

- 버튼 클릭 실패
- 폼 제출 실패
- API 응답 실패
- 네트워크 오류

-> API 응답을 표준화하여 `{ success:false }` 형태로 반환
-> 클라이언트에서 `handleActionError`로 토스트/알럿 처리
-> 화면은 유지하고 사용자에게 다음 행동을 안내

---

## 4. 표준화 전략

### 4.1 ErrorCode 도입

에러를 문자열이 아닌 코드 기반으로 분기하도록 설계했다.

```ts
export type ErrorCode =
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'CONFLICT'
  | 'RATE_LIMIT'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR';
```

### 4.2 AppError 클래스 도입

서비스 레이어에서 에러를 throw할 때 사용할 표준 에러 클래스를 정의했다.

```ts
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

이를 통해:

- 서비스에서 `throw new AppError('NOT_FOUND', '그룹을 찾을 수 없습니다.')`처럼 코드와 메시지를 함께 던질 수 있게 됨
- API Route에서 `instanceof AppError`로 도메인 에러와 예상치 못한 에러를 명확히 분기
- 클라이언트까지 코드 기반 분기가 관통하는 구조 확보

## 4. 레이어별 책임 재정립

- Service: 실패 시 `throw new AppError(code, message)` (null로 숨기지 않음)
- API Route: throw를 catch하여 `fail(code, message, details)`로 변환
- Client Action: `handleActionError`로 사용자 메시지 처리
- Page (Server Component): 필수 데이터 실패 시 throw → error.tsx

서비스에서 이미 상황별 한국어 메시지를 정의하여 throw하기 때문에, `handleActionError`는 코드별 분기 없이 **API가 내려준 message를 그대로 표시**하는 단순한 구조로 충분했다.

---

## 5. 대시보드의 부분 에러 처리: Promise.allSettled 패턴

홈 대시보드는 여러 섹션(프로필, 그룹 목록 등)을 합쳐놓은 구조이기 때문에, 한 섹션의 데이터 fetch 실패가 전체 페이지 크래시로 이어지면 안 되었다.

이를 위해 `Promise.allSettled`를 활용한 부분 에러 처리 패턴을 도입했다.

```ts
const [groupsResult, commitResult, syncResult] = await Promise.allSettled([
  getMyGroupsService(user.id, 1, 10),
  getTodayCommitData(supabase, user.id),
  getLastSyncDate(supabase, user.id),
]);

// UNAUTHENTICATED면 전체 에러 페이지로
for (const result of [groupsResult, commitResult, syncResult]) {
  if (
    result.status === 'rejected' &&
    result.reason instanceof AppError &&
    result.reason.code === 'UNAUTHENTICATED'
  ) {
    throw result.reason; // → error.tsx
  }
}

// 나머지는 null로 전달 → 해당 섹션만 에러 카드 표시
const groupsData =
  groupsResult.status === 'fulfilled' ? groupsResult.value : null;
```

각 섹션 컴포넌트는 `null`을 받으면 `ErrorFallbackCard`를 렌더링하여, **페이지 전체가 아닌 해당 카드 영역만** 에러 UI를 표시한다.

핵심 설계 포인트:

- **인증 에러(UNAUTHENTICATED)**: 어떤 Promise에서 나오든 전체 에러 페이지로 throw
- **기타 에러**: 해당 섹션만 fallback 카드 표시, 나머지 섹션은 정상 동작

---

## 6. 리팩토링의 의미

이번 작업은 단순한 코드 정리가 아니라,

> "에러는 어디에서 처리되어야 하는가?"에 대한 설계 재정립 과정이었다.

이를 통해:

- UX가 명확하게 분리되었고
- 에러 처리 흐름이 예측 가능해졌으며
- 확장 시 유지보수 비용이 감소하는 구조를 확보했다.

---

## 7. 결론

에러 핸들링을 구조화하는 과정은 코드 수정이 아니라 **아키텍처 설계의
문제**였다.

이번 리팩토링은 "페이지 크래시"와 "사용자 액션 실패"를 분리함으로써
프로젝트의 책임 구조를 명확히 정립한 사례이다.
