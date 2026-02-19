import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCachedUser } from '@/lib/utils/auth-utils';
import { Invitation, InviteState, GroupRole } from '@/types';
import { sendInvitation, getInvitationByUserId } from '@/services/invitation-service';
import { getGroupRole } from '@/services/group-service';

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
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { group_id, email } = body;

    if (!group_id || !email) {
      return NextResponse.json(
        { error: 'group_id와 email은 필수입니다.' },
        { status: 400 },
      );
    }

    // TODO: 그룹 id와 email 유효성확인

    const role = await getGroupRole(group_id, user.id);
    if (role !== GroupRole.OWNER && role !== GroupRole.ADMIN) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 },
      );
    }

    // TODO: 초대 중복 체크 로직

    const result = await sendInvitation(email, group_id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || '초대 전송 실패' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 201 },
    );

  } catch (error) {
    console.error('[Invitation POST Error]', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
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
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    const { success, data, error } = await getInvitationByUserId(user.id);

    if (!success) {
      return NextResponse.json(
        { error: error?.message || '초대 목록 조회 실패' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 200 },
    );

  } catch (error) {
    console.error('[Invitation GET Error]', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }
}
