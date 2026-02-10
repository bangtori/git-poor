import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 1. 배경 관련 (Backgrounds)
        background: {
          DEFAULT: '#0d1117', // 메인 배경 (bg-background)
          card: '#161b22', // 카드 배경 (bg-background-card)
          input: '#21262d', // 입력창 배경
        },

        // 2. 메인 포인트 (Primary - Success)
        primary: {
          DEFAULT: '#26a641', // 형광 초록 (text-primary, bg-primary)
          hover: '#2ecc71', // 버튼 눌렀을 때 조금 어두운 색
          dim: 'rgba(38, 166, 65, 0.1)', // 살짝 깔리는 배경색 (틴트)
        },

        // 3. 벌금/경고 (Destructive)
        danger: {
          DEFAULT: '#f85149', // 빨강 (text-danger)
        },

        // 4. 텍스트 (Foreground)
        text: {
          primary: '#f0f6fc', // 1단계: 제목, 본문, 강조 (거의 흰색)
          secondary: '#8b949e', // 2단계: 설명, 날짜, 메타정보 (회색)
          tertiary: '#484f58', // 3단계: 플레이스홀더, 아이콘, 아주 흐린 정보 (진한 회색)
          inverse: '#010409', // 밝은 배경(버튼) 위에 쓸 진한 검정
        },

        // 5. 잔디 색상 (Contribution Levels)
        grass: {
          0: '#3f3f46', // 없음
          1: '#0e4429', // 조금
          2: '#006d32', // 중간
          3: '#26a641', // 많음
          4: '#39d353', // 풀버닝 (Primary와 동일)
        },

        // 6. 보더 색상
        border: {
          DEFAULT: '#30363d', // 기본 보더 (border-border)
          hover: '#8b949e', // 마우스 올렸을 때 좀 더 진하게
        },
      },
    },
  },
  plugins: [],
};
export default config;
