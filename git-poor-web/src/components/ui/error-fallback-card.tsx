'use client';

import DefaultCard from '@/components/ui/default-card';

interface ErrorFallbackCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

/**
 * 섹션 데이터 로딩 실패 시 표시하는 에러 카드
 * - DefaultCard를 감싸서 일관된 카드 스타일 유지
 * - 다시 시도 버튼으로 해당 섹션만 재요청 가능
 */
const ErrorFallbackCard = ({
  title = '',
  message = '데이터를 불러올 수 없습니다',
  onRetry,
}: ErrorFallbackCardProps) => {
  return (
    <DefaultCard title={title}>
      <div className="flex flex-col items-center justify-center gap-3 min-h-[200px] text-center">
        <p className="text-text-secondary text-sm">{message}</p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            다시 시도
          </button>
        )}
      </div>
    </DefaultCard>
  );
};

export default ErrorFallbackCard;
