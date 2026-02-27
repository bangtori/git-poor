import { CommitDetail } from '@/types';
import CommitListCell from './commit_list_cell';

interface CommitListProps {
  selectedDate: string;
  commits: CommitDetail[];
}

export default function CommitList({ selectedDate, commits }: CommitListProps) {
  return (
    <div className="w-full flex px-8 mt-8">
      <div className="text-white w-full">
        <h2 className="text-2xl font-bold mb-5">{selectedDate} Commits</h2>
        {commits.length === 0 ? (
          <p className="text-text-secondary text-xl text-bold w-full text-center">
            커밋이 없습니다. 얼른 잔디를 심어주세요!
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
  );
}
