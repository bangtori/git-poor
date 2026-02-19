'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/tailwind-utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string; // 모달 내부 컨텐츠 스타일 커스텀용
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // 모달이 열려있을 때 뒷배경 스크롤 막기 (Body Scroll Lock)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // ESC 키 누르면 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // 마운트 전이거나 닫혀있으면 렌더링 X
  if (!mounted || !isOpen) return null;

  // Portal을 사용해 document.body에 렌더링
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6 transition-all"
      onClick={onClose} // 배경 클릭 시 닫기
    >
      {/* [Modal Content] */}
      <div
        className={cn(
          'bg-background-card border border-border rounded-xl shadow-2xl w-full relative flex flex-col',
          // 크기 제한: 최대 너비 설정, 최대 높이는 화면의 85%
          'max-w-lg max-h-[85vh]',
          // 애니메이션
          'animate-in fade-in zoom-in-95 duration-200',
          className,
        )}
        onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫기 이벤트 전파 방지
      >
        {/* [Header] 제목과 닫기 버튼 */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h2 className="text-lg font-bold text-text-primary">
            {title || '알림'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-full hover:bg-background-input"
          >
            <X size={20} />
          </button>
        </div>

        {/* [Body] 스크롤 영역 (overflow-y-auto) */}
        <div className="p-4 overflow-y-auto text-text-primary">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
