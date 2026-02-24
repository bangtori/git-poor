import { getCalendarDate } from '@/lib/utils/calendar-utils';
import HistoryClient from './history-client';
import {
  DailyStat,
  getHistoryMapByDateRange,
} from '@/services/history-service';
import { getCachedUser } from '@/lib/utils/auth-utils';

export default async function HistoryPage() {
  const user = await getCachedUser();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const calendarDays = getCalendarDate(year, month);

  const fromDate = calendarDays[0]?.fullDate;
  const toDate = calendarDays[calendarDays.length - 1]?.fullDate;

  const initialData: Record<string, DailyStat> = {};

  if (user && fromDate && toDate) {
    const result = await getHistoryMapByDateRange(user.id, fromDate, toDate);

    if (!result.success) {
      console.error(result.error);
    } else {
      Object.assign(initialData, result.data);
    }
  }

  return <HistoryClient initialData={initialData} />;
}
