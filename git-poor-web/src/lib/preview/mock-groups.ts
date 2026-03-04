/**
 * Preview 모드용 Groups / Notifications Mock 데이터
 *
 * - GroupSummary[] (홈 그룹 리스트)
 * - PaginationMeta
 * - GroupInfo + GroupMemberWithCommit[] (그룹 상세)
 * - InvitationWithGroup[] (알림)
 */
import type {
  GroupSummary,
  GroupInfo,
  GroupMemberWithCommit,
  PaginationMeta,
  InvitationWithGroup,
} from '@/types';
import { InviteState } from '@/types';
import { PREVIEW_USER_ID } from './mock-user';

// ─── 고정 ID ────────────────────────────────────────────────

export const GROUP_ID_OWNER = 'g1a2b3c4-d5e6-f789-0abc-def123456789';
export const GROUP_ID_MEMBER = 'g2b3c4d5-e6f7-8901-abcd-ef2345678901';

// ─── Home 그룹 리스트용 GroupSummary[] ───────────────────────

export const mockGroups: GroupSummary[] = [
  {
    id: GROUP_ID_OWNER,
    name: '주니어 개발자 스터디',
    penalty_title: '스터디카페 커피 한 잔 사기',
    day_start_hour: 5,
    member_count: 4,
    is_owner: true,
    my_penalty_count: 2,
  },
  {
    id: GROUP_ID_MEMBER,
    name: '사이드 프로젝트팀',
    penalty_title: '팀원 전원에게 아이스크림 쏘기',
    day_start_hour: 5,
    member_count: 5,
    is_owner: false,
    my_penalty_count: 0,
  },
];

export const mockGroupsMeta: PaginationMeta = {
  page: 1,
  limit: 10,
  total_count: 2,
  total_pages: 1,
  has_next_page: false,
};

// ─── 그룹 상세: 주니어 개발자 스터디 (내가 오너) ─────────────

export const mockGroupInfoOwner: GroupInfo = {
  id: GROUP_ID_OWNER,
  name: '주니어 개발자 스터디',
  timezone: 'Asia/Seoul',
  day_start_hour: 5,
  apply_penalty_weekend: false,
  penalty_title: '스터디카페 커피 한 잔 사기',
};

export const mockGroupMembersOwner: GroupMemberWithCommit[] = [
  {
    user_id: PREVIEW_USER_ID,
    github_id: 'gitpoor-dev',
    email: 'gitpoor-dev@example.com',
    nickname: '김개발',
    profile_image:
      'https://ui-avatars.com/api/?name=김개발&background=0D8ABC&color=fff&size=128',
    role: 'owner',
    total_penalty_count: 5,
    current_penalty_count: 2,
    joined_at: '2025-06-15',
    today_commit_count: 5,
  },
  {
    user_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    github_id: 'code-master-j',
    email: 'codej@example.com',
    nickname: '이정훈',
    profile_image:
      'https://ui-avatars.com/api/?name=이정훈&background=2ECC71&color=fff&size=128',
    role: 'member',
    total_penalty_count: 3,
    current_penalty_count: 1,
    joined_at: '2025-07-02',
    today_commit_count: 3,
  },
  {
    user_id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    github_id: 'suzy-fullstack',
    email: 'suzy@example.com',
    nickname: '박수지',
    profile_image:
      'https://ui-avatars.com/api/?name=박수지&background=E74C3C&color=fff&size=128',
    role: 'member',
    total_penalty_count: 8,
    current_penalty_count: 4,
    joined_at: '2025-08-10',
    today_commit_count: 0,
  },
  {
    user_id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
    github_id: 'backend-hoon',
    email: 'hoon@example.com',
    nickname: '최지훈',
    profile_image:
      'https://ui-avatars.com/api/?name=최지훈&background=9B59B6&color=fff&size=128',
    role: 'member',
    total_penalty_count: 1,
    current_penalty_count: 0,
    joined_at: '2025-09-20',
    today_commit_count: 7,
  },
];

// ─── 그룹 상세: 사이드 프로젝트팀 (내가 멤버) ───────────────

