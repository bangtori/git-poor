import { getCachedUser } from '@/lib/utils/auth-utils';
import { leaveGroup } from '@/services/group-service';
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
 * @summary 그룹 나가기
 * @description
 * - admin/member만 그룹을 나갈 수 있습니다.
 * - owner가 요청할 경우 CONFLICT(409) 에러를 반환합니다.
 * - 요청 예시: DELETE /api/groups/{groupId}/leave
 *
 * @response 200 (OK)
 * - 성공적으로 그룹에서 나감. { success: true, data: true }
 *
 * @response 401 (Unauthorized)
 * - 로그인하지 않은 사용자가 요청했을 때 발생.
 *
 * @response 403 (Forbidden)
 * - 해당 그룹의 멤버가 아닌 사용자가 요청했을 때 발생.
 *
 * @response 409 (Conflict)
 * - 그룹장(owner)이 나가기를 시도했을 때 발생.
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
    if (!user) return unauthorized();

    const { groupId } = await params;
    if (!groupId) return badRequest('groupId가 필요합니다.');

    await leaveGroup(groupId, user.id);

    return ok(true);
  } catch (error) {
    if (error instanceof AppError) {
      return fail(error.code, error.message, error.details);
    }
    console.error('[Group Leave DELETE Error]', error);
    return serverError('서버 에러가 발생했습니다.');
  }
}
