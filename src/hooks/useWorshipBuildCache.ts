import { useQueryClient } from '@tanstack/react-query';
import type { WorshipBuildResponse } from '@/api';
import { queryKeys } from '@/lib/queryKeys';

export function useWorshipBuildCache(
  venueId: string | null,
  reference: string,
  presentationFilename: string,
) {
  const queryClient = useQueryClient();

  if (!venueId || !reference.trim()) return undefined;

  return queryClient.getQueryData<WorshipBuildResponse>(
    queryKeys.worshipBuild(venueId, reference, presentationFilename),
  );
}
