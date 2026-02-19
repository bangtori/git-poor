import { NextResponse } from 'next/server'
import { ApiError, ApiSuccess } from './reponse';

export function ok<T>(data: T, status: number = 200) {
  return NextResponse.json(
    { success: true, data } satisfies ApiSuccess<T>,
    { status },
  )
}

export function fail(
  message: string,
  status: number = 500,
  opts?: { code?: string; details?: unknown },
) {
  return NextResponse.json(
    {
      success: false,
      error: { message, code: opts?.code, details: opts?.details },
    } satisfies ApiError,
    { status },
  )
}

export const created = <T,>(data: T) => ok(data, 201)
export const badRequest = (message: string, opts?: { code?: string; details?: unknown }) =>
  fail(message, 400, opts)
export const unauthorized = (message = '로그인이 필요합니다.') => fail(message, 401)
export const forbidden = (message = '권한이 없습니다.') => fail(message, 403)
export const notFound = (message = '대상을 찾을 수 없습니다.') => fail(message, 404)
export const noContent = () => new NextResponse(null, { status: 204 })
export const serverError = (message = '서버 에러가 발생했습니다.') => fail(message, 500)