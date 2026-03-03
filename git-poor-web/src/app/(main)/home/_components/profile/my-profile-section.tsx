'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { UserProfileCard } from './user-profile-card';
import { StreakBadge } from './streak_badge';
import TodayCommitCard from './today-commit-card';
import { TodayCommitSummary } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { useSync } from '@/components/providers/sync-provider';
import { ApiResponse } from '@/lib/http/response';
import ErrorFallbackCard from '@/components/ui/error-fallback-card';
import { handleActionError } from '@/lib/error/handle-action-error';

interface MyProfileSectionProps {
  user: User;
  initialCommit: TodayCommitSummary | null;
}

export default function MyProfileSection({
  user,
  initialCommit,
}: MyProfileSectionProps) {
  const [commitSummary, setCommitSummary] = useState<TodayCommitSummary | null>(
    initialCommit,
  );
  const { isSyncing, setIsSyncing } = useSync();

  useEffect(() => {
    setCommitSummary(initialCommit);
  }, [initialCommit]);

  useEffect(() => {
    const syncToken = async () => {
      const supabase = await createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session && session.provider_token) {
        try {
          // 💡 스키마의 'tokens' 테이블에 저장
          const { error } = await supabase.from('tokens').upsert(
            {
              user_id: user.id,
              access_token: session.provider_token,
              refresh_token: session.provider_refresh_token || null,

              // 스키마: token_expires_at (timestamp with time zone)
              token_expires_at: session.expires_at
                ? new Date(session.expires_at * 1000).toISOString()
                : null,

              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' },
          ); // user_id가 unique이므로 충돌 시 업데이트

          if (error) {
            console.error('❌ 토큰 저장 실패:', error.message);
          }
        } catch (err) {
          console.error('토큰 동기화 에러:', err);
        }
      }
    };

    syncToken();
  }, [user.id]);

  const handleSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      const response = await fetch('/api/commits/sync', { method: 'POST' });
      const result: ApiResponse<TodayCommitSummary> = await response.json();

      if (result.success) {
        // 성공 시 상태 업데이트 -> UserProfileCard와 TodayCommitCard가 동시에 바뀜!
        setCommitSummary(result.data);
      } else {
        handleActionError(result.error);
      }
    } catch (error) {
      handleActionError({ message: '동기화 중 오류가 발생했습니다.' });
    } finally {
      setIsSyncing(false);
    }
  };

  if (!commitSummary) {
    return (
      <main className="max-w-4xl mx-auto space-y-6">
        <ErrorFallbackCard
          title="내 프로필"
          message="프로필 데이터를 불러올 수 없습니다"
          onRetry={() => window.location.reload()}
        />
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto space-y-6">
      <UserProfileCard
        user={user}
        isCommitted={commitSummary.is_success}
        streakData={commitSummary.streak}
      />

      <StreakBadge streakData={commitSummary.streak} />

      <TodayCommitCard
        commit={commitSummary}
        isLoading={isSyncing}
        onRefresh={handleSync}
        currentFine={0}
      />
    </main>
  );
}
