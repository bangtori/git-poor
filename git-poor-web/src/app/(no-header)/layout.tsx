import { getCachedUser } from '@/lib/utils/auth-utils';
import { redirect } from 'next/navigation';

export default async function NoHeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCachedUser();
  if (!user) {
    redirect('/');
  }
  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <main className="flex-1 w-full">
        <div className="h-full">{children}</div>
      </main>
    </div>
  );
}
