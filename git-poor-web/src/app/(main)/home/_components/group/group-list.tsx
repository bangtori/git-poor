'use client';
import FilledButton from '@/components/ui/filled-button';
import { Users, SquarePlus } from 'lucide-react';
import { useState } from 'react';
import AddGroupModal from './add-group-modal';
import { cn } from '@/lib/utils/tailwind-utils';
import { useRouter } from 'next/navigation';
import { GroupSummary } from '@/types';
import Link from 'next/link';

interface GroupListSectionProps {
  initialGroups: GroupSummary[];
}

export default function GroupListSection({
  initialGroups,
}: GroupListSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const groups = initialGroups || [];
  return (
    <div className="w-full min-h-screen text-white">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-4">Group</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex gap-2 items-center text-primary hover:text-primary-hover  transition-transform hover:scale-105"
        >
          <SquarePlus size={20} />
          <span className="font-bold">Add</span>
        </button>
      </div>
      <AddGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => {
          console.log('생성 완료! 서버 데이터 다시 불러오는 중...');
          router.refresh();
        }}
      />
      {/* [컨테이너 레이아웃]
        - 기본(모바일): grid grid-cols-2 (2열 카드)
        - md(데스크탑): flex flex-col (1열 리스트) 
      */}
      <ul className="w-full grid grid-cols-2 gap-3 md:flex md:flex-col md:gap-4">
        {groups.map((group) => (
          <li
            key={group.id}
            className={cn(
              'bg-background-card rounded-xl p-4',
              'flex flex-col items-center justify-center gap-3',
              'md:flex-row md:justify-between md:px-6 md:py-4',
            )}
          >
            <div className="flex flex-col items-center gap-2 md:flex-row md:gap-6">
              <span className="text-primary font-bold text-lg">
                {group.name}
              </span>

              <div className="flex flex-col items-center text-gray-400 text-sm gap-1 md:flex-row md:gap-4">
                <div className="flex items-center gap-1">
                  <Users size={18} />
                  <span>{group.member_count}명</span>
                </div>
                <span>내 벌금 : {group.my_penalty_count}회</span>
              </div>
            </div>

            <Link href={`groups/${group.id}`} className="w-full md:w-auto">
              <FilledButton className="w-full py-2 hover:bg-primary-hover">
                바로가기
              </FilledButton>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
