// src/lib/streak-service.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { getGitPoorDate } from '@/lib/utils/date-utils';

export async function updateStreakIncremental(
  supabase: SupabaseClient,
  userId: string,
) {
  const now = new Date();
  const today = getGitPoorDate(now.toISOString());

  // 유저 정보와 마지막 동기화 날짜 가져오기
  const { data: userInfo } = await supabase
    .from('users')
    .select('current_streak, longest_streak')
    .eq('id', userId)
    .single();

  const { data: githubInfo } = await supabase
    .from('github_infos')
    .select('last_sync_date')
    .eq('user_id', userId)
    .single();

  const prevStreak = userInfo?.current_streak || 0;
  const prevLongest = userInfo?.longest_streak || 0;

  // 마지막 동기화 날짜를 GitPoor 기준 날짜(KST 05:00)로 변환
  const lastSyncDate = githubInfo?.last_sync_date
    ? getGitPoorDate(githubInfo.last_sync_date)
    : null;

  // 오늘 이미 동기화(및 스트릭 정산)를 마쳤는지 확인
  if (lastSyncDate === today) {
    // 이미 오늘 스트릭이 계산됨. last_sync_date 시간만 업데이트하고 종료
    await supabase
      .from('github_infos')
      .update({ last_sync_date: now.toISOString() })
      .eq('user_id', userId);
    return { current: prevStreak, longest: prevLongest };
  }

  // 어제 커밋 여부 확인 (연속성 판단)
  const yesterdayDate = new Date(today);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  let newStreak = 1; // 기본값 (연속 끊김 시 다시 1일)

  if (lastSyncDate === yesterday) {
    newStreak = prevStreak + 1;
  }

  const newLongest = Math.max(newStreak, prevLongest);

  // DB 일괄 업데이트
  // Users 테이블: 스트릭 갱신
  const userResponse = await supabase
    .from('users')
    .update({ current_streak: newStreak, longest_streak: newLongest })
    .eq('id', userId)
    .select(); // 💡 중요: 업데이트 후 결과를 즉시 가져옴

  console.log('--- [DEBUG] Users 테이블 결과 ---');
  console.log('업데이트 데이터:', userResponse.data); // 이게 [] 빈 배열이면 수정 권한(RLS) 문제
  if (userResponse.error) console.error('에러 발생:', userResponse.error);

  // GithubInfos 테이블: 동기화 시간 기록
  const githubResponse = await supabase
    .from('github_infos')
    .update({ last_sync_date: now.toISOString() })
    .eq('user_id', userId)
    .select();

  console.log('--- [DEBUG] GithubInfos 결과 ---');
  console.log('업데이트 데이터:', githubResponse.data);
  if (githubResponse.error) console.error('에러 발생:', githubResponse.error);

  return { current: newStreak, longest: newLongest };
}

export async function getStreakData(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('current_streak, longest_streak')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.warn('⚠️ 스트릭 정보를 가져올 수 없습니다:', error?.message);
    return {
      current_streak: 0,
      longest_streak: 0,
    };
  }

  return {
    current_streak: data.current_streak || 0,
    longest_streak: data.longest_streak || 0,
  };
}
