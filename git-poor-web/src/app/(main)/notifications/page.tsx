import { getCachedUser } from '@/lib/utils/auth-utils';
import { getInvitationByUserId } from '@/services/invitation-service';
import DefaultCard from '@/components/ui/default-card';
import { InvitationWithGroup, InviteState } from '@/types';
import { redirect } from 'next/navigation';

export default async function NotificationPage() {
  const user = await getCachedUser();

  if (!user) {
    redirect('/login');
  }

  // const { success, data } = await getInvitationByUserId(user.id);
  // const invitations: InvitationWithGroup[] = (success && data) ? data : [];

  const invitations: InvitationWithGroup[] = [
    {
      id: '1',
      group_id: 'group-1',
      invitee_id: user.id,
      state: InviteState.PENDING,
      groups: {
        name: '알고리즘 스터디',
        penalty_title: '지각비 5000원',
      },
    },
    {
      id: '2', 
      group_id: 'group-2',
      invitee_id: user.id,
      state: InviteState.PENDING,
      groups: {
        name: '모닝 루틴',
        penalty_title: '안일어나면 10000원',
      },
    },
  ];

  return (
    <div className="w-full p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-text-primary mb-4">Notifications</h1>

      {invitations.length === 0 ? (
        <div className="text-center py-10 text-text-secondary">
          <p>받은 초대가 없습니다.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {invitations.map((invitation) => (
            <li key={invitation.id}>
              <DefaultCard title="">
                <div className="flex flex-col gap-2 justify-start md:flex-row md:justify-between md:items-center w-full">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-primary font-bold">
                      Group Invite
                    </span>
                    <h3 className="text-lg font-semibold text-text-primary">
                      {invitation.groups.name}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Penalty: <span className="text-danger">{invitation.groups.penalty_title}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {/* TODO: Implement Accept/Reject buttons */}
                    <button className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition-colors text-sm">
                      수락
                    </button>
                    <button className="px-4 py-2 bg-background-secondary text-text-primary border border-border rounded hover:bg-border transition-colors text-sm">
                      거절
                    </button>
                  </div>
                </div>
              </DefaultCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
