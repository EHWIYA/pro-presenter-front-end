import type { SongSectionType } from '@/api';

export const SECTION_TYPE_OPTIONS: {
  value: SongSectionType;
  label: string;
}[] = [
  { value: 'title', label: 'Title' },
  { value: 'intro', label: 'Intro' },
  { value: 'verse', label: 'Verse' },
  { value: 'pre_chorus', label: 'Pre-chorus' },
  { value: 'chorus', label: 'Chorus' },
  { value: 'bridge', label: 'Bridge' },
  { value: 'tag', label: 'Tag' },
  { value: 'outro', label: 'Outro' },
  { value: 'instrumental', label: 'Inst.' },
  { value: 'unknown', label: '기타' },
];

/** 구간 카드 왼쪽 액센트 색 */
export const SECTION_TYPE_ACCENT: Record<SongSectionType, string> = {
  title: '#9a8b6e',
  intro: '#6b7b8c',
  verse: 'var(--color-accent)',
  pre_chorus: '#5a6f7d',
  chorus: 'var(--color-warning)',
  bridge: '#7ab8d9',
  tag: '#4a7a62',
  outro: '#6b7b8c',
  instrumental: '#8a9590',
  unknown: 'var(--color-border)',
};

export function sectionTypeLabel(type: SongSectionType): string {
  return SECTION_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}
