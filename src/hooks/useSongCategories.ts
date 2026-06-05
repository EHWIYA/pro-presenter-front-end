import { useCallback, useEffect, useState } from 'react';
import type { SongCategory } from '@/api';
import {
  addCustomCategory,
  getAllCategoryDefs,
  removeCustomCategory,
  updateCustomCategory,
  SONG_CATEGORIES_CHANGED,
  type CustomCategoryRecord,
  type SongCategoryDef,
} from '@/lib/songCategoryStore';

export function useSongCategories() {
  const [defs, setDefs] = useState<SongCategoryDef[]>(() => getAllCategoryDefs());

  const refresh = useCallback(() => {
    setDefs(getAllCategoryDefs());
  }, []);

  useEffect(() => {
    const onChange = () => refresh();
    window.addEventListener(SONG_CATEGORIES_CHANGED, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(SONG_CATEGORIES_CHANGED, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, [refresh]);

  const addCategory = useCallback(
    (label: string) => {
      const result = addCustomCategory(label);
      if (result.ok) {
        refresh();
      }
      return result;
    },
    [refresh],
  );

  const updateCategory = useCallback(
    (id: `custom:${string}`, label: string) => {
      const result = updateCustomCategory(id, label);
      if (result.ok) {
        refresh();
      }
      return result;
    },
    [refresh],
  );

  const removeCategory = useCallback(
    (id: `custom:${string}`) => {
      removeCustomCategory(id);
      refresh();
    },
    [refresh],
  );

  const customCategories = defs.filter((d) => !d.builtin);

  return {
    defs,
    customCategories,
    addCategory,
    updateCategory,
    removeCategory,
    refresh,
  };
}

export type { SongCategoryDef, CustomCategoryRecord, SongCategory };
