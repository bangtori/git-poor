import { createClient } from '@/lib/supabase/server'; 
import { InvitationRequst, Invitation, InviteState, InvitationWithGroup } from '@/types';

export async function sendInvitation(email: string, groupId: string) {
  const supabase = await createClient();

  // 이메일로 유저 찾기 (github_infos 테이블)
  const { data: userInfo, error: userError } = await supabase
    .from('github_infos')
    .select('user_id')
    .eq('email', email)
    .single();

  if (userError || !userInfo) {
    console.log('[User Not Found] ', email);
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

  const { data, error } = await supabase
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

export async function getInvitationByUserId(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('group_invitations')
        .select(`
          *,
          groups (
            name,
            penalty_title
          )
        `)
        .eq('invitee_id', userId);

    if (error) {
        console.log('[Supabase Query Error] ', error.message, error.details);
        return { success: false, error };
    }

    return { success: true, data: data as InvitationWithGroup[] };
}
