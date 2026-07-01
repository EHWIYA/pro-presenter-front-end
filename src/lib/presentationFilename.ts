/** KST 기준 YYMMDD (BFF presentation_filename 규칙과 동일) */
export function formatKstYyMmDd(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const y = parts.find((p) => p.type === 'year')?.value ?? '00';
  const m = parts.find((p) => p.type === 'month')?.value ?? '01';
  const d = parts.find((p) => p.type === 'day')?.value ?? '01';
  return `${y}${m}${d}`;
}

/** BFF 기본 규칙: YYMMDD-말씀.pro */
export function defaultMailPresentationFilename(date = new Date()): string {
  return `${formatKstYyMmDd(date)}-말씀.pro`;
}
