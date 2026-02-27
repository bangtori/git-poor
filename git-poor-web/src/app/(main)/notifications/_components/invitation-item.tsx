'use client';

import DefaultCard from '@/components/ui/default-card';
import { InvitationWithGroup, InviteState, Invitation } from '@/types';
import { useState } from 'react';
import { ApiResponse } from '@/lib/http/reponse';
import { handleActionError } from '@/lib/error/handle-action-error';

interface InvitationItemProps {
  invitation: InvitationWithGroup;
  onResponded?: () => void;
}

export default function InvitationItem({
  invitation,
  onResponded,
}: InvitationItemProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleResponse = async (state: InviteState) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/invitations/${invitation.id}/respond`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ state }),
        },
      );

      const result: ApiResponse<Invitation> = await response.json();

      if (result.success) {
        // 성공 시 부모에게 알림
        onResponded?.();
      } else {
        handleActionError(result.error);
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      handleActionError({ message: '오류가 발생했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <li>
      <DefaultCard title="">
        <div className="flex flex-col gap-2 justify-start md:flex-row md:justify-between md:items-center w-full">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-primary font-bold">Group Invite</span>
            <h3 className="text-lg font-semibold text-text-primary">
              {invitation.groups?.name ?? '(Deleted Group)'}
            </h3>
            <p className="text-sm text-text-secondary">
              Penalty:{' '}
              <span className="text-danger">
                {invitation.groups.penalty_title ?? '-'}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleResponse(InviteState.ACCEPTED)}
              disabled={isLoading}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors text-sm disabled:opacity-50"
            >
              {isLoading ? '처리 중...' : '수락'}
            </button>
            <button
              onClick={() => handleResponse(InviteState.REJECTED)}
              disabled={isLoading}
              className="px-4 py-2 bg-background-secondary text-text-primary border border-border rounded hover:bg-border transition-colors text-sm disabled:opacity-50"
            >
              거절
            </button>
          </div>
        </div>
      </DefaultCard>
    </li>
  );
}
