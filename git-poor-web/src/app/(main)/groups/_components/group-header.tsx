'use client';
import { useState } from 'react';
import DefaultCard from '@/components/ui/default-card';
import { UserRoundPlus } from 'lucide-react';
import NewMemberModal from './new-member-modal';
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

  return (
    <>
      <DefaultCard title="">
        <div className="w-full items-center text-text-primary flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-primary">{title} </h1>
          <div className="text-sm text-center">
            <p className="text-text-secondary">커밋 안하면?</p>
            <p className="text-danger font-semibold">{penalty}</p>
          </div>
          {isOwner && (
            <button
              onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 mt-2 hover:text-primary hover:scale-105"
          >
            <UserRoundPlus />
            <span className="font-bold">멤버 초대</span>
          </button>
        )}
      </div>

      </DefaultCard>
      <NewMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => console.log('멤버 초대 성공')}
        groupId={groupId}
      />
    </>
  );
}
