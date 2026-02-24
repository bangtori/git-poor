import { createClient } from '@/lib/supabase/server';

export interface DailyStat {
  commit_date: string;
  commit_count: number;
  total_changes: number;
}

export async function getHistoryMapByDateRange(
  userId: string,
  from: string,
  to: string,
) {
  const supabase = await createClient();

  const { data: commits, error } = await supabase
    .from('commits')
    .select('commit_date, total_changes')
    .eq('user_id', userId)
    .gte('commit_date', from)
    .lte('commit_date', to);

  if (error) {
    return { success: false, error };
  }

  const historyMap: Record<string, DailyStat> = {};

  commits?.forEach((c) => {
    const dateKey = c.commit_date;
    if (!historyMap[dateKey]) {
      historyMap[dateKey] = {
        commit_date: dateKey,
        commit_count: 0,
        total_changes: 0,
      };
    }
    historyMap[dateKey].commit_count += 1;
    historyMap[dateKey].total_changes += c.total_changes;
  });

  return { success: true, data: historyMap };
}
