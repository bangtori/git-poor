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

// 내 초대 목록 가져오기
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

// 초대 수락 & 거절
export async function updateInvitationStatus(invitationId: string, status: InviteState) {
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
        const { error: memberError } = await supabase
            .from('group_members')
            .insert({
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
