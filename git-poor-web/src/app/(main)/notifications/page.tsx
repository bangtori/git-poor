import { getCachedUser } from '@/lib/utils/auth-utils';
import { getInvitationByUserId } from '@/services/invitation-service';
import InvitationList from './_components/invitation-list';
import { redirect } from 'next/navigation';

export default async function NotificationPage() {
  const user = await getCachedUser();

  if (!user) {
    redirect('/login');
  }

  const { data: invitations, meta } = await getInvitationByUserId(user.id);

  return (
    <div className="w-full p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-text-primary mb-4">
        Notifications
      </h1>

      <InvitationList initialInvitations={invitations} initialMeta={meta} />
    </div>
  );
}
