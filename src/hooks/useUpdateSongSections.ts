import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSongSections } from '@/api';
import type { SongCategory, SongSection } from '@/api';
import { queryKeys } from '@/lib/queryKeys';

export function useUpdateSongSections() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      songId,
      sections,
      title,
      category,
    }: {
      songId: string;
      sections: SongSection[];
      title?: string;
      category?: SongCategory;
    }) => updateSongSections(songId, sections, { title, category }),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.song(variables.songId),
      });
      void queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
}
