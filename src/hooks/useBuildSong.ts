import { useMutation } from '@tanstack/react-query';
import { buildSong } from '@/api';
import type { SongBuildRequest } from '@/api';

export function useBuildSong() {
  return useMutation({
    mutationFn: (body: SongBuildRequest) => buildSong(body),
  });
}
