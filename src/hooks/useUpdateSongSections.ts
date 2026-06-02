import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSongSections } from '@/api';
import type { SongSection } from '@/api';
import { queryKeys } from '@/lib/queryKeys';

export function useUpdateSongSections() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      songId,
      sections,
    }: {
      songId: string;
      sections: SongSection[];
    }) => updateSongSections(songId, sections),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.song(variables.songId),
      });
      void queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
}
