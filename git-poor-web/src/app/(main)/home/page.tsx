import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Headers } from '@/components/common/headers';
import GroupListSection from './_components/group/group-list';
import MyProfileSection from './_components/profile/my-profile-section';
import { getGitPoorDate } from '@/lib/utils/date-utils';
import { TodayCommitSummary } from '@/types';

async function getTodayCommitData(supabase: any, userId: string) {
  const todayDate = getGitPoorDate(new Date().toISOString());

  // DB 조회 -> commits Table에서 user_id가 접속유저이고, commit_date 가 오늘인 데이터 불러오기
  const { data: commits } = await supabase
    .from('commits')
    .select('*')
    .eq('user_id', userId)
    .eq('commit_date', todayDate);

  // 데이터 없으면 기본값 리턴
  if (!commits || commits.length === 0) {
    return {
      date: todayDate,
      commit_count: 0,
      total_changes: 0,
      languages: [],
      is_success: false,
    };
  }

  // 데이터 있으면 계산 대시보드용 계산
  const totalChanges = commits.reduce(
    (acc: number, curr: any) => acc + curr.total_changes,
    0,
  );
  const languages = Array.from(
    new Set(commits.flatMap((c: any) => c.languages as string[])),
  ) as string[];

  return {
    date: todayDate,
    commit_count: commits.length,
    total_changes: totalChanges,
    languages: languages,
    is_success: true,
  };
}

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

  const initialCommitData = user
    ? await getTodayCommitData(supabase, user.id)
    : null;

  const finalData: TodayCommitSummary = initialCommitData || {
    date: getGitPoorDate(new Date().toISOString()),
    commit_count: 0,
    total_changes: 0,
    languages: [],
    is_success: false,
  };
  // 탭 로직
  const params = await searchParams;
  const view = params.view;
  const isGroupView = view === 'group';

  const GroupSection = () => (
    <main className="max-w-4xl mx-auto">
      <GroupListSection />
    </main>
  );

  return (
    <div className="min-h-screen bg-background text-white p-8">
      <Headers user={user} />

      {/* 모바일 */}
      <div className="block md:hidden">
        {isGroupView ? (
          <GroupSection />
        ) : (
          <MyProfileSection user={user} initialCommit={finalData} />
        )}
      </div>

      {/* 데스크탑 */}
      <div className="hidden md:grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <MyProfileSection user={user} initialCommit={finalData} />
        </div>

        <div className="col-span-12 lg:col-span-7 space-y-6">
          <h2 className="text-2xl font-bold mb-2">그룹 현황</h2>
          <GroupSection />
        </div>
      </div>
    </div>
  );
}
