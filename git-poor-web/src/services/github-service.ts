// src/services/github-service.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '@/lib/error/app-error';

/**
 * 특정 유저의 마지막 GitHub 동기화 시간을 조회합니다.
 * @param supabase - Supabase 클라이언트
 * @param userId - 조회할 유저 ID
 * @returns last_sync_date (ISO string) or null (기록 없음)
 */
export async function getLastSyncDate(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('github_infos')
    .select('last_sync_date')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new AppError(
      'SERVER_ERROR',
      '마지막 동기화 시간 조회에 실패했습니다.',
      error,
    );
  }

  return data?.last_sync_date || null;
}
