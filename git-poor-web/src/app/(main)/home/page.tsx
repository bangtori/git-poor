import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import GroupListSection from './_components/group/group-list';
import MyProfileSection from './_components/profile/my-profile-section';
import { TodayCommitSummary, GroupSummary, PaginationMeta } from '@/types';
import { getTodayCommitData } from '@/services/commit-service';
import { getCachedUser } from '@/lib/utils/auth-utils';
import AutoSyncManager from './_components/auto-sync-manager';
import { getLastSyncDate } from '@/services/github-service';
import { SyncProvider } from '@/components/providers/sync-provider';
import { getMyGroupsService } from '@/services/group-service';
import { AppError } from '@/lib/error/app-error';

interface HomePageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const supabase = await createClient();

  const user = await getCachedUser();
  if (!user) {
    redirect('/');
  }

  // 섹션 데이터를 병렬로 fetch — 하나가 실패해도 나머지는 유지
  const [groupsResult, commitResult, syncResult] = await Promise.allSettled([
    getMyGroupsService(user.id, 1, 10),
    getTodayCommitData(supabase, user.id),
    getLastSyncDate(supabase, user.id),
  ]);

  // UNAUTHENTICATED 에러는 전체 에러 페이지로 throw
  for (const result of [groupsResult, commitResult, syncResult]) {
    if (
      result.status === 'rejected' &&
      result.reason instanceof AppError &&
      result.reason.code === 'UNAUTHENTICATED'
    ) {
      throw result.reason;
    }
  }

  // 성공 시 데이터, 실패 시 null → 각 섹션 컴포넌트에서 에러 카드 표시
  const groupsData =
    groupsResult.status === 'fulfilled' ? groupsResult.value : null;

  const commitData =
    commitResult.status === 'fulfilled' ? commitResult.value : null;

  const lastSyncDate =
    syncResult.status === 'fulfilled' ? syncResult.value : null;

  // 탭 로직
  const params = await searchParams;
  const view = params.view;
  const isGroupView = view === 'group';

  const GroupSection = () => (
    <main className="max-w-4xl mx-auto">
      <GroupListSection
        initialGroups={groupsData?.data ?? null}
        initialMeta={groupsData?.meta ?? null}
      />
    </main>
  );

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-white p-8">
          로딩 중...
        </div>
      }
    >
      <SyncProvider>
        <AutoSyncManager lastSyncDate={lastSyncDate} />
        <div className="min-h-screen bg-background text-white p-8">
          {/* 모바일 */}
          <div className="block md:hidden">
            {isGroupView ? (
              <GroupSection />
            ) : (
              <MyProfileSection user={user} initialCommit={commitData} />
            )}
          </div>

          {/* 데스크탑 */}
          <div className="hidden md:grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-5 space-y-6">
              <MyProfileSection user={user} initialCommit={commitData} />
            </div>

            <div className="col-span-12 lg:col-span-7 space-y-6">
              <GroupSection />
            </div>
          </div>
        </div>
      </SyncProvider>
    </Suspense>
  );
}
