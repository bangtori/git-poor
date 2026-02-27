import type { ErrorCode } from '@/types/error';

type ApiErrorShape = {
  message: string;
  code?: ErrorCode;
  details?: unknown;
};

export function handleActionError(error: ApiErrorShape) {
  const code = error.code;

  // UNAUTHENTICATED만 특수 동작 (로그인 페이지로 리다이렉트)
  if (code === 'UNAUTHENTICATED') {
    alert(error.message || '로그인이 필요합니다.');
    window.location.href = '/';
    return;
  }

  // 나머지는 API가 내려준 message 그대로 표시
  alert(error.message || '요청 처리 중 오류가 발생했습니다.');
}
