// GitPoor 기준 날짜 반환
export const getGitPoorDate = (date: Date | string): string => {
  const d = new Date(date);
  // UTC 시간을 받아서 4시간을 더해 계산 (한국시간 5시가 기준점이 됨)
  // 로직이 복잡하면 여기서만 수정하면 됨
  d.setHours(d.getHours() + 4);
  return d.toISOString().split('T')[0];
};
