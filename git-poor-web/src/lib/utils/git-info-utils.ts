// 확장자 추출
export const getExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

// 언어 추론
export const inferLanguage = (ext: string): string => {
  const map: Record<string, string> = {
    ts: 'TypeScript',
    tsx: 'TypeScript',
    js: 'JavaScript',
    jsx: 'JavaScript',
    swift: 'Swift',
    py: 'Python',
    java: 'Java',
    kt: 'Kotlin',
    go: 'Go',
    c: 'C',
    cpp: 'C++',
    css: 'CSS',
    html: 'HTML',
    vue: 'Vue',
    svelte: 'Svelte',
    dart: 'Dart',
    rs: 'Rust',
    rb: 'Ruby',
    php: 'PHP',
  };
  return map[ext] || 'Other';
};
