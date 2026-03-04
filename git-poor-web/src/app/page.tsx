'use client';
import { createClient } from '@/lib/supabase/client';
import GithubLoginButton from './auth/_components/GithubLoginButton';
import Link from 'next/link';

export default function LoginPage() {
  const supabase = createClient();

  const handleGitHubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          GitPoor
        </h1>
        <p className="text-gray-400">코딩 안 하면 벌금 낸다.</p>
        <GithubLoginButton handleGitHubLogin={handleGitHubLogin} />
        <Link
          href="/preview/home"
          className="text-text-secondary underline text-sm hover:text-text-primary transition-colors"
        >
          로그인 없이 둘러보기
        </Link>
      </div>
    </div>
  );
}
