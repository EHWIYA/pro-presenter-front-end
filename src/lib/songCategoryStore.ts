import type { BuiltinSongCategory, SongCategory } from '@/api';

export interface SongCategoryDef {
  id: SongCategory;
  label: string;
  shortLabel: string;
  description: string;
  builtin: boolean;
  accent: string;
}

const STORAGE_KEY = 'pro-presenter:song-categories:custom';

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

export const SONG_CATEGORIES_CHANGED = 'pro-presenter:song-categories-changed';

export interface CustomCategoryRecord {
  id: `custom:${string}`;
  label: string;
  createdAt: string;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function readCustomRaw(): CustomCategoryRecord[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is CustomCategoryRecord =>
        typeof row === 'object' &&
        row !== null &&
        typeof (row as CustomCategoryRecord).id === 'string' &&
        (row as CustomCategoryRecord).id.startsWith('custom:') &&
        typeof (row as CustomCategoryRecord).label === 'string',
    );
  } catch {
    return [];
  }
}

function writeCustomRaw(rows: CustomCategoryRecord[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new CustomEvent(SONG_CATEGORIES_CHANGED));
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

export function getCustomCategories(): CustomCategoryRecord[] {
  return readCustomRaw();
}

export function getAllCategoryDefs(): SongCategoryDef[] {
  const custom = readCustomRaw().map(
    (row): SongCategoryDef => ({
      id: row.id,
      label: row.label,
      shortLabel: row.label.length > 6 ? `${row.label.slice(0, 5)}…` : row.label,
      description: '사용자 추가 카테고리',
      builtin: false,
      accent: CUSTOM_ACCENT,
    }),
  );
  return [...BUILTIN_CATEGORY_DEFS, ...custom];
}

export function findCategoryDef(
  categoryId: SongCategory,
): SongCategoryDef | undefined {
  return getAllCategoryDefs().find((d) => d.id === categoryId);
}

export function getKnownCategoryIds(): Set<string> {
  return new Set(getAllCategoryDefs().map((d) => d.id));
}

export function addCustomCategory(label: string): {
  ok: true;
  category: CustomCategoryRecord;
} | { ok: false; message: string } {
  const trimmed = label.trim();
  if (!trimmed) {
    return { ok: false, message: '카테고리 이름을 입력하세요.' };
  }
  if (trimmed.length > 24) {
    return { ok: false, message: '이름은 24자 이하로 입력하세요.' };
  }

  const slug = slugifyCategoryLabel(trimmed);
  if (!slug) {
    return { ok: false, message: '사용할 수 없는 이름입니다.' };
  }

  const id = `custom:${slug}` as `custom:${string}`;
  const builtins = BUILTIN_CATEGORY_DEFS.map((d) => d.label);
  if (builtins.includes(trimmed)) {
    return { ok: false, message: '기본 장르와 같은 이름은 사용할 수 없습니다.' };
  }

  const existing = readCustomRaw();
  if (existing.some((r) => r.id === id || r.label === trimmed)) {
    return { ok: false, message: '이미 있는 카테고리입니다.' };
  }

  const row: CustomCategoryRecord = {
    id,
    label: trimmed,
    createdAt: new Date().toISOString(),
  };
  writeCustomRaw([...existing, row]);
  return { ok: true, category: row };
}

export function updateCustomCategory(
  id: `custom:${string}`,
  label: string,
): { ok: true } | { ok: false; message: string } {
  const trimmed = label.trim();
  if (!trimmed) {
    return { ok: false, message: '카테고리 이름을 입력하세요.' };
  }
  if (trimmed.length > 24) {
    return { ok: false, message: '이름은 24자 이하로 입력하세요.' };
  }

  const existing = readCustomRaw();
  const index = existing.findIndex((row) => row.id === id);
  if (index < 0) {
    return { ok: false, message: '카테고리를 찾을 수 없습니다.' };
  }

  const builtins = BUILTIN_CATEGORY_DEFS.map((d) => d.label);
  if (builtins.includes(trimmed)) {
    return { ok: false, message: '기본 장르와 같은 이름은 사용할 수 없습니다.' };
  }

  if (existing.some((row) => row.id !== id && row.label === trimmed)) {
    return { ok: false, message: '이미 있는 카테고리입니다.' };
  }

  const next = [...existing];
  next[index] = { ...next[index], label: trimmed };
  writeCustomRaw(next);
  return { ok: true };
}

export function removeCustomCategory(id: `custom:${string}`): void {
  writeCustomRaw(readCustomRaw().filter((r) => r.id !== id));
}
