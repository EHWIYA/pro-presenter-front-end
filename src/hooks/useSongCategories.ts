import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import {
  ApiError,
  createSongCategory,
  deleteSongCategory,
  fetchSongCategories,
  updateSongCategory,
} from '@/api';
import type { SongCategory } from '@/api';
import { migrateLegacySongCategories } from '@/lib/migrateSongCategories';
import { queryKeys } from '@/lib/queryKeys';
import {
  buildCategoryDefs,
  setCachedCustomCategories,
  validateCategoryLabel,
  type CustomCategoryRecord,
  type SongCategoryDef,
} from '@/lib/songCategoryStore';

type MutationResult =
  | { ok: true }
  | { ok: false; message: string };

function toMutationError(err: unknown, fallback: string): MutationResult {
  if (err instanceof ApiError) {
    return { ok: false, message: err.message };
  }
  if (err instanceof Error && err.message) {
    return { ok: false, message: err.message };
  }
  return { ok: false, message: fallback };
}

export function useSongCategories() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.songCategories,
    queryFn: fetchSongCategories,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (!query.data) return;
    setCachedCustomCategories(query.data.custom);
    void migrateLegacySongCategories(query.data.custom).then((changed) => {
      if (changed) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.songCategories });
      }
    });
  }, [query.data, queryClient]);

  const defs = useMemo(
    () => buildCategoryDefs(query.data?.custom ?? []),
    [query.data?.custom],
  );

  const createMutation = useMutation({
    mutationFn: (label: string) => createSongCategory({ label }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.songCategories });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, label }: { id: `custom:${string}`; label: string }) =>
      updateSongCategory(id, { label }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.songCategories });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: `custom:${string}`) => deleteSongCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.songCategories });
    },
  });

  async function addCategory(label: string): Promise<
    | { ok: true; category: CustomCategoryRecord }
    | { ok: false; message: string }
  > {
    const validated = validateCategoryLabel(label);
    if (!validated.ok) {
      return { ok: false, message: validated.message };
    }
    try {
      const category = await createMutation.mutateAsync(validated.trimmed);
      return { ok: true, category };
    } catch (err) {
      if (err instanceof ApiError) {
        return { ok: false, message: err.message };
      }
      if (err instanceof Error && err.message) {
        return { ok: false, message: err.message };
      }
      return { ok: false, message: '카테고리를 추가하지 못했습니다.' };
    }
  }

  async function updateCategory(
    id: `custom:${string}`,
    label: string,
  ): Promise<MutationResult> {
    const validated = validateCategoryLabel(label);
    if (!validated.ok) {
      return { ok: false, message: validated.message };
    }
    try {
      await updateMutation.mutateAsync({ id, label: validated.trimmed });
      return { ok: true };
    } catch (err) {
      return toMutationError(err, '카테고리를 수정하지 못했습니다.');
    }
  }

  async function removeCategory(
    id: `custom:${string}`,
  ): Promise<MutationResult> {
    try {
      await deleteMutation.mutateAsync(id);
      return { ok: true };
    } catch (err) {
      return toMutationError(err, '카테고리를 삭제하지 못했습니다.');
    }
  }

  const customCategories = defs.filter((d) => !d.builtin);

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return {
    defs,
    customCategories,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isMutating,
    error: query.error,
    refetch: query.refetch,
    addCategory,
    updateCategory,
    removeCategory,
  };
}

export type { SongCategoryDef, CustomCategoryRecord, SongCategory };
