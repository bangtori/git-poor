'use client';

import DefaultCard from '@/components/ui/default-card';
import FilledButton from '@/components/ui/filled-button';

interface TodayCommitCardProps {
  currentFine?: number;
  hasCommit?: boolean;
  onRefresh?: () => void;
}

const TodayCommitCard = ({
  currentFine = 1000,
  hasCommit = false,
  onRefresh,
}: TodayCommitCardProps) => {
  return (
    <DefaultCard title="오늘의 커밋 🌿">
      <div className="flex flex-col items-center justify-center py-8 bg-background-input rounded-xl border border-dashed border-gray-700 min-h-[200px]">
        {/* hasCommit 상태에 따라 다른 UI 보여주기 */}
        {hasCommit ? (
          <>
            <span className="text-5xl mb-4">🔥</span>
            <p className="text-primary font-bold text-lg">오늘의 커밋 완료!</p>
            <p className="text-gray-400 text-sm mt-1">
              훌륭합니다! 벌금이 면제되었습니다.
            </p>
          </>
        ) : (
          <>
            <span className="text-5xl mb-4">😴</span>
            <p className="text-gray-400">아직 커밋이 감지되지 않았습니다.</p>
            <p className="text-danger font-bold mt-2 text-lg">
              현재 벌금: {currentFine.toLocaleString()}원
            </p>
          </>
        )}
      </div>

      <div className="mt-4">
        <FilledButton onClick={onRefresh} className="w-full">
          커밋 확인하기 (새로고침)
        </FilledButton>
      </div>
    </DefaultCard>
  );
};

export default TodayCommitCard;
