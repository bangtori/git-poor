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

  return (
    <main className="flex flex-col gap-3 w-full px-6 py-5">
      <GroupHeader
        title={group_info.name}
        penalty={group_info.penalty_title}
        isOwner={isOwner}
        groupId={id}
      />
      <GroupMemberList members={members} />
    </main>
  );
}
