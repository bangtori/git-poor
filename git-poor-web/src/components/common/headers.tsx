'use client';
import type { AuthProps } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, LogOut } from 'lucide-react';

export function Headers({ user }: AuthProps) {
  const supabase = createClient();
  const router = useRouter();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/'); // 로그아웃 후 로그인 페이지로 이동
    router.refresh(); // 라우터 캐시 비우기
  };

  return (
    <header className="flex justify-between items-center">
      <Link
        href="/home"
        className="cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
            GitPoor
          </h1>
          <p className="text-gray-400 mt-1 hidden md:block">
            <span className="text-primary font-semibold">
              {user.user_metadata.user_name}
            </span>
            님의 벌금 장부 💸
          </p>
        </div>
      </Link>
      <div className="flex justify-end items-center gap-2">
        <Link
          href="/home"
          className="px-4 py-2 text-text-secondary hover:text-text-primary transition-transform hover:scale-110"
        >
          <Bell className="text-x" />
        </Link>
        <button
          onClick={handleLogout}
          className="px-2 py-2 text-text-secondary hover:text-danger transition-transform hover:scale-110"
        >
          <LogOut className="text-xl" />
        </button>
      </div>
    </header>
  );
}
