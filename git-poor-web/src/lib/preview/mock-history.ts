/**
 * Preview 모드용 History 페이지 Mock 데이터
 *
 * - DailyStat (캘린더 잔디용): 최근 1개월치
 * - CommitDetail[] (날짜 클릭 시 상세 커밋 목록)
 */
import type { CommitDetail } from '@/types/commit';

// ─── DailyStat 타입 (history-service.ts / calendar.tsx 와 동일) ───

interface DailyStat {
  commit_date: string;
  commit_count: number;
  total_changes: number;
}

// ─── 헬퍼: 날짜 문자열 생성 ──────────────────────────────────

/** 오늘 기준으로 N일 전 날짜를 'YYYY-MM-DD' 형태로 반환 */
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// ─── 캘린더 잔디용 DailyStat ─────────────────────────────────
// 최근 30일 중 약 20일치 데이터 (주말 일부 빈 날 포함, 리얼리틱한 패턴)

const historyEntries: [number, number, number][] = [
  // [daysAgo, commit_count, total_changes]
  [0, 5, 247],
  [1, 3, 182],
  [2, 7, 410],
  [3, 2, 95],
  [4, 4, 312],
  // 5일 전 — 주말 쉼
  [6, 1, 28],
  [7, 6, 389],
  [8, 4, 215],
  [9, 3, 167],
  [10, 5, 298],
  [11, 2, 73],
  // 12일 전 — 주말 쉼
  [13, 1, 42],
  [14, 8, 520],
  [15, 3, 156],
  [16, 6, 445],
  [17, 2, 88],
  [18, 4, 271],
  // 19일 전 — 주말 쉼
  [21, 3, 134],
  [22, 5, 367],
  [23, 1, 19],
  [24, 7, 483],
  [25, 2, 110],
  // 26일 전 — 주말 쉼
  [28, 4, 256],
  [29, 3, 189],
  [30, 2, 77],
];

export const mockHistoryMap: Record<string, DailyStat> = {};

for (const [ago, count, changes] of historyEntries) {
  const dateStr = daysAgo(ago);
  mockHistoryMap[dateStr] = {
    commit_date: dateStr,
    commit_count: count,
    total_changes: changes,
  };
}

// ─── 날짜 클릭 시 상세 커밋 목록 (CommitDetail[]) ────────────
// 오늘(daysAgo(0)) 기준 5건의 커밋 샘플

const today = daysAgo(0);

export const mockCommitDetails: CommitDetail[] = [
  {
    id: 1,
    repo_name: 'gitpoor-dev/git-poor-web',
    commit_sha: 'a3f8c1e2d4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9',
    commit_url: 'https://github.com/gitpoor-dev/git-poor-web/commit/a3f8c1e',
    total_changes: 89,
    additions: 62,
    deletions: 27,
    languages: ['TypeScript', 'CSS'],
    committed_at: `${today}T09:15:30+09:00`,
    commit_date: today,
  },
  {
    id: 2,
    repo_name: 'gitpoor-dev/git-poor-web',
    commit_sha: 'b4e9d2f3c5a6b7e8f9d0c1a2b3f4e5d6c7a8b9e0',
    commit_url: 'https://github.com/gitpoor-dev/git-poor-web/commit/b4e9d2f',
    total_changes: 45,
    additions: 38,
    deletions: 7,
    languages: ['TypeScript'],
    committed_at: `${today}T10:42:15+09:00`,
    commit_date: today,
  },
  {
    id: 3,
    repo_name: 'gitpoor-dev/algorithm-study',
    commit_sha: 'c5f0e3a4d6b7c8f9a0e1d2b3c4a5f6e7d8b9c0a1',
    commit_url: 'https://github.com/gitpoor-dev/algorithm-study/commit/c5f0e3a',
    total_changes: 52,
    additions: 52,
    deletions: 0,
    languages: ['Python'],
    committed_at: `${today}T14:20:00+09:00`,
    commit_date: today,
  },
  {
    id: 4,
    repo_name: 'gitpoor-dev/git-poor-web',
    commit_sha: 'd6a1f4b5e7c8d9a0f1e2c3b4d5a6f7e8c9b0a1d2',
    commit_url: 'https://github.com/gitpoor-dev/git-poor-web/commit/d6a1f4b',
    total_changes: 34,
    additions: 20,
    deletions: 14,
    languages: ['TypeScript', 'Markdown'],
    committed_at: `${today}T16:05:45+09:00`,
    commit_date: today,
  },
  {
    id: 5,
    repo_name: 'gitpoor-dev/git-poor-web',
    commit_sha: 'e7b2a5c6f8d9e0a1b2f3d4c5e6a7b8f9d0c1e2a3',
    commit_url: 'https://github.com/gitpoor-dev/git-poor-web/commit/e7b2a5c',
    total_changes: 27,
    additions: 15,
    deletions: 12,
    languages: ['CSS'],
    committed_at: `${today}T17:30:10+09:00`,
    commit_date: today,
  },
];
