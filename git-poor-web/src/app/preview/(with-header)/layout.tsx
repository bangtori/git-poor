import Link from 'next/link';
import { Suspense } from 'react';
import { MobileBottomNav } from '@/components/common/moblie-bottom-nav';
import { Bell, LogIn } from 'lucide-react';

export default function PreviewWithHeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <div className="bg-background text-white p-4 md:p-8 pb-0">
        <header className="flex justify-between items-center p-6">
          <Link
            href="/preview/home"
            className="hover:opacity-80 transition-opacity"
          >
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                GitPoor
              </h1>
              <p className="text-gray-400 mt-1 hidden md:block">
                Preview Mode (Read-only)
              </p>
            </div>
          </Link>
          <div className="flex justify-end items-center gap-2">
            <Link
              href="/preview/notifications"
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-transform hover:scale-110"
            >
              <Bell className="text-x" />
            </Link>
            <Link
              href="/"
              className="px-2 md:px-4 py-2 text-text-secondary hover:text-text-primary transition-transform hover:scale-110 flex items-center gap-2"
            >
              <LogIn className="text-x block md:hidden" />
              <span className="hidden md:inline whitespace-nowrap">
                로그인하고 사용하기
              </span>
            </Link>
          </div>
        </header>
      </div>

      <main className="flex-1 w-full">
        <div className="pb-20 md:pb-0 h-full">{children}</div>
      </main>

      <Suspense fallback={<div className="h-16 bg-gray-900" />}>
        <MobileBottomNav basePath="/preview" />
      </Suspense>
    </div>
  );
}
