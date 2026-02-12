import { GroupMemberWithCommit } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Skull, CalendarCheck2, CalendarX2 } from 'lucide-react';
import FilledButton from '@/components/ui/filled-button';
import { cn } from '@/lib/utils/tailwind-utils';

interface GroupMemberListProps {
  members: GroupMemberWithCommit[];
}

export default function GroupMemberList({ members }: GroupMemberListProps) {
  return (
    <div className="w-full text-text-primary flex flex-col gap-6 mt-8">
      <h1 className="text-2xl font-bold ">Group Members</h1>

      {/* 그리드 설정: 
         - 기본(mobile): 2열 (grid-cols-2)
         - md(tablet): 3열
         - lg(desktop): 4열 이상 자유롭게 확장
         - justify-items-center & max-w-screen-xl mx-auto: 전체 중앙 정렬
      */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-4 justify-items-center max-w-screen-2xl mx-auto w-full">
        {members.map((member) => (
          <div
            key={member.user_id}
            className={cn(
              'w-full max-w-[280px] gap-4 aspect-square flex flex-col items-center justify-between p-6 rounded-3xl bg-background-card border-2 transition-transform hover:scale-105',
              member.commit_count === 0 ? 'border-danger' : 'border-primary',
            )}
          >
            {/* 유저 정보 */}
            <div className="flex flex-col items-center text-center gap-1 mt-2">
              {/* 프로필 이미지 (원형) */}
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-gray-700">
                <Image
                  src={member.profile_image || '/default-profile.png'}
                  alt={member.github_id}
                  fill
                  className="object-cover"
                />
              </div>
              <h2 className="text-base md:text-2xl font-bold">
                {member.github_id}
              </h2>
              <p className="text-xs hidden md:block md:text-sm text-gray-400">
                ({member.nickname})
              </p>
            </div>

            {/* 벌금 횟수 (해골 아이콘) */}
            <div className="w-auto flex gap-4 items-baseline">
              <div className="flex items-center text-danger gap-1">
                <Skull className="text-sm md:text-xl" />
                <span className="text-sm md:text-xl font-bold">
                  {member.current_penalty_count}
                </span>
              </div>
              <div className="flex items-center text-primary gap-1">
                {member.commit_count === 0 ? (
                  <CalendarX2 className="text-lg text-text-secondary" />
                ) : (
                  <CalendarCheck2 className="text-sm md:text-xl" />
                )}
                <span
                  className={cn(
                    'text-sm md:text-xl font-bold',
                    member.commit_count === 0
                      ? 'text-text-secondary'
                      : 'text-primary',
                  )}
                >
                  {member.commit_count}
                </span>
              </div>
            </div>

            {/* TODO: - 상세 내역 링크 추가 */}
            <Link href={``} className="w-full">
              <FilledButton className="w-full py-2 text-sm md:text-base hover:bg-primary-hover">
                커밋 내역
              </FilledButton>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
