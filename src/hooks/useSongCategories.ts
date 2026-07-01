import { getAllCategoryDefs, type SongCategoryDef } from '@/lib/songCategoryStore';
import type { SongCategory } from '@/api';

export type { SongCategoryDef, SongCategory };

/** 내장 장르 정의만 반환 — song-categories API 제거됨 */
export function useSongCategories() {
  const defs = getAllCategoryDefs();

  return {
    defs,
    customCategories: [] as SongCategoryDef[],
    isLoading: false,
    isFetching: false,
    isMutating: false,
    error: null,
    refetch: async () => ({ data: undefined }),
  };
}
