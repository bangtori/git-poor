import {
  mockTodayCommitSummary,
  mockLastSyncDate,
} from '@/lib/preview/mock-home';
import { mockGroups, mockGroupsMeta } from '@/lib/preview/mock-groups';
import { mockUser } from '@/lib/preview/mock-user';
import GroupListSection from '@/app/(main)/home/_components/group/group-list';
import { Suspense } from 'react';
import { SyncProvider } from '@/components/providers/sync-provider';
import AutoSyncManager from '@/app/(main)/home/_components/auto-sync-manager';
import MyProfileSection from '@/app/(main)/home/_components/profile/my-profile-section';
interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PreviewHomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const view = params.view;
  const isGroupView = view === 'group';

  const GroupSection = () => (
    <main className="max-w-4xl mx-auto">
      <GroupListSection
        initialGroups={mockGroups}
        initialMeta={mockGroupsMeta}
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
        <AutoSyncManager lastSyncDate={mockLastSyncDate} />
        <div className="min-h-screen bg-background text-white p-8">
          {/* 모바일 */}
          <div className="block md:hidden">
            {isGroupView ? (
              <GroupSection />
            ) : (
              <MyProfileSection
                user={mockUser}
                initialCommit={mockTodayCommitSummary}
              />
            )}
          </div>

          {/* 데스크탑 */}
          <div className="hidden md:grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-5 space-y-6">
              <MyProfileSection
                user={mockUser}
                initialCommit={mockTodayCommitSummary}
              />
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
