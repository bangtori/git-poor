// src/services/group-service.ts
import { createClient } from '@/lib/supabase/server';
import { GroupSummary } from '@/types';

export async function getMyGroupsService(
  userId: string,
  page: number = 1,
  limit: number = 10,
) {
  console.log('UserId!!@ - ' + userId);
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

  console.log(myMemberships);

  if (myMembershipsError) {
    console.error(
      '🔥 Supabase Query Error:',
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
