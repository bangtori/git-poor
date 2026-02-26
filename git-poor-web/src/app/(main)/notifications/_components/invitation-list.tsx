'use client';

import { InvitationWithGroup, PaginationMeta } from '@/types';
import { ApiResponse } from '@/lib/http/reponse';
import InvitationItem from './invitation-item';
import Pagination from '@/components/ui/pagination';
import { useState, useCallback } from 'react';

interface InvitationListProps {
  initialInvitations: InvitationWithGroup[];
  initialMeta: PaginationMeta;
}

export default function InvitationList({
  initialInvitations,
  initialMeta,
}: InvitationListProps) {
  const [invitations, setInvitations] =
    useState<InvitationWithGroup[]>(initialInvitations);
  const [meta, setMeta] = useState<PaginationMeta>(initialMeta);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPage = useCallback(
    async (page: number) => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/invitations?page=${page}&limit=${meta.limit}`,
        );
        const result: ApiResponse<InvitationWithGroup[]> = await res.json();

        if (result.success) {
          setInvitations(result.data);
          if (result.meta) setMeta(result.meta);
        }
      } catch (error) {
        console.error('[Invitations Fetch Error]', error);
      } finally {
        setIsLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [meta.limit],
  );

  const handleRefresh = () => {
    fetchPage(meta.page);
  };

  if (invitations.length === 0) {
    return (
      <div className="text-center py-10 text-text-secondary">
        <p>받은 초대가 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <ul
        className={`flex flex-col gap-3 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {invitations.map((invitation) => (
          <InvitationItem
            key={invitation.id}
            invitation={invitation}
            onResponded={handleRefresh}
          />
        ))}
      </ul>
      <div className="mt-6 pb-10 flex justify-center">
        <Pagination
          currentPage={meta.page}
          totalPages={meta.total_pages}
          onChange={fetchPage}
          maxVisible={5}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
