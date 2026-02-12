export interface GroupSummary {
  id: string;
  name: string;
  penalty_title: string;
  day_start_hour: number;
  member_count: number; // 계산된 멤버 수
  is_owner: boolean; // 내가 방장인지 여부
  my_penalty_count: number;
}
