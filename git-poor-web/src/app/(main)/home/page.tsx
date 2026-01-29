import { createClient } from '@/lib/supabase/server';
import { UserProfileCard } from '@/app/(main)/home/_components/profile/user-profile-card';
import { redirect } from 'next/navigation';
import { Headers } from '@/components/common/headers';
import TodayCommitCard from './_components/profile/today-commit-card';
import GroupListSection from './_components/group/group-list';
import { StreakBadge } from './_components/profile/streak_badge';
import {
  MOCK_TODAY_SUMMARY_NO_COMMIT,
  MOCK_TODAY_SUMMARY,
  MOCK_TODAY_SUMMARY_MANY_LANGS,
} from '@/mocks/today_commit';

interface HomePageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  // 탭 로직
  const params = await searchParams;
  const view = params.view;
  const isGroupView = view === 'group';

  // 기본 홈 화면 - 내 프로필
  const MyProfileSection = () => (
    <main className="max-w-4xl mx-auto">
      <UserProfileCard user={user} isCommitted={false} count={5} />
      <StreakBadge count={5} />
      <TodayCommitCard commit={MOCK_TODAY_SUMMARY_NO_COMMIT} currentFine={0} />

      <TodayCommitCard commit={MOCK_TODAY_SUMMARY} currentFine={0} />

      <TodayCommitCard commit={MOCK_TODAY_SUMMARY_MANY_LANGS} currentFine={0} />
    </main>
  );

  // 그룹 리스트 화면 (?view=group )
  const GroupSection = () => (
    <main className="max-w-4xl mx-auto">
      <GroupListSection />
    </main>
  );
  return (
    <div className="min-h-screen bg-background text-white p-8">
      <Headers user={user} />
      {/* ================================================= */}
      {/* 모바일 (md:hidden) - 탭에 따라 하나씩 보여줌 */}
      {/* ================================================= */}
      <div className="block md:hidden">
        {isGroupView ? <GroupSection /> : <MyProfileSection />}
      </div>

      {/* ================================================= */}
      {/* 데스크탑 (hidden md:grid) - 둘 다 보여줌 */}
      {/* ================================================= */}

      <div className="hidden md:grid grid-cols-12 gap-6">
        {/* 왼쪽: 프로필 (5칸) */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <h2 className="text-2xl font-bold mb-2">대시보드</h2>
          <MyProfileSection />
        </div>

        {/* 오른쪽: 그룹 (7칸) */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <h2 className="text-2xl font-bold mb-2">그룹 현황</h2>
          <GroupSection />
        </div>
      </div>
    </div>
  );
}
