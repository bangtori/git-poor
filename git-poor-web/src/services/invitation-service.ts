import { createClient } from '@/lib/supabase/server';
import {
  InvitationRequst,
  Invitation,
  InviteState,
  InvitationWithGroup,
  InvitationApiResponse,
  PaginationMeta,
} from '@/types';
import { createAdminClient } from '@/lib/supabase/admin';
import { AppError } from '@/lib/error/app-error';

export async function sendInvitation(email: string, groupId: string) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const normalizedEmail = email.trim();

  // 요청자 권한 체크: groupId에서 admin/owner만 초대 가능
  const { data: me, error: meErr } = await supabase.auth.getUser();
  console.log('[AUTH]', me?.user?.id, meErr);
  const myId = me?.user?.id;

  if (!myId) throw new AppError('UNAUTHENTICATED', '로그인이 필요합니다.');

  const { data: roleRow, error: roleErr } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', myId)
    .maybeSingle();

  console.log('[MEMBER]', { uid: myId, groupId, roleRow, roleErr });
  if (roleErr) throw new AppError('SERVER_ERROR', '멤버 조회 실패', roleErr);
  if (!roleRow || !['owner', 'admin'].includes(roleRow.role)) {
    throw new AppError('FORBIDDEN', '초대 권한이 없습니다.');
  }

  // 이메일로 유저 찾기 (github_infos 테이블)
  const { data: userInfo, error: userError } = await admin
    .from('github_infos')
    .select('user_id')
    .eq('email', normalizedEmail)
    .maybeSingle();

  console.log('[User Info] ', userInfo);
  console.log('[User Error] ', userError);
  if (userError) {
    throw new AppError('SERVER_ERROR', '유저 조회 실패', userError);
  }

  if (!userInfo) {
    console.log('[User Not Found]', email);
    // 보안/UX를 위해 유저가 없어도 성공으로 처리
    return { success: true };
  }

  const inviteeId = userInfo.user_id;

  // 초대장 생성
  const invitation: InvitationRequst = {
    group_id: groupId,
    invitee_id: inviteeId,
    state: InviteState.PENDING,
  };

  const { data, error } = await admin
    .from('group_invitations')
    .insert([invitation])
    .select()
    .single();

  if (error) {
    throw new AppError('SERVER_ERROR', '초대장 생성 실패', error);
  }

  return data as Invitation;
}

// 내 초대 목록 가져오기
export async function getInvitationByUserId(
  userId: string,
  page: number = 1,
  limit: number = 10,
): Promise<InvitationApiResponse> {
  const supabase = await createClient();

  const safeLimit = Math.min(50, Math.max(1, limit));
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;

  const emptyMeta: PaginationMeta = {
    page: safePage,
    limit: safeLimit,
    total_count: 0,
    total_pages: 0,
    has_next_page: false,
  };

  const { data, error, count } = await supabase
    .from('group_invitations')
    .select(
      `
          *,
          groups (
            name,
            penalty_title
          )
        `,
      { count: 'exact' },
    )
    .eq('invitee_id', userId)
    .eq('state', InviteState.PENDING)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new AppError('SERVER_ERROR', '초대 목록 조회 실패', error);
  }

  const total = count ?? 0;
  return {
    data: (data as InvitationWithGroup[]) ?? [],
    meta: {
      page: safePage,
      limit: safeLimit,
      total_count: total,
      total_pages: Math.ceil(total / safeLimit),
      has_next_page: total > to + 1,
    },
  };
}

// 초대 수락 & 거절
export async function updateInvitationStatus(
  invitationId: string,
  status: InviteState,
) {
  const supabase = await createClient();

  const { data: me } = await supabase.auth.getUser();
  const uid = me?.user?.id;
  if (!uid) throw new AppError('UNAUTHENTICATED', '로그인이 필요합니다.');

  // 초대 정보 조회
  const { data: invitation, error: fetchError } = await supabase
    .from('group_invitations')
    .select('*')
    .eq('id', invitationId)
    .single();

  if (fetchError || !invitation) {
    throw new AppError(
      'NOT_FOUND',
      '초대 정보를 찾을 수 없습니다.',
      fetchError,
    );
  }

  // 본인 초대인지 확인
  if (invitation.invitee_id !== uid) {
    throw new AppError('FORBIDDEN', '본인의 초대만 응답할 수 있습니다.');
  }

  // 이미 처리된 초대 방지
  if (invitation.state !== InviteState.PENDING) {
    throw new AppError('ALREADY_PROCESSED', '이미 처리된 초대입니다.');
  }

  // 초대 상태 업데이트
  const { data, error } = await supabase
    .from('group_invitations')
    .update({ state: status })
    .eq('id', invitationId)
    .select()
    .single();

  if (error) {
    throw new AppError('SERVER_ERROR', '초대 상태 업데이트 실패', error);
  }

  // 수락이면 멤버 추가
  if (status === InviteState.ACCEPTED) {
    const { error: memberError } = await supabase.from('group_members').insert({
      group_id: invitation.group_id,
      user_id: uid,
      role: 'member',
    });

    if (memberError) {
      // 롤백
      await supabase
        .from('group_invitations')
        .update({ state: InviteState.PENDING })
        .eq('id', invitationId);

      throw new AppError('SERVER_ERROR', '그룹 멤버 추가 실패', memberError);
    }
  }

  return data;
}
