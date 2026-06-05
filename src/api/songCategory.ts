import type { BuiltinSongCategory, SongCategory } from './types';
import {
  BUILTIN_CATEGORY_IDS,
  getKnownCategoryIds,
} from '@/lib/songCategoryStore';

export { BUILTIN_CATEGORY_IDS as SONG_CATEGORY_VALUES };

const LEGACY_ID_MAP: Record<string, BuiltinSongCategory> = {
  chantsong: 'special',
  gospel: 'special',
  worship: 'special',
  contemporary: 'praise',
  other: 'praise',
};

const LEGACY_TAG_TO_CATEGORY: Record<string, BuiltinSongCategory> = {
  찬양: 'praise',
  성가: 'hymn',
  성가곡: 'hymn',
  특송: 'special',
  트송: 'special',
  복음: 'special',
  복음송: 'special',
  찬송: 'special',
  ccm: 'praise',
  CCM: 'praise',
};

export function isBuiltinSongCategory(
  value: string,
): value is BuiltinSongCategory {
  return (BUILTIN_CATEGORY_IDS as string[]).includes(value);
}

export function isCustomSongCategoryId(value: string): boolean {
  return /^custom:[a-z0-9가-힣-]+$/.test(value);
}

export function isSongCategory(value: string): value is SongCategory {
  if (isBuiltinSongCategory(value)) return true;
  if (isCustomSongCategoryId(value) && getKnownCategoryIds().has(value)) {
    return true;
  }
  return false;
}

export function normalizeSongCategory(
  raw: unknown,
  tags?: string[],
): SongCategory {
  if (typeof raw === 'string') {
    if (isSongCategory(raw)) return raw;
    if (isCustomSongCategoryId(raw)) return raw as SongCategory;
    const legacy = LEGACY_ID_MAP[raw];
    if (legacy) return legacy;
    if (isBuiltinSongCategory(raw)) return raw;
  }
  if (Array.isArray(tags)) {
    for (const tag of tags) {
      const mapped = LEGACY_TAG_TO_CATEGORY[tag.trim()];
      if (mapped) return mapped;
    }
  }
  return 'praise';
}
