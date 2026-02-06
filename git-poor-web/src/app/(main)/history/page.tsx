import HistoryCalendar from './_components/calendar';

export default function HistoryPage() {
  return (
    <main className="w-full flex flex-col">
      <h2 className="text-text-primary font-bold text-2xl md:text-5xl mt-8 mx-4">
        My Commit History
      </h2>
      <HistoryCalendar />
    </main>
  );
}
