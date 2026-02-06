'use client';
import type { AuthProps } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

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

      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition border border-gray-700"
      >
        로그아웃
      </button>
    </header>
  );
}
