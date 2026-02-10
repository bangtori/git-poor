import { Streak } from './streak';

/**
 * GitPoor 커밋 데이터 정보
 */
export interface Commit {
  /** 커밋 고유 식별자 (UUID) */
  id: string;

  /** 사용자 고유 식별자 (Foreign Key) */
  user_id: string;

  /** GitHub 기준 커밋 식별 해시값 */
  commit_sha: string;

  /** 저장소 이름 */
  repository_name: string;

  /** GitHub 기준 실제 커밋 시각 (ISO 8601) */
  committed_at: string;

  /** * GitPoor 하루 기준 계산 결과 (05:00 갱신 기준)
   * 예: 2026-01-29
   */
  commit_date: string;

  /** 추가된 코드 라인 수 */
  additions: number;

  /** 삭제된 코드 라인 수 */
  deletions: number;

  /** 총 변경 라인 수 (additions + deletions 캐시값) */
  total_changes: number;

  /** 사용된 프로그래밍 언어 리스트 (ex: ["Swift", "TypeScript"]) */
  languages: string[];

  /** 수정된 파일 확장자 리스트 (ex: ["swift", "md"]) */
  file_extensions: string[];

  /** Private 레포지토리 여부 */
  is_private: boolean;

  /** GitHub 커밋 상세 페이지 URL (비공개 레포인 경우 null일 수 있음) */
  commit_url: string | null;

  /** 데이터베이스 레코드 생성 시각 */
  created_at: string;
}

/**
 * 대시보드 상단 '오늘의 커밋' 카드 전용 타입
 */
export interface TodayCommitSummary {
  date: string; // "2026-01-29"
  total_changes: number; // 오늘 발생한 모든 커밋의 total_changes 합계
  commit_count: number; // 오늘 총 커밋수 -> 조직 커밋의 경우 노이즈 생길 수 있음
  languages: string[]; // 오늘 사용된 언어들 (중복 제거된 Set 결과물)
  is_success: boolean; // 커밋 여부 (total_changes > 0)
  streak: Streak;
}

/**
 * 특정 날짜 커밋 데이터 디테일 전용 타입
 */

// src/types/commit.ts

export interface CommitDetail {
  id: number;
  repo_name: string;
  commit_sha: string;
  commit_url: string;
  total_changes: number;
  additions: number;
  deletions: number;
  languages: string[];
  committed_at: string; // ISO Date string
  commit_date: string;
}
