import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '@/lib/utils/tailwind-utils'; // cn 함수가 있다면 사용 권장

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const FilledButton = ({
  children,
  disabled = false,
  onClick,
  className = '',
  ...props
}: PropsWithChildren<ButtonProps>) => {
  const backgroundClass = disabled
    ? 'bg-primary-dim cursor-not-allowed'
    : 'bg-primary hover:bg-primary-hover cursor-pointer active:scale-[0.98]';

  return (
    <button
      {...props}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'px-4 py-3 font-bold text-text-primary transition-all duration-200 rounded-xl',
        backgroundClass,
        className,
      )}
    >
      {children}
    </button>
  );
};

export default FilledButton;
