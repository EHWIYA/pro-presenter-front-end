import type { BuiltinSongCategory, SongCategory } from '@/api';

export interface SongCategoryDef {
  id: SongCategory;
  label: string;
  shortLabel: string;
  description: string;
  builtin: boolean;
  accent: string;
}

export interface CustomCategoryRecord {
  id: `custom:${string}`;
  label: string;
  createdAt: string;
  updatedAt?: string;
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
  'hymn',
  'special',
];

const CUSTOM_ACCENT = '#6b7b8c';

let cachedCustomCategories: CustomCategoryRecord[] = [];

export function setCachedCustomCategories(rows: CustomCategoryRecord[]): void {
  cachedCustomCategories = rows;
}

export function getCachedCustomCategories(): CustomCategoryRecord[] {
  return cachedCustomCategories;
}

export function slugifyCategoryLabel(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return '';
  const ascii = trimmed
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9가-힣-]/g, '')
    .slice(0, 32);
  if (ascii) return ascii;
  return `cat-${Date.now().toString(36)}`;
}

function customToDef(row: CustomCategoryRecord): SongCategoryDef {
  return {
    id: row.id,
    label: row.label,
    shortLabel:
      row.label.length > 6 ? `${row.label.slice(0, 5)}…` : row.label,
    description: '사용자 추가 카테고리',
    builtin: false,
    accent: CUSTOM_ACCENT,
  };
}

export function buildCategoryDefs(
  custom: CustomCategoryRecord[],
): SongCategoryDef[] {
  return [...BUILTIN_CATEGORY_DEFS, ...custom.map(customToDef)];
}

export function getAllCategoryDefs(): SongCategoryDef[] {
  return buildCategoryDefs(cachedCustomCategories);
}

export function findCategoryDef(
  categoryId: SongCategory,
): SongCategoryDef | undefined {
  return getAllCategoryDefs().find((d) => d.id === categoryId);
}

export function getKnownCategoryIds(): Set<string> {
  return new Set(getAllCategoryDefs().map((d) => d.id));
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
