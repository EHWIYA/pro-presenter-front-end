import type { BuiltinSongCategory, SongCategory } from '@/api';

export interface SongCategoryDef {
  id: SongCategory;
  label: string;
  shortLabel: string;
  description: string;
  builtin: true;
  accent: string;
}

export const BUILTIN_CATEGORY_DEFS: SongCategoryDef[] = [
  {
    id: 'praise',
    label: '찬양',
    shortLabel: '찬양',
    description: '현대 찬양·워십',
    builtin: true,
    accent: '#5a9fd4',
  },
  {
    id: 'hymnal',
    label: '찬송가',
    shortLabel: '찬송가',
    description: '찬송가 번호·전통 찬송',
    builtin: true,
    accent: '#7d8f6b',
  },
  {
    id: 'hymn',
    label: '성가곡',
    shortLabel: '성가',
    description: '전통 성가·시편',
    builtin: true,
    accent: '#5a6f7d',
  },
  {
    id: 'special',
    label: '특송',
    shortLabel: '특송',
    description: '특별 찬양·연주 곡',
    builtin: true,
    accent: '#c4a77d',
  },
];

export const BUILTIN_CATEGORY_IDS: BuiltinSongCategory[] = [
  'praise',
  'hymnal',
  'hymn',
  'special',
];

export function getAllCategoryDefs(): SongCategoryDef[] {
  return BUILTIN_CATEGORY_DEFS;
}

export function findCategoryDef(
  categoryId: SongCategory,
): SongCategoryDef | undefined {
  return BUILTIN_CATEGORY_DEFS.find((d) => d.id === categoryId);
}

export function getKnownCategoryIds(): Set<string> {
  return new Set(BUILTIN_CATEGORY_IDS);
}

export function validateCategoryLabel(label: string):
  | { ok: true; trimmed: string }
  | { ok: false; message: string } {
  const trimmed = label.trim();
  if (!trimmed) {
    return { ok: false, message: '카테고리 이름을 입력하세요.' };
  }
  if (trimmed.length > 24) {
    return { ok: false, message: '이름은 24자 이하로 입력하세요.' };
  }
  const builtins = BUILTIN_CATEGORY_DEFS.map((d) => d.label);
  if (builtins.includes(trimmed)) {
    return { ok: false, message: '기본 장르와 같은 이름은 사용할 수 없습니다.' };
  }
  return { ok: true, trimmed };
}
