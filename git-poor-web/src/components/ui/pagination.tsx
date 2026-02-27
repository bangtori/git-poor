type PaginationProps = {
  currentPage: number; // 1-based
  totalPages: number; // >= 1
  onChange: (page: number) => void;
  maxVisible?: number; // default 5 (mobile)
  className?: string;
  disabled?: boolean; // 전체 비활성화(로딩 중 등)
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getVisiblePages(
  currentPage: number,
  totalPages: number,
  maxVisible: number,
) {
  if (totalPages <= 0) return [];
  const visible = Math.max(1, maxVisible);

  const safeCurrent = clamp(currentPage, 1, totalPages);

  // 전체 페이지가 작으면 전부 표시
  if (totalPages <= visible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // ✅ 흔들림 방지용 "고정 구간" 확장
  // visible=5일 때:
  // - 앞쪽은 1~4까지는 1..5 고정
  // - 뒤쪽은 마지막 4페이지 근처부터는 (total-4)..total 고정
  const leftFixedEnd = visible - 1; // 4
  const rightFixedStart = totalPages - (visible - 2); // totalPages - 3

  let start: number;
  let end: number;

  // 앞쪽 고정: current <= 4  → 1..5
  if (safeCurrent <= leftFixedEnd) {
    start = 1;
    end = visible;
  }
  // 뒤쪽 고정: current >= total-3 → (total-4)..total
  else if (safeCurrent >= rightFixedStart) {
    end = totalPages;
    start = totalPages - visible + 1;
  }
  // 중간: current가 가운데 오도록
  else {
    const half = Math.floor(visible / 2); // 2
    start = safeCurrent - half;
    end = safeCurrent + half;
  }

  return Array.from({ length: visible }, (_, i) => start + i);
}

export default function Pagination({
  currentPage,
  totalPages,
  onChange,
  maxVisible = 5,
  className,
  disabled = false,
}: PaginationProps) {
  // totalPages가 1 이하이면 페이지네이션 숨김
  if (!totalPages || totalPages <= 1) return null;

  const safeCurrent = clamp(currentPage, 1, totalPages);
  const pages = getVisiblePages(safeCurrent, totalPages, maxVisible);

  const canPrev = safeCurrent > 1 && !disabled;
  const canNext = safeCurrent < totalPages && !disabled;

  const goTo = (page: number) => {
    if (disabled) return;
    const next = clamp(page, 1, totalPages);
    if (next === safeCurrent) return;
    onChange(next);
  };

  return (
    <nav
      aria-label="Pagination"
      className={[
        'w-full flex items-center justify-center gap-2 select-none',
        className ?? '',
      ].join(' ')}
    >
      {/* Prev */}
      <button
        type="button"
        aria-label="Previous page"
        disabled={!canPrev}
        onClick={() => goTo(safeCurrent - 1)}
        className={[
          'h-10 w-10 rounded-full flex items-center justify-center',
          'transition',
          canPrev
            ? 'text-text-primary hover:bg-background-card'
            : 'text-text-tertiary opacity-50 cursor-not-allowed',
        ].join(' ')}
      >
        {/* left chevron */}
        <span className="text-2xl leading-none">‹</span>
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-2">
        {pages.map((p, idx) => {
          const isActive = p === safeCurrent;
          return (
            <button
              key={idx}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => goTo(p)}
              disabled={disabled}
              className={[
                'h-10 w-10 rounded-full flex items-center justify-center text-base font-semibold',
                'transition',
                isActive
                  ? 'bg-primary text-white'
                  : 'bg-transparent text-text-primary hover:bg-background-card',
                disabled ? 'opacity-60 cursor-not-allowed' : '',
              ].join(' ')}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* Next */}
      <button
        type="button"
        aria-label="Next page"
        disabled={!canNext}
        onClick={() => goTo(safeCurrent + 1)}
        className={[
          'h-10 w-10 rounded-full flex items-center justify-center',
          'transition',
          canNext
            ? 'text-text-primary hover:bg-background-card'
            : 'text-text-tertiary opacity-50 cursor-not-allowed',
        ].join(' ')}
      >
        {/* right chevron */}
        <span className="text-2xl leading-none">›</span>
      </button>
    </nav>
  );
}
