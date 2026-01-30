import DefaultCard from '@/components/ui/default-card';
import { Streak } from '@/types';
import { Flame } from 'lucide-react';

export const StreakBadge = ({ streakData }: { streakData: Streak }) => {
  return (
    <div className="hidden md:block">
      <DefaultCard title="">
        <div className="flex flex-col items-center gap-4 text-orange-500">
          <Flame size={100} fill="currentColor" />
          <div className="text-center">
            <p className="font-bold text-lg text-text-primary">
              {streakData.current_streak} 일 연속 커밋 중
            </p>
            <p className="font-bold text-xs text-text-secondary">
              최대 연속 커밋 일: {streakData.longest_streak}
            </p>
            <p className="font-bold text-xs text-text-secondary">
              연속 커밋을 향해 화이팅해요!
            </p>
          </div>
        </div>
      </DefaultCard>
    </div>
  );
};
