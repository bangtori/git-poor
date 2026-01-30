// src/lib/commit-service.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { getGitPoorDate } from '@/lib/utils/date-utils';
import { TodayCommitSummary } from '@/types';

export async function getTodayCommitData(
  supabase: SupabaseClient,
  userId: string,
): Promise<TodayCommitSummary> {
  const todayDate = getGitPoorDate(new Date().toISOString());

  // DB 조회 -> commits Table에서 user_id가 접속유저이고, commit_date 가 오늘인 데이터 불러오기
  const { data: commits } = await supabase
    .from('commits')
    .select('*')
    .eq('user_id', userId)
    .eq('commit_date', todayDate);

  // 데이터 없으면 기본값 리턴
  if (!commits || commits.length === 0) {
    return {
      date: todayDate,
      commit_count: 0,
      total_changes: 0,
      languages: [],
      is_success: false,
    };
  }

  // 데이터 있으면 계산 대시보드용 계산
  const totalChanges = commits.reduce(
    (acc: number, curr: any) => acc + curr.total_changes,
    0,
  );
  const languages = Array.from(
    new Set(commits.flatMap((c: any) => c.languages as string[])),
  ) as string[];

  return {
    date: todayDate,
    commit_count: commits.length,
    total_changes: totalChanges,
    languages: languages,
    is_success: true,
  };
}
