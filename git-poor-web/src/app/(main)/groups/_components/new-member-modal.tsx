'use client';

import { useState } from 'react';
import FilledButton from "@/components/ui/filled-button";
import Modal from "@/components/ui/modal";
import { ModalActionProps } from '@/types/modal';
import { ApiResponse } from '@/lib/http/reponse';
import { Invitation } from '@/types';

interface NewMemberModalProps extends ModalActionProps {
  groupId: string;
}

export default function NewMemberModal({
  isOpen,
  onClose,
  onSuccess,
  groupId,
}: NewMemberModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchedEmail, setSearchedEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(true);

  // 이메일 유효성 검사 함수
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setSearchedEmail(email);

    if (email === '') {
      setIsValidEmail(true); // 비어있으면 워닝 숨김
    } else {
      setIsValidEmail(validateEmail(email));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail || !searchedEmail) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: searchedEmail, group_id: groupId }),
      });

      const result: ApiResponse<Invitation> = await response.json();

      if (!result.success) {
        throw new Error(result.error.message);
      }

      alert('초대가 완료되었습니다.');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error(error);
      alert(error.message || '초대 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Member"
      className="max-w-md" // 모달 너비 조절
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 text-text-primary"
      >
        {/* 이메일 입력 창 */}
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-lg font-bold text-text-primary">
            Github Email
          </label>
          <p className="text-text-secondary text-sm">초대하고자 하는 유저의 깃허브 이메일을 입력해주세요.</p>
          <input
            id="email"
            name="email"
            type="text"
            placeholder="이메일을 입력하세요"
            value={searchedEmail}
            onChange={handleEmailChange}
            className={`p-2 rounded bg-background-input border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary ${
              !isValidEmail && searchedEmail !== ''
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-border'
            }`}
            required
          />
          {!isValidEmail && searchedEmail !== '' && (
            <p className="text-sm text-danger">이메일 형식을 작성해주세요</p>
          )}
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
          <FilledButton type="submit" disabled={isLoading || !isValidEmail || !searchedEmail}>
            {isLoading ? '처리 중...' : '초대하기'}
          </FilledButton>
        </div>
      </form>
    </Modal>
  );
}