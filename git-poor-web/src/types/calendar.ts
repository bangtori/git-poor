export interface CalendarDateProps {
  dateObj: Date; // 원본 Date 객체
  day: string; // '6' (화면 표시용)
  fullDate: string; // '2026-02-06' (데이터 매칭용 key)
  isCurrentMonth: boolean; // (스타일링용)
}
