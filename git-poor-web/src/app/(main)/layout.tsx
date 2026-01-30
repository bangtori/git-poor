import { Suspense } from 'react'; // 1. Suspense 임포트
import { MobileBottomNav } from '@/components/common/moblie-bottom-nav';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
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
