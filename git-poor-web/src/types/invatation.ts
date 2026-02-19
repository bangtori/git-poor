export interface Invitation {
  id: string;
  group_id: string;
  invitee_id: string
  state: InviteState;
}

export interface InvitationWithGroup extends Invitation {
  groups: {
    name: string;
    penalty_title: string;
  };
}

export interface InvitationRequst {
  group_id: string;
  invitee_id: string
  state: InviteState.PENDING
}

export enum InviteState {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export function getInviteStateKey(
  stateString: string,
): InviteState | undefined {
  const stateMap: Record<string, InviteState> = {
    pending: InviteState.PENDING,
    accepted: InviteState.ACCEPTED,
    rejected: InviteState.REJECTED,
  };

  return stateMap[stateString.toLowerCase()];
}