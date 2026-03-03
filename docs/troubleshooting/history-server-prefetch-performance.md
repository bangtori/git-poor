# 🛠 History 페이지 Server Component 분리 및 성능 개선

## 1. 문제 상황

History 페이지는 초기 구현에서 `page.tsx`가 `'use client'`로 구성되어
있었으며,\
월 단위 커밋(잔디) 데이터도 `HistoryCalendar` 내부 `useEffect`에서\
`/api/commits/history`를 호출하여 가져오는 구조였다.

이로 인해:

- 초기 렌더 후에야 API 요청이 시작되는 **Client-side Waterfall 구조**
  발생
- 달력 UI가 먼저 렌더된 뒤, 잔디가 지연되어 채워지는 UX 발생

---

## 2. 원인 분석

초기 네트워크 흐름은 다음과 같았다.

1.  `/history` document 로드
2.  JS 번들 다운로드 및 hydration
3.  `useEffect` 실행
4.  `/api/commits/history?...` 요청 시작
5.  응답 도착 후 `setState` → 리렌더

즉, 데이터 요청이 서버가 아닌 브라우저 렌더 단계에 걸려 있었으며,\
추가 네트워크 왕복 및 리렌더 단계가 발생하는 구조였다.

---

## 3. 해결 전략

목표는 **초기 렌더 경로에서 client fetch 제거**였다.

### 3.1 컴포넌트 분리

- `page.tsx`를 **Server Component**로 전환
- 기존 상태 및 상호작용 로직은 `HistoryClient`로 분리
- 날짜 클릭 시 상세 데이터 fetch는 기존과 동일하게 유지

### 3.2 서버 prefetch 도입

- `page.tsx`에서 현재 월의 범위(from/to) 계산
- 서버에서 커밋 데이터를 조회하여 `initialData`로 가공
- 해당 데이터를 `HistoryClient` → `HistoryCalendar`로 전달
- `HistoryCalendar`는 첫 렌더 시 `initialData`가 존재하면
  `useEffect fetch`를 스킵

결과적으로:

- 초기 진입 시 추가 fetch 제거
- 월 이동 시에만 fetch 발생

---

## 4. 성능 측정

### 측정 조건

- Production build (`npm run build && npm run start`)
- Disable cache
- Slow 4G 네트워크
- 3회 측정 평균

### 4.1 개선 전 (Client Fetch 구조)

history_calendar_ready_ms:

- 614.5ms
- 606.0ms
- 585.1ms

평균 ≈ **602ms**

### 4.2 개선 후 (Server Prefetch 구조)

history_calendar_ready_ms:

- 3.3ms
- 3.1ms
- 3.0ms

평균 ≈ **3.13ms**

---

## 5. 결과

| 항목                  | 개선 전 | 개선 후 |
| --------------------- | ------- | ------- |
| 초기 데이터 준비 시간 | \~602ms | \~3ms   |
| Client Waterfall      | 존재    | 제거    |
| 초기 추가 API 요청    | 있음    | 없음    |

---

## 6. 핵심 인사이트

이번 개선은 DB 쿼리 속도 향상이 아니라,

> **렌더링 파이프라인 상의 Client-side Waterfall 제거**

가 핵심이었다.

데이터를 서버에서 미리 포함하여 전달함으로써,

- 추가 네트워크 단계 제거
- 리렌더 단계 감소
- 사용자 체감 지연 제거

를 달성하였다.

---

## 7. 최종 구조

- `page.tsx` (Server Component)
  - 월 범위 계산
  - 서버에서 초기 데이터 조회 및 가공
  - `HistoryClient`에 initialData 전달
- `HistoryClient` (Client Component)
  - 날짜 선택 상태 관리
  - 특정 날짜 클릭 시 상세 fetch
- `HistoryCalendar`
  - initialData 기반 초기 렌더
  - 월 이동 시 fetch 유지

---

## 결론

본 리팩토링은 단순 최적화가 아니라,

> **Server Component를 활용한 렌더링 구조 개선 사례**

이며, 초기 사용자 체감 성능을 크게 개선하였다.
