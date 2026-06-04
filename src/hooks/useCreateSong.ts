import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSong } from '@/api';
import type { CreateSongRequest } from '@/api';
import { queryKeys } from '@/lib/queryKeys';

export function useCreateSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateSongRequest) => createSong(body),
    onSuccess: (detail) => {
      void queryClient.invalidateQueries({ queryKey: ['songs'] });
      void queryClient.setQueryData(queryKeys.song(detail.songId), detail);
    },
  });
}
