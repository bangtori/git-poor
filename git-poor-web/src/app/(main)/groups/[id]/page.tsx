import { notFound } from 'next/navigation';
import { getCachedUser } from '@/lib/utils/auth-utils';
import { getGroupDetail, getGroupRole } from '@/services/group-service';
import GroupHeader from '../_components/group-header';
import GroupMemberList from '../_components/group-member-list';
import { GroupMemberWithCommit, GroupRole } from '@/types';

interface GroupDetailPageProps {
  params: { id: string };
}
export default async function GroupDetailPage({
  params,
}: GroupDetailPageProps) {
  const { id } = await params;
  const user = await getCachedUser();

  if (!user) return notFound();

  const [groupDetail, userRole] = await Promise.all([
    getGroupDetail(id),
    getGroupRole(id, user.id),
  ]);

  if (!groupDetail || !userRole) {
    return notFound();
  }

  const { group_info, members } = groupDetail;
  const isOwner = userRole === GroupRole.OWNER;

  const mockMembers: GroupMemberWithCommit[] = Array.from({ length: 12 }).map(
    (_, i) => ({
      user_id: `mock-${i}`,
      github_id: `mockuser${i}`,
      email: `test${i}@example.com`,
      nickname: `테스트유저 ${i + 1}`,
      profile_image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`, // 랜덤 아바타 서비스
      role: 'member',
      total_penalty_count: Math.floor(Math.random() * 5),
      current_penalty_count: Math.floor(Math.random() * 3),
      joined_at: new Date().toISOString(),
      commit_count: i % 3 === 0 ? 0 : 5, // 3명 중 1명꼴로 커밋 0명 처리 (빨간 보더 확인용)
    }),
  );

  const displayMembers = [
    ...members.map((member) => ({
      ...member,
      commit_count: 2,
    })),
    ...mockMembers,
  ];
  return (
    <main className="flex flex-col gap-3 w-full px-6 py-5">
      <GroupHeader
        title={group_info.name}
        penalty={group_info.penalty_title}
        isOwner={isOwner}
      />
      <GroupMemberList members={displayMembers} />
    </main>
  );
}
