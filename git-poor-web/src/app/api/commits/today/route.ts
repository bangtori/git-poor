// src/app/api/commits/today/route.ts
import { createClient } from '@/lib/supabase/server';
import { getTodayCommitData } from '@/services/commit-service';
import {
  ok,
  unauthorized,
  fail,
  serverError,
} from '@/lib/http/reponse-service';
import { AppError } from '@/lib/error/app-error';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return unauthorized();
    }

    // 서비스 호출
    const data = await getTodayCommitData(supabase, user.id);

    // 결과 반환
    return ok(data);
  } catch (error) {
    if (error instanceof AppError) {
      return fail(error.code, error.message, error.details);
    }
    console.error('API Error:', error);
    return serverError('서버 에러가 발생했습니다.');
  }
}
