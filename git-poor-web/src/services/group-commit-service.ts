// src/services/group-commit-service.ts
import { createAdminClient } from '@/lib/supabase/admin';
import { getGitPoorDate } from '@/lib/utils/date-utils';
import { CommitDetail } from '@/types';
import { AppError } from '@/lib/error/app-error';

/**
 * 특정 멤버의 오늘 커밋 리스트를 조회한다.
 * 그룹 멤버 상세 페이지에서 사용.
 * RLS를 우회하기 위해 admin client 사용 (다른 유저의 커밋 조회).
 */
export async function getMemberTodayCommits(
  userId: string,
): Promise<CommitDetail[]> {
  const admin = createAdminClient();
  const todayDate = getGitPoorDate(new Date().toISOString());

  const { data, error } = await admin
    .from('commits')
    .select(
      'id, repo_name, commit_sha, commit_url, total_changes, additions, deletions, languages, committed_at, commit_date',
    )
    .eq('user_id', userId)
    .eq('commit_date', todayDate)
    .order('committed_at', { ascending: false });

  if (error) {
    throw new AppError(
      'SERVER_ERROR',
      '멤버의 오늘 커밋 데이터 조회에 실패했습니다.',
      error,
    );
  }

  // DB 컬럼명 -> CommitDetail 필드명 매핑
  return (data ?? []).map((row) => ({
    id: row.id,
    repo_name: row.repo_name,
    commit_sha: row.commit_sha,
    commit_url: row.commit_url,
    total_changes: row.total_changes,
    additions: row.additions,
    deletions: row.deletions,
    languages: row.languages ?? [],
    committed_at: row.committed_at,
    commit_date: row.commit_date,
  }));
}
