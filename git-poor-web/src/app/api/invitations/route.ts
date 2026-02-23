import { getCachedUser } from '@/lib/utils/auth-utils';
import { GroupRole } from '@/types';
import {
  sendInvitation,
  getInvitationByUserId,
} from '@/services/invitation-service';
import { getGroupRole } from '@/services/group-service';
import {
  ok,
  created,
  badRequest,
  unauthorized,
  forbidden,
  serverError,
  fail,
} from '@/lib/http/reponse-service';

/**
 * -----------------------------------------------------------------------------
 * [API Specification]
 * -----------------------------------------------------------------------------
 * @method POST
 * @summary 그룹 초대 전송
 * @description
 * - 특정 사용자에게 그룹 초대를 보냅니다.
 * - 초대 상태는 기본적으로 'PENDING'으로 설정됩니다.
 * - 요청 예시:
 * POST /api/invitations
 * body: {
 *   "group_id": "group-uuid-1234",
 *   "email": "user@example.com"
 * }
 *
 * @requestBody {application/json}
 * - group_id (string, required): 초대할 그룹의 ID
 * - email (string, required): 초대받을 사용자의 이메일
 *
 * @response 201 (Created)
 * - 성공적으로 초대가 전송됨.
 * - Type: { success: true, data: { id: string, group_id: string, invitee_id: string, state: 'PENDING' } }
 *
 * @response 400 (Bad Request)
 * - 필수 데이터(group_id, invitee_id)가 누락되었을 때 발생.
 *
 * @response 401 (Unauthorized)
 * - 로그인하지 않은 사용자가 요청했을 때 발생.
 *
 * @response 403 (Forbidden)
 * - 초대 권한이 없는 멤버가 초대했을 때
 *
 * @response 500 (Internal Server Error)
 * - DB Insert 실패 또는 서버 에러 발생 시.
 * -----------------------------------------------------------------------------
 */
export async function POST(request: Request) {
  try {
    const user = await getCachedUser();
    if (!user) {
      return unauthorized('로그인이 필요합니다.');
    }

    const body = await request.json();
    const { group_id, email } = body;

    if (!group_id || !email) {
      return badRequest('group_id와 email은 필수입니다.');
    }

    // TODO: 그룹 id와 email 유효성확인

    const role = await getGroupRole(group_id, user.id);
    if (role !== GroupRole.OWNER && role !== GroupRole.ADMIN) {
      return forbidden('권한이 없습니다.');
    }

    // TODO: 초대 중복 체크 로직

    const result = await sendInvitation(email, group_id);

    if (!result.success) {
      return fail('초대 전송 실패');
    }

    return created(result.data);
  } catch (error) {
    console.error('[Invitation POST Error]', error);
    return serverError();
  }
}

/**
 * -----------------------------------------------------------------------------
 * [API Specification]
 * -----------------------------------------------------------------------------
 * @method GET
 * @summary 내 초대 목록 조회
 * @description
 * - 로그인한 사용자가 받은 모든 초대 목록을 조회합니다.
 * - 요청 예시:
 * GET /api/invitations
 *
 * @response 200 (OK)
 * - 성공적으로 초대 목록을 반환함.
 * - Type: { success: true, data: Invitation[] }
 *
 * @response 401 (Unauthorized)
 * - 로그인하지 않은 사용자가 요청했을 때 발생.
 *
 * @response 500 (Internal Server Error)
 * - DB Select 실패 또는 서버 에러 발생 시.
 * -----------------------------------------------------------------------------
 */
export async function GET() {
  try {
    const user = await getCachedUser();
    if (!user) {
      return unauthorized();
    }

    const { success, data, error } = await getInvitationByUserId(user.id);

    if (!success) {
      return fail(error?.message || '초대 목록 조회 실패');
    }

    return ok(data);
  } catch (error) {
    console.error('[Invitation GET Error]', error);
    return serverError();
  }
}
