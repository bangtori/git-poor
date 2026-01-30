// src/lib/commit-service.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { getGitPoorDate } from '@/lib/utils/date-utils';
import { TodayCommitSummary } from '@/types';

export async function getTodayCommitData(
  supabase: SupabaseClient,
  userId: string,
): Promise<TodayCommitSummary> {
  const todayDate = getGitPoorDate(new Date().toISOString());

  // DB 조회
  const { data: commits } = await supabase
    .from('commits') // 테이블명 확인
    .select('*')
    .eq('user_id', userId)
    .eq('commit_date', todayDate);

  // 데이터가 없으면 기본값(0) 리턴
  if (!commits || commits.length === 0) {
    return {
      date: todayDate,
      commit_count: 0,
      total_changes: 0,
      languages: [],
      is_success: false,
    };
  }

  // 데이터 가공 (통계 계산)
  const totalChanges = commits.reduce(
    (acc, curr) => acc + curr.total_changes,
    0,
  );

  // 타입 에러 방지를 위해 as string[] 사용
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
