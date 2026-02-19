import { NextResponse } from 'next/server';
import { getCachedUser } from '@/lib/utils/auth-utils';
import { updateInvitationStatus } from '@/services/invitation-service';
import { InviteState } from '@/types';

/**
 * -----------------------------------------------------------------------------
 * [API Specification]
 * -----------------------------------------------------------------------------
 * @method PATCH
 * @summary 초대 응답 (수락/거절)
 * @description
 * - 특정 초대에 대해 수락 또는 거절 처리를 합니다.
 * - 요청 예시:
 * PATCH /api/invitations/{id}/respond
 * body: {
 *   "state": "ACCEPTED" | "REJECTED"
 * }
 *
 * @requestBody {application/json}
 * - state (string, required): 응답 상태 ('ACCEPTED' | 'REJECTED')
 *
 * @response 200 (OK)
 * - 성공적으로 상태가 업데이트됨.
 * - Type: { success: true, data: Invitation }
 *
 * @response 400 (Bad Request)
 * - state 값이 유효하지 않거나 누락됨.
 *
 * @response 401 (Unauthorized)
 * - 로그인하지 않은 사용자가 요청했을 때 발생.
 *
 * @response 500 (Internal Server Error)
 * - DB Update 실패 또는 서버 에러 발생 시.
 * -----------------------------------------------------------------------------
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCachedUser();
    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    const { id: invitationId } = await params;
    const body = await request.json();
    const { state } = body;

    // 유효성 검사
    if (!state || (state !== InviteState.ACCEPTED && state !== InviteState.REJECTED)) {
      return NextResponse.json(
        { error: '잘못된 요청입니다. state는 ACCEPTED 또는 REJECTED여야 합니다.' },
        { status: 400 },
      );
    }

    const result = await updateInvitationStatus(invitationId, state);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || '초대 응답 처리에 실패했습니다.' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 200 },
    );

  } catch (error) {
    console.error('[Invitation Respond PATCH Error]', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }
}
