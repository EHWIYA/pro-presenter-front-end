/** 첫 비어 있지 않은 줄을 성경 참조로 사용 (레거시 textarea 호환) */
export function extractBibleReference(text: string): string {
  const line = text
    .split('\n')
    .map((l) => l.trim())
    .find(Boolean);
  return line ?? '';
}
