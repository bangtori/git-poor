'use client';
import FilledButton from '@/components/ui/filled-button';
import { Users, SquarePlus } from 'lucide-react';
import { useState } from 'react';
import AddGroupModal from './add-group-modal';
import { cn } from '@/lib/utils/tailwind-utils';
import { useRouter } from 'next/navigation';

const dummyData = Array.from({ length: 4 }).map((_, i) => ({
  id: i,
  title: 'Room Title',
  members: 3,
  penalty: 'N회',
}));

export default function GroupListSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  return (
    <div className="w-full min-h-screen text-white">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-4">Group</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex gap-2 items-center text-primary hover:text-primary-hover"
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
        {dummyData.map((item) => (
          <li
            key={item.id}
            className={cn(
              'bg-background-card rounded-xl p-4',
              'flex flex-col items-center justify-center gap-3',
              'md:flex-row md:justify-between md:px-6 md:py-4',
            )}
          >
            <div className="flex flex-col items-center gap-2 md:flex-row md:gap-6">
              <span className="text-primary font-bold text-lg">
                {item.title}
              </span>

              <div className="flex flex-col items-center text-gray-400 text-sm gap-1 md:flex-row md:gap-4">
                <div className="flex items-center gap-1">
                  <Users size={18} />
                  <span>{item.members}명</span>
                </div>
                <span>내 벌금 : {item.penalty}</span>
              </div>
            </div>

            <FilledButton className="w-full py-2 hover:bg-primary-hover md:w-auto">
              바로가기
            </FilledButton>
          </li>
        ))}
      </ul>
    </div>
  );
}
