/**
 * 표준 에러 코드
 * - 서비스/라우트에서 에러 분기 시 문자열 대신 이 코드를 사용
 * - 클라이언트에서 코드 기반으로 에러 메시지를 분기 처리 가능
 */
export type ErrorCode =
  | 'UNAUTHENTICATED' // 로그인 필요
  | 'FORBIDDEN' // 권한 부족
  | 'NOT_FOUND' // 리소스 없음
  | 'VALIDATION' // 입력값 오류
  | 'CONFLICT' // 중복/충돌
  | 'RATE_LIMIT' // 요청 제한
  | 'ALREADY_PROCESSED' // 이미 처리된 요청
  | 'SERVER_ERROR' // 서버 내부 오류
  | 'NETWORK_ERROR'; // 네트워크 오류 (클라이언트 전용)

export const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION: 400,
  CONFLICT: 409,
  RATE_LIMIT: 429,
  ALREADY_PROCESSED: 409,
  SERVER_ERROR: 500,
  NETWORK_ERROR: 0, // 클라이언트 전용 (서버에서 사용하지 않음)
};
