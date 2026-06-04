import type { SongSectionType } from '@/api';

export const SECTION_TYPE_OPTIONS: {
  value: SongSectionType;
  label: string;
}[] = [
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
  intro: '#7a8aa8',
  verse: 'var(--color-accent)',
  pre_chorus: '#9b7ed8',
  chorus: 'var(--color-warning)',
  bridge: '#5bcfcf',
  tag: '#6bcf8e',
  outro: '#7a8aa8',
  instrumental: '#6a6a80',
  unknown: 'var(--color-border)',
};

export function sectionTypeLabel(type: SongSectionType): string {
  return SECTION_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}
