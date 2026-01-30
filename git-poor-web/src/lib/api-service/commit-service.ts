// src/lib/api-service/commit-service.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { getGitPoorDate } from '@/lib/utils/date-utils';
import { TodayCommitSummary } from '@/types';

export async function getTodayCommitData(
  supabase: SupabaseClient,
  userId: string,
): Promise<TodayCommitSummary> {
  const todayDate = getGitPoorDate(new Date().toISOString());

  // DB 조회 (커밋 데이터와 유저 스트릭 정보를 병렬로 조회)
  const [commitRes, userRes] = await Promise.all([
    supabase
      .from('commits') // 테이블명 확인
      .select('*')
      .eq('user_id', userId)
      .eq('commit_date', todayDate),
    supabase
      .from('users')
      .select('current_streak, longest_streak')
      .eq('id', userId)
      .single(),
  ]);

  const commits = commitRes.data;

  // 스트릭 데이터 가공
  const streakData = {
    current_streak: userRes.data?.current_streak || 0,
    longest_streak: userRes.data?.longest_streak || 0,
  };

  // 데이터가 없으면 기본값(0) 리턴
  if (!commits || commits.length === 0) {
    return {
      date: todayDate,
      commit_count: 0,
      total_changes: 0,
      languages: [],
      is_success: false,
      streak: streakData,
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
    streak: streakData,
  };
}
