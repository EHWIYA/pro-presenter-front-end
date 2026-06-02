import { useQuery } from '@tanstack/react-query';
import { fetchCurrentPresentation } from '@/api';
import { queryKeys } from '@/lib/queryKeys';

export function useCurrentPresentation(venueId: string | null) {
  return useQuery({
    queryKey: venueId
      ? queryKeys.currentPresentation(venueId)
      : ['venues', 'current-presentation', 'none'],
    queryFn: () => {
      if (!venueId) throw new Error('venueId required');
      return fetchCurrentPresentation(venueId);
    },
    enabled: Boolean(venueId),
    staleTime: 5_000,
    refetchInterval: 8_000,
  });
}
