'use client';

import { useState, useEffect } from 'react';
import { isToday, addMonths, subMonths } from 'date-fns';
import { getCalendarDate, getGrassClass } from '@/lib/utils/calendar-utils'; // 작성하신 유틸 함수 경로
import { ChevronLeft, ChevronRight, Leaf } from 'lucide-react';

// 요일 헤더 값
const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

interface DailyStat {
  commit_date: string;
  commit_count: number;
  total_changes: number;
}

export default function HistoryCalendar() {
  // 현재 보고 있는 달력의 기준 날짜 (기본값: 오늘)
  const [currentDate, setCurrentDate] = useState(new Date());
  // 커밋 데이터 (날짜를 키로 하는 객체 형태)
  const [historyMap, setHistoryMap] = useState<Record<string, DailyStat>>({});

  //  년, 월 추출
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // 날짜 배열 추출
  const calendarDays = getCalendarDate(currentYear, currentMonth);

  // 월 이동 로직
  function handleChangeMonth(buttonType: 'prev' | 'next') {
    setCurrentDate((prevDate) => {
      const newDate =
        buttonType === 'prev' ? subMonths(prevDate, 1) : addMonths(prevDate, 1);
      return new Date(newDate.getFullYear(), newDate.getMonth(), 1);
    });
  }

  // 월이 바뀌거나 초기 렌더링 시 데이터 로드
  useEffect(() => {
    const fetchCommitHistory = async () => {
      // 캘린더 그리드의 가장 첫 날짜와 마지막 날짜를 구함 (YYYY-MM-DD)
      if (calendarDays.length === 0) return;

      const fromDate = calendarDays[0].fullDate;
      const toDate = calendarDays[calendarDays.length - 1].fullDate;

      try {
        // API 호출
        const res = await fetch(
          `/api/commits/history?from=${fromDate}&to=${toDate}`,
        );
        if (!res.ok) throw new Error('Failed to fetch');

        const data = await res.json();
        setHistoryMap(data); // 데이터 저장
      } catch (error) {
        console.error('커밋 히스토리 로딩 실패:', error);
      }
    };

    fetchCommitHistory();
  }, [currentDate]);

  return (
    <section className="w-full flex flex-col justify-center px-3 py-4 md:px-6">
      {/* TODO: - 나중에 Picker 이용해서 한번에 이동 가능하도록 수정 */}
      {/* Calendar Header - 월, 이동 버튼 */}
      <div className="flex items-center gap-2 text-xl md:text-2xl font-bold text-text-primary">
        <button
          className="hover:text-text-secondary"
          onClick={() => handleChangeMonth('prev')}
        >
          <ChevronLeft size={30} />
        </button>
        <span className="min-w-[140px] text-center">
          {currentYear}년 {currentMonth}월
        </span>
        <button
          className="hover:text-text-secondary"
          onClick={() => handleChangeMonth('next')}
        >
          <ChevronRight size={30} />
        </button>
      </div>

      {/* 요일 Header (일 ~ 토) */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-lg md:text-xl text-text-secondary font-medium py-1"
          >
            {day}
          </div>
        ))}
      </div>
      {/* Calendar Grid 날짜 영역 */}
      <div className="grid grid-cols-7 gap-y-2 gap-x-1">
        {calendarDays.map((dayData) => {
          const stat = historyMap[dayData.fullDate];
          const totalChanges = stat?.total_changes || 0;
          const level = getGrassClass(totalChanges);
          console.log('----totalChanges:' + totalChanges);

          return (
            <div
              key={dayData.fullDate}
              className={`
                aspect-square rounded-lg cursor-pointer transition-all
                flex flex-col items-center justify-between p-2 md:justify-center md:relative
                text-sm relative bg-background-card
                
                ${
                  /* 이번 달이 아니면 흐리게 처리 */
                  !dayData.isCurrentMonth
                    ? 'text-text-tertiary'
                    : 'text-text-primary'
                }
              `}
              title={`${dayData.fullDate}: ${totalChanges} lines`}
            >
              {/* 오늘이면 날짜 색상 다르게 */}
              <span
                className={`text-sm font-bold self-start 
                md:absolute md:top-2 md:left-2 md:text-xl 
                ${isToday(dayData.dateObj) ? 'text-primary' : ''}`}
              >
                {dayData.day}
              </span>
              <Leaf
                size={10}
                className={`
                  w-5 h-5 md:w-8 md:h-8 lg:w-10 lg:h-10 
                  transition-colors duration-300
                  ${level} 
                `}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
