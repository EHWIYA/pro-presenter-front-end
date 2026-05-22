import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buildWorship } from '@/api';
import type { WorshipBuildResponse } from '@/api';
import { queryKeys } from '@/lib/queryKeys';

export function useBuildWorship(venueId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => {
      if (!venueId) throw new Error('현장을 먼저 선택하세요');
      return buildWorship(venueId, { text });
    },
    onSuccess: (data: WorshipBuildResponse, text: string) => {
      if (venueId) {
        queryClient.setQueryData(
          queryKeys.worshipBuild(venueId, text),
          data,
        );
      }
    },
  });
}
