// src/services/streak-service.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { getGitPoorDate } from '@/lib/utils/date-utils';
import { AppError } from '@/lib/error/app-error';

export async function updateStreakIncremental(
  supabase: SupabaseClient,
  userId: string,
) {
  const now = new Date();
  const today = getGitPoorDate(now.toISOString());

  // 유저 정보와 마지막 동기화 날짜 가져오기
  const { data: userInfo, error: userInfoError } = await supabase
    .from('users')
    .select('current_streak, longest_streak')
    .eq('id', userId)
    .single();

  if (userInfoError) {
    throw new AppError(
      'SERVER_ERROR',
      '유저 스트릭 정보 조회에 실패했습니다.',
      userInfoError,
    );
  }

  const { data: githubInfo, error: githubInfoError } = await supabase
    .from('github_infos')
    .select('last_sync_date')
    .eq('user_id', userId)
    .single();

  if (githubInfoError) {
    throw new AppError(
      'SERVER_ERROR',
      'GitHub 정보 조회에 실패했습니다.',
      githubInfoError,
    );
  }

  const prevStreak = userInfo?.current_streak || 0;
  const prevLongest = userInfo?.longest_streak || 0;

  // 마지막 동기화 날짜를 GitPoor 기준 날짜(KST 05:00)로 변환
  const lastSyncDate = githubInfo?.last_sync_date
    ? getGitPoorDate(githubInfo.last_sync_date)
    : null;

  // 오늘 이미 동기화(및 스트릭 정산)를 마쳤는지 확인
  if (lastSyncDate === today) {
    // 이미 오늘 스트릭이 계산됨. last_sync_date 시간만 업데이트하고 종료
    const { error: updateError } = await supabase
      .from('github_infos')
      .update({ last_sync_date: now.toISOString() })
      .eq('user_id', userId);

    if (updateError) {
      throw new AppError(
        'SERVER_ERROR',
        '동기화 시간 업데이트에 실패했습니다.',
        updateError,
      );
    }

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
  const { error: userUpdateError } = await supabase
    .from('users')
    .update({ current_streak: newStreak, longest_streak: newLongest })
    .eq('id', userId);

  if (userUpdateError) {
    throw new AppError(
      'SERVER_ERROR',
      '스트릭 업데이트에 실패했습니다.',
      userUpdateError,
    );
  }

  // GithubInfos 테이블: 동기화 시간 기록
  const { error: githubUpdateError } = await supabase
    .from('github_infos')
    .update({ last_sync_date: now.toISOString() })
    .eq('user_id', userId);

  if (githubUpdateError) {
    throw new AppError(
      'SERVER_ERROR',
      '동기화 시간 기록에 실패했습니다.',
      githubUpdateError,
    );
  }

  return { current: newStreak, longest: newLongest };
}

export async function getStreakData(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('current_streak, longest_streak')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new AppError(
      'SERVER_ERROR',
      '스트릭 정보 조회에 실패했습니다.',
      error,
    );
  }

  return {
    current_streak: data.current_streak || 0,
    longest_streak: data.longest_streak || 0,
  };
}
