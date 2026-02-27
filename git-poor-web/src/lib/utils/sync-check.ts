import { differenceInMinutes } from 'date-fns';

// 동기화 시간 임계치 기본값
const DEFAULT_SYNC_THRESHOLD_MINUTES = 60; // 개인: 1시간
const GROUP_SYNC_THRESHOLD_MINUTES = 180; // 그룹: 3시간 (너무 자주하면 API 터짐 방지)

/**
 * 마지막 동기화 시간을 기준으로 현재 동기화가 필요한지 판단합니다.
 * @param lastSyncDateStr - DB에서 가져온 마지막 동기화 시간 (ISO String or null)
 * @param thresholdMinutes - 동기화 쿨타임 (기본값 60분)
 * @returns boolean - 동기화 진행 여부
 */
export function shouldRunAutoSync(
  lastSyncDateStr: string | null | undefined,
  thresholdMinutes: number = DEFAULT_SYNC_THRESHOLD_MINUTES,
): boolean {
  // 한 번도 동기화한 적 없으면 무조건 실행
  if (!lastSyncDateStr) {
    return true;
  }

  const lastSyncDate = new Date(lastSyncDateStr);
  const now = new Date();

  const diff = differenceInMinutes(now, lastSyncDate);
  return diff >= thresholdMinutes;
}
