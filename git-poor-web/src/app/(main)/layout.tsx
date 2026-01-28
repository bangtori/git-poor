import { MobileBottomNav } from '@/components/common/moblie-bottom-nav'; // 경로 확인해주세요!

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
      <MobileBottomNav />
    </div>
  );
}
