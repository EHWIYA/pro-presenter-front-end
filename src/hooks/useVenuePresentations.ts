import { useQuery } from '@tanstack/react-query';
import { fetchVenuePresentations } from '@/api';
import { queryKeys } from '@/lib/queryKeys';

export function useVenuePresentations(venueId: string | null) {
  return useQuery({
    queryKey: venueId
      ? queryKeys.venuePresentations(venueId)
      : ['venues', 'presentations', 'none'],
    queryFn: () => {
      if (!venueId) throw new Error('venueId required');
      return fetchVenuePresentations(venueId);
    },
    enabled: Boolean(venueId),
    staleTime: 60_000,
  });
}
