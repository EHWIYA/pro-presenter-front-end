import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteSong } from '@/api';
import { queryKeys } from '@/lib/queryKeys';

export function useDeleteSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songId: string) => deleteSong(songId),
    onSuccess: (_data, songId) => {
      queryClient.removeQueries({ queryKey: queryKeys.song(songId) });
      void queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
}
