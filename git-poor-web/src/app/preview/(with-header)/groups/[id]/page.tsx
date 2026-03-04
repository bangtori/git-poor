import GroupHeader from '@/app/(main)/groups/_components/group-header';
import GroupMemberList from '@/app/(main)/groups/_components/group-member-list';
import { getMockGroupDetail } from '@/lib/preview/mock-groups';

interface PreviewGroupDetailPageProps {
  params: { id: string };
}

export default async function PreviewGroupDetailPage({
  params,
}: PreviewGroupDetailPageProps) {
  const { id } = await params;
  const { group_info, members, isOwner } = getMockGroupDetail(id);

  return (
    <main className="flex flex-col gap-3 w-full px-6 py-5">
      <GroupHeader
        title={group_info.name}
        penalty={group_info.penalty_title}
        isOwner={isOwner}
        groupId={id}
      />
      <GroupMemberList members={members} groupId={id} />
    </main>
  );
}
