'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ErrorCode } from '@/types/error';

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  // AppError가 던져진 경우 code가 붙어 있을 수 있음
  const code = (error as any)?.code as ErrorCode | undefined;

  useEffect(() => {
    // 개발/운영 로깅 포인트
    console.error('[Route Error]', error);
  }, [error]);

  const handleGoBack = () => {
    // UNAUTHENTICATED면 로그인 페이지로
    if (code === 'UNAUTHENTICATED') {
      router.push('/');
      return;
    }
    // 그 외는 홈으로
    router.push('/home');
  };

  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-2xl font-bold text-text-primary">
        문제가 발생했습니다
      </h2>
      <p className="text-text-secondary">잠시 후 다시 시도해주세요.</p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90"
        >
          다시 시도
        </button>

        <button
          type="button"
          onClick={handleGoBack}
          className="px-4 py-2 rounded-lg bg-background-card text-text-primary hover:opacity-90"
        >
          {code === 'UNAUTHENTICATED' ? '로그인으로' : '홈으로'}
        </button>
      </div>

      {/* 개발 환경에서만 상세 표시*/}
      {process.env.NODE_ENV === 'development' && (
        <pre className="mt-4 w-full max-w-xl overflow-auto rounded-lg bg-background-card p-4 text-left text-xs text-text-secondary">
          {String(error?.message ?? error)}
        </pre>
      )}
    </div>
  );
}
