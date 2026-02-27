export function perfMark(name: string) {
  if (typeof window === 'undefined') return;
  performance.mark(name);
}

export function perfMeasure(label: string, startMark: string, endMark: string) {
  if (typeof window === 'undefined') return;

  try {
    performance.measure(label, startMark, endMark);
    const entry = performance.getEntriesByName(label).slice(-1)[0];
    // ms가 너무 길면 반올림
    console.log(
      `[Perf] ${label}:`,
      Math.round((entry?.duration ?? 0) * 100) / 100,
      'ms',
    );
  } catch (e) {
    console.log(`[Perf] measure failed: ${label}`, e);
  }
}
