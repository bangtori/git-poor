'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { Home, Users, History } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view'); // 'group'인지 확인용

  const tabs = [
    {
      label: 'home',
      href: '/home', // 기본 홈 (내 정보)
      icon: Home,
      isActive: pathname === '/home' && !currentView, // view 파라미터가 없을 때 활성
    },
    {
      label: 'group',
      href: '/home?view=group', // home 내 view 파라미터 활용
      icon: Users,
      isActive: pathname === '/home' && currentView === 'group',
    },
    {
      label: 'history',
      href: '/history', // 아예 다른 라우터
      icon: History,
      isActive: pathname === '/history',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-gray-900 border-t border-border rounded-t-2xl md:hidden z-50">
      <div className="flex justify-around items-center h-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              // replace를 쓰면 뒤로가기 히스토리가 쌓이지 않아 앱처럼 느껴짐
              replace={tab.href.includes('?view=')}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1',
                tab.isActive ? 'text-primary' : 'text-text-tertiary',
              )}
            >
              <Icon size={24} />
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
