import { createClient } from '@/lib/supabase/server';
import { UserProfileCard } from '@/app/home/_components/user-profile-card';
import { redirect } from 'next/navigation';
import { Headers } from '@/components/common/headers';
import TodayCommitCard from './_components/today-commit-card';
export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background text-white p-8">
      <Headers user={user} />
      <main className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
        <UserProfileCard user={user} />
        <TodayCommitCard />
      </main>
    </div>
  );
}
