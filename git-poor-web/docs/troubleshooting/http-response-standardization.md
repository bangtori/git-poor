# 📦 HTTP 응답 구조 표준화 – 설계 의사결정 과정

## 1. 문제 상황

API 응답 구조 자체는 개발 초기부터 일정한 형태를 유지하고 있었다.
개발자가 직접 `{ success, data }` 형태의 컨벤션을 정하고, 각 라우트에서 이를 참고하여 동일한 JSON 구조로 응답을 내리고 있었다.

```ts
// 모든 라우트에서 이 형태를 수동으로 맞추고 있었음
return NextResponse.json({ success: true, data: groups }, { status: 200 });
return NextResponse.json({ success: false, error: '실패' }, { status: 500 });
```

하지만 이건 **개발자가 매번 기억하고 똑같이 작성해야 유지되는 방식**이었다.
코드 수준의 타입이나 helper 함수가 없었기 때문에:

- 실수로 필드명을 다르게 쓰거나, 구조를 빠뜨려도 컴파일 에러가 나지 않음
- 새 라우트 추가 시 기존 컨벤션을 까먹으면 바로 불일치 발생
- 클라이언트에서 응답을 파싱하는 코드도 타입 보장 없이 작성해야 했음
- 혼자 개발할 때는 그나마 유지 가능하지만, 협업이나 확장 시 깨질 위험이 높았음

즉, **응답 구조는 통일되어 있었지만 그것을 강제하는 코드적 구조화가 없는 상태**였다.

---

## 2. 1차 리팩토링: 공통 응답 타입 도입

### 2.1 ApiResponse 타입 설계

모든 API 응답을 `success` 필드로 분기할 수 있는 discriminated union을 설계했다.

```ts
// lib/http/reponse.ts
type ApiSuccess<T> = { success: true; data: T };
type ApiError = { success: false; error: { message: string; code?: string } };
type ApiResponse<T> = ApiSuccess<T> | ApiError;
```

핵심 설계 의도:

- `success`를 boolean 리터럴로 고정하여 TypeScript가 자동으로 타입을 좁혀줌
- 에러는 항상 `error.message`를 통해 접근 → 클라이언트 코드 통일

### 2.2 HTTP 응답 Helper 함수

매번 `NextResponse.json(...)`을 직접 작성하는 대신, helper 함수를 만들어 모든 라우트에서 동일한 양식으로 응답하도록 했다.

```ts
// lib/http/reponse-service.ts
export function ok<T>(data: T) { ... }                     // 200
export function fail(code, message, details?) { ... }      // code → HTTP status 매핑
export const created = <T>(data: T) => ...                 // 201
export const badRequest = (msg) => ...                     // 400
export const unauthorized = (msg) => ...                   // 401
```

이로써 라우트 코드가 간결해지고, 응답 형식이 자동으로 보장되었다.

```ts
// Before
return NextResponse.json({ success: true, data: groups }, { status: 200 });

// After
return ok(groups);
```

### 2.3 클라이언트 사용 패턴 통일

클라이언트에서도 `ApiResponse<T>`로 타입을 지정하여 일관된 분기가 가능해졌다.

```ts
const result: ApiResponse<GroupSummary[]> = await res.json();

if (result.success) {
  // result.data 사용 가능
} else {
  // result.error.message 사용 가능
}
```

---

## 3. 2차 리팩토링: 서비스 레이어 응답 구조 통일

### 3.1 새로운 문제 인식

1차 리팩토링은 **API 라우트의 HTTP 응답**을 통일한 것이었다.
하지만 서비스 함수의 반환값은 여전히 제각각이었다.

```ts
// group-service: { data, totalCount } 반환
return { data: formattedData, totalCount: totalCount ?? 0 };

// invitation-service: { success, data } 반환
return { success: true, data: data as InvitationWithGroup[] };
```

그리고 페이지네이션 정보(meta)를 전달하는 표준 경로가 없었기 때문에, 라우트에서 직접 meta를 계산하고 있었다.

### 3.2 해결: 도메인 응답 타입 + 서비스에서 meta 계산

**도메인별 응답 타입**을 `types/api-response.ts`에 모아서 정의했다.

```ts
// types/api-response.ts
export interface GroupApiResponse {
  data: GroupSummary[];
  meta: PaginationMeta;
}

export interface InvitationApiResponse {
  data: InvitationWithGroup[];
  meta: PaginationMeta;
}
```

서비스 함수가 이 타입을 반환하도록 변경했다.

```ts
// Before: 라우트에서 meta 직접 계산
const { data, totalCount } = await getMyGroupsService(userId, page, limit);
return ok({ data, meta: { page, limit, total_count: totalCount, ... } });

// After: 서비스가 meta를 포함하여 반환
const { data, meta } = await getMyGroupsService(userId, page, limit);
return ok(data, { meta });
```

### 3.3 ok() helper 확장

서비스에서 반환된 `meta`를 HTTP 응답 top-level에 배치하기 위해 `ok()` 시그니처를 확장했다.

```ts
// ok(data)는 기존처럼 동작, meta가 있으면 응답에 포함
export function ok<T>(data: T, options?: { status?: number; meta?: PaginationMeta }) { ... }
```

---

## 4. 최종 레이어별 책임

| 레이어        | 책임                                          | 반환값               |
| ------------- | --------------------------------------------- | -------------------- |
| **Service**   | 비즈니스 로직 + 페이지네이션 계산             | `{ data, meta }`     |
| **API Route** | 인증/권한 확인 + 서비스 호출 + HTTP 응답 변환 | `ok(data, { meta })` |
| **Client**    | fetch + `ApiResponse<T>` 타입으로 분기        | UI 렌더링            |

---

## 5. 이 구조화가 해결한 것

- 모든 API에서 동일한 응답 형식 보장 (`success`, `data`, `error`)
- 클라이언트 파싱 코드 통일 (discriminated union으로 타입 안전)
- 페이지네이션이 필요한 API와 아닌 API 모두 같은 `ok()` helper 사용
- 서비스 반환값도 타입으로 명시되어 라우트-서비스 간 계약이 명확
- 새 API 추가 시 도메인 응답 타입만 선언하면 패턴을 그대로 따를 수 있음
