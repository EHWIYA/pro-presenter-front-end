import { useQuery } from '@tanstack/react-query';
import { probeVenue } from '@/api';
import { queryKeys } from '@/lib/queryKeys';

export function useVenueProbe(venueId: string | null, enabled = true) {
  return useQuery({
    queryKey: venueId ? queryKeys.venueProbe(venueId) : ['venues', 'probe', 'none'],
    queryFn: () => {
      if (!venueId) throw new Error('venueId required');
      return probeVenue(venueId);
    },
    enabled: Boolean(venueId) && enabled,
    staleTime: 30_000,
    retry: 1,
  });
}
