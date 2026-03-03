import { getCachedUser } from '@/lib/utils/auth-utils';
import { deleteGroup } from '@/services/group-service';
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
 * [API Specification]
 * -----------------------------------------------------------------------------
 * @method DELETE
 * @summary 그룹 삭제
 * @description
 * - 그룹장(owner)만 그룹을 삭제할 수 있습니다.
 * - 요청 예시: DELETE /api/groups/{groupId}
 *
 * @response 200 (OK)
 * - 성공적으로 그룹이 삭제됨. { success: true, data: true }
 *
 * @response 401 (Unauthorized)
 * - 로그인하지 않은 사용자가 요청했을 때 발생.
 *
 * @response 403 (Forbidden)
 * - 그룹장이 아닌 사용자가 요청했을 때 발생.
 *
 * @response 500 (Internal Server Error)
 * - DB 삭제 실패 또는 서버 에러 발생 시.
 * -----------------------------------------------------------------------------
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    const user = await getCachedUser();
    if (!user) {
      return unauthorized();
    }

    const { groupId } = await params;
    if (!groupId) return badRequest('groupId가 필요합니다.');
    await deleteGroup(groupId, user.id);

    return ok(true);
  } catch (error) {
    if (error instanceof AppError) {
      return fail(error.code, error.message, error.details);
    }
    console.error('[Group DELETE Error]', error);
    return serverError('서버 에러가 발생했습니다.');
  }
}
