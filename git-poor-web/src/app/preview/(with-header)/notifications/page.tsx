import InvitationList from '@/app/(main)/notifications/_components/invitation-list';
import {
  mockInvitations,
  mockInvitationsMeta,
} from '@/lib/preview/mock-groups';
export default function PreviewNotificationsPage() {
  return (
    <div className="w-full p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-text-primary mb-4">
        Notifications
      </h1>

      <InvitationList
        initialInvitations={mockInvitations}
        initialMeta={mockInvitationsMeta}
      />
    </div>
  );
}
