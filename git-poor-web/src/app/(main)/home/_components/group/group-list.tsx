import FilledButton from '@/components/ui/filled-button';

const dummyData = Array.from({ length: 4 }).map((_, i) => ({
  id: i,
  title: 'Room Title',
  members: 3,
  penalty: 'N회',
}));

export default function GroupListSection() {
  return (
    <div className="w-full pt-8 min-h-screen text-white">
      {/* [컨테이너 레이아웃]
        - 기본(모바일): grid grid-cols-2 (2열 카드)
        - md(데스크탑): flex flex-col (1열 리스트) 
      */}
      <ul className="w-full grid grid-cols-2 gap-3 md:flex md:flex-col md:gap-4">
        {dummyData.map((item) => (
          <li
            key={item.id}
            className="
              bg-background-card rounded-xl p-4
              flex flex-col items-center justify-center gap-3
              md:flex-row md:justify-between md:px-6 md:py-4
            "
          >
            {/* 1. 타이틀 & 정보 그룹 */}
            <div className="flex flex-col items-center gap-2 md:flex-row md:gap-6">
              {/* 방 제목 */}
              <span className="text-primary font-bold text-lg">
                {item.title}
              </span>

              {/* 인원 및 벌금 정보 (모바일: 세로, 데스크탑: 가로) */}
              <div className="flex flex-col items-center text-gray-400 text-sm gap-1 md:flex-row md:gap-4">
                <div className="flex items-center gap-1">
                  {/* 아이콘 대용 (User Icon) */}
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  <span>{item.members}명</span>
                </div>
                <span>내 벌금 : {item.penalty}</span>
              </div>
            </div>

            {/* 2. 버튼 */}
            <FilledButton className="w-full hover:bg-primary-hover md:w-auto px-4 py-2">
              바로가기
            </FilledButton>
          </li>
        ))}
      </ul>
    </div>
  );
}
