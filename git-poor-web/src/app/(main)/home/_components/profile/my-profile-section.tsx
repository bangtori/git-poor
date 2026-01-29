'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { UserProfileCard } from './user-profile-card';
import { StreakBadge } from './streak_badge';
import TodayCommitCard from './today-commit-card';
import { TodayCommitSummary } from '@/types';

interface MyProfileSectionProps {
  user: User;
  initialCommit: TodayCommitSummary; // 서버에서 받아온 초기 데이터
}

export default function MyProfileSection({
  user,
  initialCommit,
}: MyProfileSectionProps) {
  const [commitSummary, setCommitSummary] =
    useState<TodayCommitSummary>(initialCommit);
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/sync-commits', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        // 성공 시 상태 업데이트 -> UserProfileCard와 TodayCommitCard가 동시에 바뀜!
        setCommitSummary(data.data);
      }
    } catch (error) {
      alert('동기화 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto space-y-6">
      <UserProfileCard
        user={user}
        isCommitted={commitSummary.is_success}
        count={5} // TODO: 연속학습 일 수 로직 연결
      />

      {/* 연속학습 일 수 로직 연결*/}
      <StreakBadge count={5} />

      {/* 2. 데이터와 핸들러를 커밋 카드에 전달 */}
      <TodayCommitCard
        commit={commitSummary}
        isLoading={isLoading}
        onRefresh={handleSync}
        currentFine={0}
      />
    </main>
  );
}
