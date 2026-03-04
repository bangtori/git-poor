import { getCachedUser } from '@/lib/utils/auth-utils';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  ok,
  badRequest,
  unauthorized,
  fail,
  serverError,
} from '@/lib/http/response-service';
import { AppError } from '@/lib/error/app-error';

/**
 * -----------------------------------------------------------------------------
 * @method POST
 * @summary GitHub provider_token을 tokens 테이블에 저장/갱신
 * @description
 * - 클라이언트에서 provider_token을 전달하면 서버가 tokens 테이블에 upsert합니다.
 * - DB write는 서버(API)에서만 수행하도록 구조를 통일합니다.
 * -----------------------------------------------------------------------------
 */
export async function POST(request: Request) {
  try {
    const user = await getCachedUser();
    if (!user) return unauthorized();

    const body = await request.json().catch(() => null);
    const provider_token = body?.provider_token as string | undefined;
    const provider_refresh_token = body?.provider_refresh_token as
      | string
      | null
      | undefined;
    const expires_at = body?.expires_at as number | null | undefined; // seconds

    if (!provider_token) {
      return badRequest('provider_token이 필요합니다.');
    }

    const admin = createAdminClient();

    const { error } = await admin.from('tokens').upsert(
      {
        user_id: user.id,
        access_token: provider_token,
        refresh_token: provider_refresh_token ?? null,
        token_expires_at: expires_at
          ? new Date(expires_at * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

    if (error) {
      throw new AppError('SERVER_ERROR', '토큰 저장에 실패했습니다.', error);
    }

    return ok(true);
  } catch (error) {
    if (error instanceof AppError) {
      return fail(error.code, error.message, error.details);
    }
    console.error('[Token Sync POST Error]', error);
    return serverError('서버 에러가 발생했습니다.');
  }
}
