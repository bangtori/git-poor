import { NextResponse } from 'next/server';
import { PaginationMeta } from '@/types/page-info';
import { ErrorCode, ERROR_STATUS_MAP } from '@/types/error';
import { ApiError, ApiSuccess } from './reponse';

interface OkOptions {
  status?: number;
  meta?: PaginationMeta;
}

export function ok<T>(data: T, options?: OkOptions) {
  const { status = 200, meta } = options ?? {};
  return NextResponse.json(
    { success: true, data, ...(meta && { meta }) } satisfies ApiSuccess<T>,
    { status },
  );
}

export function fail(code: ErrorCode, message: string, details?: unknown) {
  const status = ERROR_STATUS_MAP[code];
  return NextResponse.json(
    {
      success: false,
      error: { message, code, details },
    } satisfies ApiError,
    { status },
  );
}

export const created = <T>(data: T) => ok(data, { status: 201 });
export const badRequest = (message: string, details?: unknown) =>
  fail('VALIDATION', message, details);
export const unauthorized = (message = '로그인이 필요합니다.') =>
  fail('UNAUTHENTICATED', message);
export const forbidden = (message = '권한이 없습니다.') =>
  fail('FORBIDDEN', message);
export const notFound = (message = '대상을 찾을 수 없습니다.') =>
  fail('NOT_FOUND', message);
export const noContent = () => new NextResponse(null, { status: 204 });
export const serverError = (message = '서버 에러가 발생했습니다.') =>
  fail('SERVER_ERROR', message);
