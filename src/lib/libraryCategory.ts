import type { SongCategory } from '@/api';

export type LibraryCategory = '찬양' | '찬송가' | '성가곡';

const HYMN_NUMBER_TITLE = /^\d+\./;

/**
 * BFF build-song libraryCategory 자동 분기 보조.
 * 번호 패턴(413.…)은 명시 전송, 그 외는 BFF에 위임(undefined).
 */
export function inferLibraryCategory(
  category: SongCategory,
  title: string,
): LibraryCategory | undefined {
  const trimmed = title.trim();
  if (HYMN_NUMBER_TITLE.test(trimmed)) {
    return '찬송가';
  }
  if (category.startsWith('custom:')) {
    return undefined;
  }
  if (category === 'hymn') {
    return '성가곡';
  }
  if (category === 'praise' || category === 'special') {
    return '찬양';
  }
  return undefined;
}
