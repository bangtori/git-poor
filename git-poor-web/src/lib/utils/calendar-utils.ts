import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
} from 'date-fns';
import { CalendarDateProps } from '@/types';

// 달력뷰 1페이지 날짜 배열 반환 함수
export const getCalendarDate = (
  year: number,
  month: number,
): CalendarDateProps[] => {
  const baseDate = new Date(year, month - 1, 1);

  const monthStart = startOfMonth(baseDate); // 2월 1일
  const monthEnd = endOfMonth(baseDate); // 2월 28일

  const startDate = startOfWeek(monthStart); // 달력 시작일 (1월 말일 수 있음)
  const endDate = endOfWeek(monthEnd); // 달력 종료일 (3월 초일 수 있음)

  const dateArray = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });
  return dateArray.map((date) => ({
    dateObj: date,
    day: format(date, 'd'),
    fullDate: format(date, 'yyyy-MM-dd'),
    isCurrentMonth: isSameMonth(date, baseDate),
  }));
};

export function getGrassClass(changes: number): string {
  if (changes <= 0) return 'text-grass-0';
  if (changes <= 15) return 'text-grass-1';
  if (changes <= 60) return 'text-grass-2';
  if (changes <= 150) return 'text-grass-3';
  return 'text-grass-4';
}
