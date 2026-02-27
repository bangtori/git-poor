'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { shouldRunAutoSync } from '@/lib/utils/sync-check';
import { useSync } from '@/components/providers/sync-provider';
import { ApiResponse } from '@/lib/http/reponse';
import { TodayCommitSummary } from '@/types';
import { handleActionError } from '@/lib/error/handle-action-error';

interface AutoSyncManagerProps {
  lastSyncDate: string | null; // DB에서 가져온 마지막 동기화 시간 (ISO String)
}

export default function AutoSyncManager({
  lastSyncDate,
}: AutoSyncManagerProps) {
  const router = useRouter();
  const isSyncingRef = useRef(false);
  const { setIsSyncing } = useSync();

  useEffect(() => {
    const checkAndSync = async () => {
      if (isSyncingRef.current) return;

      // 유틸 함수를 통해 동기화 필요 여부 판단
      const isSyncNeeded = shouldRunAutoSync(lastSyncDate);

      if (isSyncNeeded) {
        isSyncingRef.current = true;
        setIsSyncing(true);
        console.log(
          '[AutoSync] 마지막 동기화로부터 시간이 경과하여 동기화를 시작합니다...',
        );
        try {
          // 동기화 API 호출 (POST)
          const response = await fetch('/api/commits/sync', { method: 'POST' });
          const result: ApiResponse<TodayCommitSummary> = await response.json();

          if (result.success) {
            console.log(
              '[AutoSync] 동기화 완료! 데이터를 갱신합니다.',
              result.data,
            );

            // 성공 시 현재 페이지 새로고침
            router.refresh();
          } else {
            handleActionError(result.error);
          }
        } catch (error) {
          console.error('[AutoSync] 에러 발생:', error);
        } finally {
          isSyncingRef.current = false;
          setIsSyncing(false);
        }
      } else {
        console.log('[AutoSync] 최신 상태입니다. (동기화 스킵)');
      }
    };

    checkAndSync();
  }, [lastSyncDate, router]); // lastSyncDate가 바뀌거나 페이지가 로드될 때 실행

  // UI는 렌더링하지 않음 (기능만 수행)
  return null;
}
