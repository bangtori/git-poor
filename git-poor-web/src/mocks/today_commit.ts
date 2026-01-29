import { TodayCommitSummary } from '@/types';

// 일반 성공
export const MOCK_TODAY_SUMMARY: TodayCommitSummary = {
  date: '2026-01-29',
  total_changes: 245, // 여러 커밋의 합계
  commit_count: 5,
  languages: ['TypeScript', 'Swift'],
  is_success: true,
};

// 언어가 많을 때
export const MOCK_TODAY_SUMMARY_MANY_LANGS: TodayCommitSummary = {
  date: '2026-01-29',
  total_changes: 3000,
  commit_count: 10,
  languages: ['Swift', 'TypeScript', 'Rust', 'Go', 'Python', 'HTML'],
  is_success: true,
};

export const MOCK_TODAY_SUMMARY_NO_COMMIT: TodayCommitSummary = {
  date: '2026-01-29',
  total_changes: 0,
  commit_count: 5,
  languages: [],
  is_success: false,
};
