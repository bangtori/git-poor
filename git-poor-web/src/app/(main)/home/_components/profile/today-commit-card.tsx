// src/app/(main)/home/_components/profile/today-commit-card.tsx
'use client';

import DefaultCard from '@/components/ui/default-card';
import FilledButton from '@/components/ui/filled-button';
import { TodayCommitSummary } from '@/types';
import { cn } from '@/lib/utils/tailwind-utils';

interface TodayCommitCardProps {
  currentFine: number;
  commit: TodayCommitSummary;
  isLoading: boolean;
  onRefresh?: () => void;
}

const TodayCommitCard = ({
  currentFine = 1000,
  commit,
  isLoading,
  onRefresh,
}: TodayCommitCardProps) => {
  return (
    <DefaultCard title="오늘의 커밋">
      <div
        className={cn(
          'flex flex-col items-center justify-center py-8 bg-background-input rounded-xl border border-dashed min-h-[200px] transition-colors',
          commit.is_success ? 'border-primary/50' : 'border-danger/50',
        )}
      >
        {commit.is_success ? (
          <>
            <p className="text-primary font-bold text-lg mb-2">
              오늘의 커밋 완료!
            </p>
            <div className="text-center">
              <p className="text-text-primary text-sm mt-1">
                반영된 Commit 수: {commit.commit_count} 개
              </p>
              <p className="text-text-primary text-sm mt-1">
                총 변경 Line 수: {commit.total_changes} line
              </p>
              <p className="text-text-primary text-sm mt-1">
                Language: {commit.languages.slice(0, 3).join(', ')}
                {commit.languages.length > 3 && '...'}
              </p>
            </div>
          </>
        ) : (
          <>
            <span className="text-5xl mb-4">😴</span>
            <p className="text-text-secondary">
              아직 커밋이 감지되지 않았습니다.
            </p>
            <p className="text-danger font-bold mt-2 text-lg">
              현재 벌금: {currentFine.toLocaleString()}원
            </p>
          </>
        )}
      </div>

      <div className="mt-4">
        <FilledButton
          onClick={onRefresh}
          disabled={isLoading} // 로딩 중 버튼 비활성화
          className="w-full"
        >
          {isLoading ? (
            <span>
              <span className="animate-spin text-lg">⏳</span> 동기화 중...
            </span>
          ) : (
            '커밋 확인하기 (새로고침)'
          )}
        </FilledButton>
      </div>
    </DefaultCard>
  );
};

export default TodayCommitCard;
