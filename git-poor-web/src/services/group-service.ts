// src/services/group-service.ts
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  GroupDetail,
  GroupInfo,
  GroupMember,
  GroupRole,
  GroupSummary,
  getGroupRoleKey,
  GroupMemberWithCommit,
} from '@/types';
import { getGitPoorDate } from '@/lib/utils/date-utils';

export async function getMyGroupsService(
  userId: string,
  page: number = 1,
  limit: number = 10,
) {
  const supabase = await createClient();
  const admin = createAdminClient();

  // 범위 계산
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // 내가 속한 그룹 리스트 조회
  const {
    data: myMemberships,
    count: totalCount,
    error: myMembershipsError,
  } = await supabase
    .from('group_members')
    .select('group_id, total_penalty_count', { count: 'exact' })
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })
    .range(from, to);

  if (myMembershipsError) {
    console.error(
      '[Supabase Query Error] ',
      myMembershipsError.message,
      myMembershipsError.details,
    );
    return { data: [], totalCount: 0 };
  }

  if (!myMemberships || myMemberships.length === 0) {
    return { data: [], totalCount: 0 };
  }

  const groupIds = myMemberships.map((m) => m.group_id);

  // 그룹 정보 조회
  // 주의: group_members(count) 조인은 현재 RLS(본인 row만) 때문에 정확한 카운트를 못 만듦
  const { data: groups, error: groupsError } = await supabase
    .from('groups')
    .select('id, name, penalty_title, day_start_hour, owner_id, created_at')
    .in('id', groupIds)
    .order('created_at', { ascending: false });

  if (groupsError || !groups) {
    console.error('[Groups Fetch Error]', groupsError);
    return { data: [], totalCount: 0 };
  }

  // 멤버 수는 admin으로 조회해서 서버에서 카운트
  const { data: memberRows, error: memberRowsError } = await admin
    .from('group_members')
    .select('group_id')
    .in('group_id', groupIds);

  if (memberRowsError) {
    console.error('[MemberCount(admin) Fetch Error]', memberRowsError);
  }

  const countMap = new Map<string, number>();
  (memberRows ?? []).forEach((r: any) => {
    countMap.set(r.group_id, (countMap.get(r.group_id) ?? 0) + 1);
  });

  // 데이터 가공
  const formattedData: GroupSummary[] = groups.map((group) => {
    const myMembership = myMemberships.find((m) => m.group_id === group.id);
    return {
      id: group.id,
      name: group.name,
      penalty_title: group.penalty_title,
      day_start_hour: group.day_start_hour,
      is_owner: group.owner_id === userId,
      member_count: countMap.get(group.id) ?? 0,
      my_penalty_count: myMembership?.total_penalty_count || 0,
    };
  });

  return { data: formattedData, totalCount: totalCount ?? 0 };
}

// 멤버인지 조회 함수
export async function validateGroupUser(
  userId: string,
  groupId: string,
): Promise<boolean> {
  const supabase = await createClient();

  try {
    const { count, error } = await supabase
      .from('group_members')
      .select('*', { count: 'exact', head: true }) // head: true는 데이터 없이 개수만 셉니다 (가벼움)
      .eq('user_id', userId)
      .eq('group_id', groupId);

    if (error) {
      console.error(
        `[멤버 검증 에러] User: ${userId}, Group: ${groupId}`,
        error,
      );
      return false; // 에러 나면 일단 차단 (안전)
    }

    // 카운트가 1 이상이면 멤버임
    return count !== null && count > 0;
  } catch (error) {
    console.error('[멤버 검증 예외 발생]', error);
    return false;
  }
}

// 그룹 정보 조회
export async function getGroupInfo(groupId: string) {
  const supabase = await createClient();
  try {
    // 주의: group_members(count) 조인은 현재 RLS(본인 row만) 때문에 정확한 카운트를 못 만듦
    const { data, error } = await supabase
      .from('groups')
      .select(
        'id, name, timezone, day_start_hour, apply_penalty_weekend, penalty_title',
      )
      .eq('id', groupId)
      .single();

    if (error) {
      console.error(`[그룹 정보 조회 실패] ID: ${groupId}`, error.message);
      return null;
    }

    const groupInfo: GroupInfo = {
      id: data.id,
      name: data.name,
      timezone: data.timezone,
      day_start_hour: data.day_start_hour,
      apply_penalty_weekend: data.apply_penalty_weekend,
      penalty_title: data.penalty_title,
    };

    return groupInfo;
  } catch (error) {
    console.error('[그룹 정보 조회]', error);
    return null;
  }
}