export const mockGroupInfoMember: GroupInfo = {
  id: GROUP_ID_MEMBER,
  name: '사이드 프로젝트팀',
  timezone: 'Asia/Seoul',
  day_start_hour: 5,
  apply_penalty_weekend: true,
  penalty_title: '팀원 전원에게 아이스크림 쏘기',
};

export const mockGroupMembersMember: GroupMemberWithCommit[] = [
  {
    user_id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
    github_id: 'team-lead-kim',
    email: 'tlkim@example.com',
    nickname: '김팀장',
    profile_image:
      'https://ui-avatars.com/api/?name=김팀장&background=F39C12&color=fff&size=128',
    role: 'owner',
    total_penalty_count: 0,
    current_penalty_count: 0,
    joined_at: '2025-10-01',
    today_commit_count: 4,
  },
  {
    user_id: PREVIEW_USER_ID,
    github_id: 'gitpoor-dev',
    email: 'gitpoor-dev@example.com',
    nickname: '김개발',
    profile_image:
      'https://ui-avatars.com/api/?name=김개발&background=0D8ABC&color=fff&size=128',
    role: 'member',
    total_penalty_count: 2,
    current_penalty_count: 0,
    joined_at: '2025-10-05',
    today_commit_count: 5,
  },
  {
    user_id: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
    github_id: 'design-yuna',
    email: 'yuna@example.com',
    nickname: '한유나',
    profile_image:
      'https://ui-avatars.com/api/?name=한유나&background=1ABC9C&color=fff&size=128',
    role: 'member',
    total_penalty_count: 4,
    current_penalty_count: 2,
    joined_at: '2025-10-05',
    today_commit_count: 2,
  },
  {
    user_id: 'a7b8c9d0-e1f2-3456-abcd-567890123456',
    github_id: 'devops-min',
    email: 'min@example.com',
    nickname: '정민수',
    profile_image:
      'https://ui-avatars.com/api/?name=정민수&background=E67E22&color=fff&size=128',
    role: 'member',
    total_penalty_count: 6,
    current_penalty_count: 3,
    joined_at: '2025-11-12',
    today_commit_count: 0,
  },
  {
    user_id: 'b8c9d0e1-f2a3-4567-bcde-678901234567',
    github_id: 'infra-park',
    email: 'park@example.com',
    nickname: '박서준',
    profile_image:
      'https://ui-avatars.com/api/?name=박서준&background=3498DB&color=fff&size=128',
    role: 'member',
    total_penalty_count: 2,
    current_penalty_count: 1,
    joined_at: '2025-12-01',
    today_commit_count: 1,
  },
];

// ─── 그룹 상세 빠른 조회용 헬퍼 ─────────────────────────────

export function getMockGroupDetail(groupId: string) {
  if (groupId === GROUP_ID_OWNER) {
    return {
      group_info: mockGroupInfoOwner,
      members: mockGroupMembersOwner,
      isOwner: true,
    };
  }
  return {
    group_info: mockGroupInfoMember,
    members: mockGroupMembersMember,
    isOwner: false,
  };
}

// ─── Notifications: InvitationWithGroup[] ────────────────────

export const mockInvitations: InvitationWithGroup[] = [
  {
    id: 'inv-1a2b3c4d-e5f6-7890-abcd-111111111111',
    group_id: 'g3c4d5e6-f7a8-9012-bcde-f34567890123',
    invitee_id: PREVIEW_USER_ID,
    state: InviteState.PENDING,
    groups: {
      name: '오픈소스 컨트리뷰터즈',
      penalty_title: '깃헙 별 10개 프로젝트에 PR 올리기',
    },
  },
  {
    id: 'inv-2b3c4d5e-f6a7-8901-bcde-222222222222',
    group_id: 'g4d5e6f7-a8b9-0123-cdef-a45678901234',
    invitee_id: PREVIEW_USER_ID,
    state: InviteState.PENDING,
    groups: {
      name: '알고리즘 챌린지',
      penalty_title: '팀 슬랙에 인증샷 올리기',
    },
  },
];

export const mockInvitationsMeta: PaginationMeta = {
  page: 1,
  limit: 10,
  total_count: 2,
  total_pages: 1,
  has_next_page: false,
};
