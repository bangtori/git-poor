import { getCachedUser } from '@/lib/utils/auth-utils';
import { getInvitationByUserId } from '@/services/invitation-service';
import InvitationItem from './_components/invitation-item';
import { InvitationWithGroup, InviteState } from '@/types';
import { redirect } from 'next/navigation';

export default async function NotificationPage() {
  const user = await getCachedUser();

  if (!user) {
    redirect('/login');
  }

  const { success, data } = await getInvitationByUserId(user.id);
  const invitations: InvitationWithGroup[] = (success && data) ? data : [];

  return (
    <div className="w-full p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-text-primary mb-4">Notifications</h1>

      {invitations.length === 0 ? (
        <div className="text-center py-10 text-text-secondary">
          <p>받은 초대가 없습니다.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {invitations
            .filter((invitation) => invitation.state === InviteState.PENDING)
            .map((invitation) => (
              <InvitationItem key={invitation.id} invitation={invitation} />
            ))}
        </ul>
      )}
    </div>
  );
}