// 그룹 멤버 리스트 조회 (User 테이블 조인)
export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const supabase = await createClient();
  const admin = createAdminClient();

  try {
    // 요청자 확인
    const { data: me, error: meErr } = await supabase.auth.getUser();
    const uid = me?.user?.id;

    if (meErr || !uid) {
      console.error('[Auth Error]', meErr);
      return [];
    }

    // 멤버 검증 - validateGroupUser
    const isMember = await validateGroupUser(uid, groupId);
    if (!isMember) return [];

    // 실제 멤버 목록은 admin으로 조회 (RLS: group_members 본인만 SELECT라서 일반 조회 불가)
    const { data: members, error } = await admin
      .from('group_members')
      .select(
        `
        user_id,
        role,
        total_penalty_count,
        current_penalty_count,
        joined_at
      `,
      )
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true }); // 가입순 정렬

    if (error || !members) {
      console.error('[GroupMembers Fetch Error]', error);
      return [];
    }

    const userIds = members.map((m: any) => m.user_id);

    // github_infos도 admin으로 필요한 컬럼만 조회 (이메일 제외)
    const { data: infos, error: infosErr } = await admin
      .from('github_infos')
      .select('user_id, github_id, nickname, profile_image')
      .in('user_id', userIds);

    if (infosErr) {
      console.error('[github_infos Fetch Error]', infosErr);
    }

    const infoMap = new Map<string, any>(
      (infos ?? []).map((i: any) => [i.user_id, i]),
    );

    const response = members.map((member: any) => {
      const info = infoMap.get(member.user_id);

      return {
        user_id: member.user_id,
        github_id: info?.github_id || '',
        // TODO: - 타입 내 email 값 없애기
        email: '', // 이메일 노출 안 함
        nickname: info?.nickname || 'Unknown',
        profile_image: info?.profile_image || '',
        role: member.role,
        total_penalty_count: member.total_penalty_count,
        current_penalty_count: member.current_penalty_count,
        joined_at: member.joined_at,
      };
    });

    return response;
  } catch (error) {
    console.error('[GroupMembers Exception]', error);
    return [];
  }
}

export async function getGroupMembersWithTodayCommitCount(
  groupId: string,
): Promise<GroupMemberWithCommit[]> {
  const admin = createAdminClient();

  // 기존 멤버 목록
  const members: GroupMember[] = await getGroupMembers(groupId);
  if (members.length === 0) return [];
  const today = getGitPoorDate(new Date().toISOString());
  const memberIds = members.map((m) => m.user_id);

  // 오늘 커밋 조회 (admin)
  const { data: rows, error } = await admin
    .from('commits')
    .select('user_id')
    .in('user_id', memberIds)
    .eq('commit_date', today);

  if (error) {
    console.error('[TodayCommit Fetch Error]', error);
    return members.map((m) => ({ ...m, today_commit_count: 0 }));
  }

  // user_id별 카운트
  const countMap = new Map<string, number>();
  (rows ?? []).forEach((r: any) => {
    countMap.set(r.user_id, (countMap.get(r.user_id) ?? 0) + 1);
  });

  return members.map((m) => ({
    ...m,
    today_commit_count: countMap.get(m.user_id) ?? 0,
  }));
}

// 그룹 상세 정보 완성 (그룹 정보 + 멤버 리스트 )
export async function getGroupDetail(
  groupId: string,
): Promise<GroupDetail | null> {
  const [groupInfo, members] = await Promise.all([
    getGroupInfo(groupId),
    getGroupMembersWithTodayCommitCount(groupId),
  ]);

  // 그룹 정보가 없으면 상세 페이지를 보여줄 수 없음
  if (!groupInfo) {
    return null;
  }

  // 최종 조합
  return {
    group_info: groupInfo,
    members: members,
  };
}

// 요청 유저 그룹 내 role 반환
export async function getGroupRole(
  groupId: string,
  user_id: string,
): Promise<GroupRole | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user_id)
      .maybeSingle();

    if (error || !data) {
      console.error('[GroupMembers Fetch Error]', error);
      return null;
    }

    return getGroupRoleKey(data.role) || null;
  } catch (error) {
    console.error('[GroupMembers Exception]', error);
    return null;
  }
}
