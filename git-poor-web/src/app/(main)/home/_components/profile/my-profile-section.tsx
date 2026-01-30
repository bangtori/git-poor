'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { UserProfileCard } from './user-profile-card';
import { StreakBadge } from './streak_badge';
import TodayCommitCard from './today-commit-card';
import { TodayCommitSummary } from '@/types';
import { createClient } from '@/lib/supabase/client';

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
          } else {
            console.log('✅ GitHub 토큰 저장 완료 (tokens 테이블)');
          }
        } catch (err) {
          console.error('토큰 동기화 에러:', err);
        }
      }
    };

    syncToken();
  }, [user.id]);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/commits/sync', { method: 'POST' });
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

      {/* 연속학습 일 수 로직 연결 */}
      <StreakBadge count={5} />

      <TodayCommitCard
        commit={commitSummary}
        isLoading={isLoading}
        onRefresh={handleSync}
        currentFine={0}
      />
    </main>
  );
}
