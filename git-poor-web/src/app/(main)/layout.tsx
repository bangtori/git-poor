import { Suspense } from 'react'; // 1. Suspense 임포트
import { MobileBottomNav } from '@/components/common/moblie-bottom-nav';
import { getCachedUser } from '@/lib/utils/auth-utils';
import { Headers } from '@/components/common/headers';
import { redirect } from 'next/navigation';
export default async function MainLayout({
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
      <div className="bg-background text-white p-8 pb-0">
        <Headers user={user} />
      </div>
      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 w-full">
        <div className="pb-20 md:pb-0 h-full">{children}</div>
      </main>

      {/* 모바일 하단 탭바 */}
      {/* 2. useSearchParams를 사용하는 컴포넌트를 Suspense로 감쌉니다. */}
      <Suspense fallback={<div className="h-16 bg-gray-900" />}>
        <MobileBottomNav />
      </Suspense>
    </div>
  );
}
