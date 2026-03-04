/**
 * Preview 모드용 Home 페이지 Mock 데이터
 *
 * - TodayCommitSummary (Streak 포함)
 * - lastSyncDate
 */
import type { TodayCommitSummary } from '@/types';

// ─── 오늘의 커밋 요약 ───────────────────────────────────────

export const mockTodayCommitSummary: TodayCommitSummary = {
  date: new Date().toISOString().slice(0, 10), // 오늘 날짜 (YYYY-MM-DD)
  total_changes: 247,
  commit_count: 5,
  languages: ['TypeScript', 'CSS', 'Markdown'],
  is_success: true,
  streak: {
    current_streak: 12,
    longest_streak: 45,
  },
};

// ─── AutoSyncManager 비활성화용 ──────────────────────────────
// 현재 시간을 넣으면 shouldRunAutoSync()가 false를 반환하여 동기화 차단
export const mockLastSyncDate: string = new Date().toISOString();
