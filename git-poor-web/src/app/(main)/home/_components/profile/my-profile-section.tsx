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
import { usePreviewUtils } from '@/lib/preview/preview-utils';

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
  const { isPreview, blocked } = usePreviewUtils();

  useEffect(() => {
    setCommitSummary(initialCommit);
  }, [initialCommit]);

  useEffect(() => {
    const syncToken = async () => {
      if (isPreview) return;

      const supabase = await createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.provider_token) return;

      try {
        const res = await fetch('/api/tokens/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider_token: session.provider_token,
            provider_refresh_token: session.provider_refresh_token ?? null,
            expires_at: session.expires_at ?? null,
          }),
        });

        const result: ApiResponse<boolean> = await res.json();

        if (!result.success) {
          // UX는 굳이 alert까지 안 띄워도 됨(백그라운드 동기화)
          console.error('[Token Sync Failed]', result.error);
          // 필요하면 handleActionError(result.error);
        }
      } catch (err) {
        console.error('[Token Sync Error]', err);
      }
    };

    syncToken();
  }, [user.id, isPreview]);

  const handleSync = async () => {
    if (isPreview) return blocked();
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
