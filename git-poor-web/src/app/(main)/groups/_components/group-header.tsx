'use client';
import { useState } from 'react';
import DefaultCard from '@/components/ui/default-card';
import { UserRoundPlus } from 'lucide-react';
import NewMemberModal from './new-member-modal';
import { useRouter } from 'next/navigation';
import { handleActionError } from '@/lib/error/handle-action-error';
import type { ApiResponse } from '@/lib/http/response';
interface GroupHeaderProps {
  title: string;
  penalty: string;
  isOwner: boolean;
  groupId: string;
}
export default function GroupHeader({
  title,
  penalty,
  isOwner,
  groupId,
}: GroupHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActing, setIsActing] = useState(false);
  const router = useRouter();

  const action = async () => {
    if (isActing) return;

    // Delete 확인 모달
    const confirmMessage = isOwner
      ? '정말 그룹을 삭제할까요? (삭제하면 복구할 수 없습니다)'
      : '정말 그룹을 나갈까요?';

    const okConfirm = window.confirm(confirmMessage);
    if (!okConfirm) return;

    setIsActing(true);

    try {
      const url = isOwner
        ? `/api/groups/${groupId}`
        : `/api/groups/${groupId}/leave`;

      const res = await fetch(url, { method: 'DELETE' });
      const result: ApiResponse<boolean> = await res.json();

      if (!result.success) {
        handleActionError(result.error);
        return;
      }

      // 성공 후 이동/갱신
      if (isOwner) {
        // 그룹 삭제 후: 그룹 목록으로
        router.push('/home?view=group');
      } else {
        // 그룹 나가기 후: 그룹 목록으로
        router.push('/home?view=group');
      }

      router.refresh();
    } catch (e) {
      // 네트워크/예상 못한 에러
      handleActionError({
        code: 'NETWORK_ERROR',
        message: '네트워크 오류가 발생했습니다.',
      });
    } finally {
      setIsActing(false);
    }
  };

  return (
    <>
      <DefaultCard title="">
        <div className="w-full items-center text-text-primary flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-primary">{title}</h1>
          <div className="text-sm text-center">
            <p className="text-text-secondary">커밋 안하면?</p>
            <p className="text-danger font-semibold">{penalty}</p>
          </div>
        </div>
      </DefaultCard>

      {/* 액션 row */}
      <div className="w-full flex items-center justify-center gap-8 mt-3">
        {/* 멤버 초대: owner만 */}
        {isOwner && (
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isActing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background-card text-text-primary
                       hover:text-primary hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserRoundPlus />
            <span className="font-bold">멤버 초대</span>
          </button>
        )}

        {/* 위험 액션: owner는 삭제, 그 외는 나가기 */}
        <button
          type="button"
          onClick={action}
          disabled={isActing}
          className="px-4 py-2 rounded-xl border border-border bg-background-card text-text-secondary
                     hover:text-danger hover:border-danger hover:scale-[1.02] transition
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="font-bold">
            {isOwner ? '그룹 삭제' : '그룹 나가기'}
          </span>
        </button>
      </div>

      <NewMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {}}
        groupId={groupId}
      />
    </>
  );
}
