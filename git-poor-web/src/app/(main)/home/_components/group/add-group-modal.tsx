'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/modal';
import FilledButton from '@/components/ui/filled-button';
import { Check, Square } from 'lucide-react';
import { ModalActionProps } from '@/types/modal';
import { cn } from '@/lib/utils/tailwind-utils';

const RECOMMENDED_PENALTIES = [
  '벌금 1,000원',
  '커피 1잔 보내기',
  '운동 1시간 인증하기',
];

export default function AddGroupModal({
  onClose,
  isOpen,
  onSuccess: onCreated,
}: ModalActionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // 폼 상태 관리
  const [formData, setFormData] = useState({
    name: '',
    penalty_title: '',
    day_start_hour: 5, // 기본값: 오전 5시
    apply_penalty_weekend: false,
  });
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
            ? Number(value)
            : value,
    }));
  };

  // 추천 벌칙 핸들러
  const handleSelectPenalty = (penalty: string) => {
    setFormData((prev) => ({
      ...prev,
      penalty_title: penalty,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.penalty_title) {
      alert('그룹 이름과 벌칙 이름은 필수입니다.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('그룹 생성에 실패했습니다.');

      setFormData({
        name: '',
        penalty_title: '',
        day_start_hour: 5,
        apply_penalty_weekend: false,
      });

      onCreated?.();
      onClose();
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('그룹을 생성하는데 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Group"
      className="max-w-md" // 모달 너비 조절
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 text-text-primary"
      >
        {/* 그룹 이름 */}
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-lg font-bold text-text-primary">
            그룹 이름 <span className="text-primary">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="예: 미라클 모닝 챌린지"
            value={formData.name}
            onChange={handleChange}
            className="p-2 rounded bg-background-input border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        {/* 벌칙 이름 */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="penalty_title"
            className="text-lg font-bold text-text-primary"
          >
            벌칙 내용 <span className="text-primary">*</span>
          </label>
          <input
            id="penalty_title"
            name="penalty_title"
            type="text"
            placeholder="예: 지각비 1,000원"
            value={formData.penalty_title}
            onChange={handleChange}
            className="p-2 rounded bg-background-input border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <div className="mt-1 space-y-2">
            <p className="text-sm font-bold text-text-secondary">추천 벌칙</p>
            <div className="flex flex-col gap-2">
              {RECOMMENDED_PENALTIES.map((penalty) => {
                const isSelected = formData.penalty_title === penalty;

                return (
                  <button
                    key={penalty}
                    type="button" // submit 방지
                    onClick={() => handleSelectPenalty(penalty)}
                    className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors group text-left"
                  >
                    {/* 체크박스 UI (선택 시 색상 변경) */}
                    <div
                      className={cn(
                        'w-5 h-5 flex items-center justify-center rounded border transition-all',
                        isSelected
                          ? 'bg-primary border-primary text-white'
                          : 'border-border bg-background-input group-hover:border-text-secondary',
                      )}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>

                    <span>{penalty}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 하루 시작 시간 (Select) */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="day_start_hour"
            className="text-lg font-bold text-text-primary"
          >
            하루 시작 시간 (0시 ~ 23시)
          </label>
          <div className="text-text-secondary text-sm">
            <p>하루 시작 시간을 설정합니다.</p>
            <p>기본 값은 5:00 AM 입니다.</p>
            <p>(5:00 AM부터 다음날 4:59 AM까지 하루 커밋으로 인정됩니다.)</p>
          </div>
          <select
            id="day_start_hour"
            name="day_start_hour"
            value={formData.day_start_hour}
            onChange={handleChange}
            className="p-2 rounded bg-background-input border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <option key={i} value={i}>
                {i < 10 ? `0${i}:00` : `${i}:00`}
              </option>
            ))}
          </select>
        </div>

        {/* 주말 벌칙 적용 여부 (Checkbox) */}
        <div className="flex items-center gap-2 mt-2">
          <input
            id="apply_penalty_weekend"
            name="apply_penalty_weekend"
            type="checkbox"
            checked={formData.apply_penalty_weekend}
            onChange={handleChange}
            className="w-4 h-4 accent-primary"
          />
          <label
            htmlFor="apply_penalty_weekend"
            className="text-sm text-text-primary cursor-pointer"
          >
            주말에도 벌칙 적용하기
          </label>
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            disabled={isLoading}
          >
            취소
          </button>
          <FilledButton type="submit" disabled={isLoading}>
            {isLoading ? '생성 중...' : '만들기'}
          </FilledButton>
        </div>
      </form>
    </Modal>
  );
}
