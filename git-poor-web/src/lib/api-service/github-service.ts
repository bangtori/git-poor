// src/lib/api-service/github-service.ts
import { SupabaseClient } from '@supabase/supabase-js';

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
  try {
    const { data, error } = await supabase
      .from('github_infos')
      .select('last_sync_date')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch last sync date:', error.message);
      return null;
    }

    return data?.last_sync_date || null;
  } catch (error) {
    console.error('Error in getLastSyncDate:', error);
    return null;
  }
}
