import { useQueryClient } from '@tanstack/react-query';
import type { WorshipBuildResponse } from '@/api';
import { queryKeys } from '@/lib/queryKeys';

export function useWorshipBuildCache(venueId: string | null, text: string) {
  const queryClient = useQueryClient();

  if (!venueId) return undefined;

  return queryClient.getQueryData<WorshipBuildResponse>(
    queryKeys.worshipBuild(venueId, text),
  );
}
