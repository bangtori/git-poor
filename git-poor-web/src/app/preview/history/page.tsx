import HistoryClient from '@/app/(main)/history/history-client';
import { mockHistoryMap } from '@/lib/preview/mock-history';

export default function PreviewHistoryPage() {
  return <HistoryClient initialData={mockHistoryMap} />;
}
