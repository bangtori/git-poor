import { mockCommitDetails } from '@/lib/preview/mock-history';
import { getMockGroupDetail } from '@/lib/preview/mock-groups';
import CommitListCell from '@/app/(main)/history/_components/commit_list_cell';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface PreviewMemberCommitsPageProps {
  params: { id: string; memberId: string };
}

export default async function PreviewMemberCommitsPage({
  params,
}: PreviewMemberCommitsPageProps) {
  const { id, memberId } = await params;
  const { members } = getMockGroupDetail(id);
  const member = members.find((m) => m.user_id === memberId);

  if (!member) return notFound();

  return (
    <main className="flex flex-col gap-4 w-full px-6 py-5">
      <Link
        href={`/preview/groups/${id}`}
        className="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors w-fit"
      >
        <ChevronLeft size={20} />
        <span>그룹으로 돌아가기</span>
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-text-primary">
          {member.github_id}
          <span className="text-text-secondary text-base font-normal ml-2">
            ({member.nickname})
          </span>
        </h1>
      </div>

      <p className="text-text-secondary text-sm">
        오늘 커밋: {member.today_commit_count}건
      </p>

      {member.today_commit_count === 0 ? (
        <p className="text-text-secondary text-center py-10">
          커밋 내역이 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-4 w-full">
          {mockCommitDetails
            .slice(0, member.today_commit_count)
            .map((commit) => (
              <CommitListCell commit={commit} key={commit.commit_sha} />
            ))}
        </ul>
      )}
    </main>
  );
}
