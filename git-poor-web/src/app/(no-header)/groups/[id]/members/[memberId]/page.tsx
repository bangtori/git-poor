import { notFound } from 'next/navigation';
import { getCachedUser } from '@/lib/utils/auth-utils';
import { createAdminClient } from '@/lib/supabase/admin';
import { getMemberTodayCommits } from '@/services/group-commit-service';
import CommitListCell from '@/app/(main)/history/_components/commit_list_cell';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getGroupRole } from '@/services/group-service';

interface MemberCommitsPageProps {
  params: { id: string; memberId: string };
}

export default async function MemberCommitsPage({
  params,
}: MemberCommitsPageProps) {
  const { id, memberId } = await params;
  const user = await getCachedUser();

  if (!user) return notFound();

  await getGroupRole(id, user.id);

  const admin = createAdminClient();
  const { data: memberInfo, error: memberErr } = await admin
    .from('github_infos')
    .select('github_id, nickname, profile_image')
    .eq('user_id', memberId)
    .maybeSingle();

  if (memberErr) {
    console.error('[Member Info Fetch Error]', memberErr);
    return notFound();
  }

  if (!memberInfo) {
    console.error('멤버 정보를 찾을 수 없습니다.');
    return notFound();
  }

  const commits = await getMemberTodayCommits(memberId);

  return (
    <main className="flex flex-col gap-3 w-full px-6 py-5">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link
          href={`/groups/${id}`}
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronLeft size={28} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {memberInfo.github_id}
          </h1>
          <p className="text-sm text-text-secondary">오늘의 커밋</p>
        </div>
      </div>

      {/* 커밋 리스트 */}
      <div className="w-full flex px-2 mt-4">
        <div className="text-white w-full">
          <h2 className="text-xl font-bold mb-4 text-text-primary">
            Today&apos;s Commits ({commits.length})
          </h2>
          {commits.length === 0 ? (
            <p className="text-text-secondary text-lg text-center py-12">
              오늘 커밋이 없습니다 🌱
            </p>
          ) : (
            <ul className="flex flex-col gap-4 w-full">
              {commits.map((commit) => (
                <CommitListCell commit={commit} key={commit.commit_sha} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
