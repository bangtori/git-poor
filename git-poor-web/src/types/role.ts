export enum GroupRole {
  OWNER = 'owner', // 그룹장 (생성자)
  ADMIN = 'admin', // 관리자
  MEMBER = 'member', // 일반 멤버
}

export function getGroupRoleKey(roleString: string): GroupRole | undefined {
  const roleMap: Record<string, GroupRole> = {
    owner: GroupRole.OWNER,
    admin: GroupRole.ADMIN,
    member: GroupRole.MEMBER,
  };

  return roleMap[roleString.toLowerCase()];
}
