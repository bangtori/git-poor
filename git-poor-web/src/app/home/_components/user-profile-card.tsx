import DefaultCard from '@/components/ui/default-card';
import type { User } from '@supabase/supabase-js';
import Image from 'next/image';

interface UserProfileCardProps {
  user: User | null; // 로그아웃 상태일 수도 있으니 null 허용
}

export const UserProfileCard = ({ user }: UserProfileCardProps) => {
  if (!user) return null; // 유저 정보가 없으면 아무것도 안 그림

  const { user_metadata, email } = user;
  const avatarUrl = user_metadata?.avatar_url;
  const userName =
    user_metadata?.full_name || user_metadata?.user_name || '사용자';

  return (
    <DefaultCard title="사용자 프로필">
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Profile"
              fill
              className="object-cover"
              sizes="80px"
              priority
            />
          ) : (
            // 이미지가 없을 때 보여줄 기본 UI
            <div className="w-full h-full bg-gray-600 flex items-center justify-center text-gray-300">
              ?
            </div>
          )}
        </div>

        <div>
          <p className="font-bold text-lg text-white">{userName}</p>
          <p className="text-gray-400 text-sm">{email}</p>
        </div>
      </div>
    </DefaultCard>
  );
};
