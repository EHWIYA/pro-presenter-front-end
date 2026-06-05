import type { SongCategory } from '@/api';
import {
  isBuiltinSongCategory,
  isCustomSongCategoryId,
  isSongCategory,
  normalizeSongCategory,
} from '@/api/songCategory';
import { findCategoryDef } from '@/lib/songCategoryStore';

export {
  isBuiltinSongCategory,
  isCustomSongCategoryId,
  isSongCategory,
  normalizeSongCategory,
};

export function songCategoryLabel(category: SongCategory): string {
  return findCategoryDef(category)?.label ?? category;
}

export function songCategoryShortLabel(category: SongCategory): string {
  return findCategoryDef(category)?.shortLabel ?? category;
}

export function songCategoryAccent(category: SongCategory): string {
  return findCategoryDef(category)?.accent ?? '#6b7b8c';
}
