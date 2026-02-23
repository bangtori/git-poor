import { createClient } from '@/lib/supabase/server';
import {
  InvitationRequst,
  Invitation,
  InviteState,
  InvitationWithGroup,
} from '@/types';
import { createAdminClient } from '@/lib/supabase/admin';

export async function sendInvitation(email: string, groupId: string) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const normalizedEmail = email.trim();

  // 요청자 권한 체크: groupId에서 admin/owner만 초대 가능
  const { data: me, error: meErr } = await supabase.auth.getUser();
  console.log('[AUTH]', me?.user?.id, meErr);
  const myId = me?.user?.id;

  if (!myId) return { success: false, error: 'UNAUTHENTICATED' };

  const { data: roleRow, error: roleErr } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', myId)
    .maybeSingle();

  console.log('[MEMBER]', { uid: myId, groupId, roleRow, roleErr });
  if (roleErr) return { success: false, error: roleErr };
  if (!roleRow || !['owner', 'admin'].includes(roleRow.role)) {
    return { success: false, error: 'FORBIDDEN' };
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
    console.log('[User Query Error]', userError);
    return { success: false, error: userError };
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
    console.log('[Supabase Query Error] ', error.message, error.details);
    return { success: false, error };
  }

  return { success: true, data: data as Invitation };
}

// 내 초대 목록 가져오기
export async function getInvitationByUserId(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('group_invitations')
    .select(
      `
          *,
          groups (
            name,
            penalty_title
          )
        `,
    )
    .eq('invitee_id', userId);

  if (error) {
    console.log('[Supabase Query Error] ', error.message, error.details);
    return { success: false, error };
  }

  return { success: true, data: data as InvitationWithGroup[] };
}

// 초대 수락 & 거절
export async function updateInvitationStatus(
  invitationId: string,
  status: InviteState,
) {
  const supabase = await createClient();

  // 초대 정보 조회 (group_id, invitee_id 필요)
  const { data: invitation, error: fetchError } = await supabase
    .from('group_invitations')
    .select('*')
    .eq('id', invitationId)
    .single();

  if (fetchError || !invitation) {
    console.log('[Invitation Fetch Error]', fetchError);
    return { success: false, error: fetchError };
  }

  // 수락인 경우 그룹 멤버 추가
  if (status === InviteState.ACCEPTED) {
    const { error: memberError } = await supabase.from('group_members').insert({
      group_id: invitation.group_id,
      user_id: invitation.invitee_id,
      role: 'member', // 기본 역할
    });

    if (memberError) {
      console.log('[Group Member Insert Error]', memberError);
      return { success: false, error: memberError };
    }
  }

  // 초대 상태 업데이트
  const { data, error } = await supabase
    .from('group_invitations')
    .update({ state: status })
    .eq('id', invitationId)
    .select()
    .single();

  if (error) {
    console.log('[Update Invitation Error] ', error.message, error.details);
    return { success: false, error };
  }

  return { success: true, data: data as Invitation };
}
