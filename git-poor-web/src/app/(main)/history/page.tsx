'use client';
import HistoryCalendar from './_components/calendar';
import { useState } from 'react';
import type { CommitDetail } from '@/types/commit';
import CommitList from './_components/commit_list';

interface SelectedState {
  date: string | null; // 선택된 날짜
  commits: CommitDetail[]; // 커밋 리스트
  isLoading: boolean; // 로딩 중 여부
}

export default function HistoryPage() {
  const [selectedState, setSelectedState] = useState<SelectedState>({
    date: null,
    commits: [],
    isLoading: false,
  });

  function handleSelectDate(date: string) {
    const fetchDateCommits = async () => {
      setSelectedState((prev) => ({
        ...prev,
        date,
        isLoading: true,
        commits: [],
      }));
      try {
        const res = await fetch(`/api/commits?date=${date}`);

        if (!res.ok) {
          throw new Error('Failed to fetch');
        }

        const responseData = await res.json();
        const data: CommitDetail[] = responseData.data;

        setSelectedState({
          date,
          commits: data,
          isLoading: false,
        });

        console.log('[지정 날짜 Commit Data API] 불러온 데이터:', data);
      } catch (error) {
        console.error('커밋 히스토리 로딩 실패:', error);
        setSelectedState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchDateCommits();
  }
  return (
    <main className="w-full flex flex-col">
      <h2 className="text-text-primary font-bold text-2xl md:text-5xl mt-8 mx-4">
        My Commit History
      </h2>
      <HistoryCalendar onDateSelect={handleSelectDate} />
      {selectedState.date &&
        (selectedState.isLoading ? (
          <div className="w-full">
            <h2 className="w-full text-center text-2xl">Loading</h2>
          </div>
        ) : (
          <CommitList
            selectedDate={selectedState.date}
            commits={selectedState.commits}
          />
        ))}
    </main>
  );
}
