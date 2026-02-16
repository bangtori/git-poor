// src/services/group-service.ts
import { createClient } from '@/lib/supabase/server';
import {
  GroupDetail,
  GroupInfo,
  GroupMember,
  GroupRole,
  GroupSummary,
  getGroupRoleKey,
} from '@/types';

export async function getMyGroupsService(
  userId: string,
  page: number = 1,
  limit: number = 10,
) {
  const supabase = await createClient();

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
  const { data: groups } = await supabase
    .from('groups')
    .select('*, group_members (count)')
    .in('id', groupIds)
    .order('created_at', { ascending: false });

  if (!groups) return { data: [], totalCount: 0 };

  // 데이터 가공
  const formattedData: GroupSummary[] = groups.map((group) => {
    const myMembership = myMemberships.find((m) => m.group_id === group.id);
    return {
      id: group.id,
      name: group.name,
      penalty_title: group.penalty_title,
      day_start_hour: group.day_start_hour,
      is_owner: group.owner_id === userId,
      // @ts-ignore
      member_count: group.group_members[0]?.count || 0,
      my_penalty_count: myMembership?.total_penalty_count || 0,
    };
  });

  return { data: formattedData, totalCount: totalCount ?? 0 };
}

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
    const { data, error } = await supabase
      .from('groups')
      .select('*, group_members(count)')
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

  try {
    // group_members 테이블과 users 테이블을 조인해서 가져옵니다.
    const { data, error } = await supabase
      .from('group_members')
      .select(
        `
        *,
        users (
          github_infos (
            github_id,
            email,
            nickname,
            profile_image
          )
        )
      `,
      )
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true }); // 가입순 정렬

    if (error || !data) {
      console.error('[GroupMembers Fetch Error]', error);
      return [];
    }

    const response = data.map((member: any) => {
      // users 내부의 github_infos 추출
      const github = member.users?.github_infos;

      // 만약 배열로 넘어온다면 첫 번째 요소를 사용, 아니면 객체 그대로 사용
      const info = Array.isArray(github) ? github[0] : github;

      return {
        user_id: member.user_id,
        github_id: info?.github_id || '',
        email: info?.email || '',
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

// 그룹 상세 정보 완성 (그룹 정보 + 멤버 리스트)
export async function getGroupDetail(
  groupId: string,
): Promise<GroupDetail | null> {
  const [groupInfo, members] = await Promise.all([
    getGroupInfo(groupId),
    getGroupMembers(groupId),
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
      .single();

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