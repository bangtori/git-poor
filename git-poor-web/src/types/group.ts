import { GroupRole } from './role';

export interface GroupSummary {
  id: string;
  name: string;
  penalty_title: string;
  day_start_hour: number;
  member_count: number; // 계산된 멤버 수
  is_owner: boolean; // 내가 방장인지 여부
  my_penalty_count: number;
}

export interface GroupInfo {
  id: string;
  name: string;
  timezone: string;
  day_start_hour: number;
  apply_penalty_weekend: boolean;
  penalty_title: string;
}

export interface GroupMember {
  user_id: string;
  github_id: string;
  email: string;
  nickname: string;
  profile_image: string;
  role: string;
  total_penalty_count: number;
  current_penalty_count: number;
  joined_at: string;
}

export interface GroupDetail {
  group_info: GroupInfo;
  members: GroupMemberWithCommit[];
}

export interface GroupMemberWithCommit extends GroupMember {
  today_commit_count: number;
}
