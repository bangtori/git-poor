import { CommitDetail } from '@/types';
import Link from 'next/link';
import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';
interface CommitListCellProps {
  commit: CommitDetail;
}
export default function CommitListCell({ commit }: CommitListCellProps) {
  return (
    <li className="w-full">
      <Link
        href={commit.commit_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="flex justify-between items-center w-full text-text-primary px-5 py-4 bg-background-card rounded-2xl hover:bg-opacity-80 transition-all">
          <div className="flex flex-col gap-2 flex-1 min-w-0 mr-4">
            {/* 상단: 레포 이름 & 시간 */}
            <div className="flex flex-col justify-between items-start">
              <h2 className="font-bold text-xl truncate w-full">
                {commit.repo_name}
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                {format(new Date(commit.committed_at), 'yyyy-MM-dd HH:mm')}
              </p>
            </div>

            {/* 중간: 라인 변경 내역 */}
            <div className="flex items-center gap-3 text-sm">
              <span className="font-bold text-text-primary">
                Total: {commit.total_changes}
              </span>
              <span className="text-green-500">+{commit.additions}</span>
              <span className="text-red-500">-{commit.deletions}</span>
            </div>

            {/* 하단: 언어 */}
            <p className="text-sm text-text-secondary">
              <span className="font-semibold text-text-tertiary mr-2 truncate w-full">
                Lang:
              </span>
              {commit.languages.slice(0, 3).join(', ')}
              {commit.languages.length > 3 && '...'}
            </p>
          </div>
          <ChevronRight size={30} className="text-text-tertiary" />
        </div>
      </Link>
    </li>
  );
}
