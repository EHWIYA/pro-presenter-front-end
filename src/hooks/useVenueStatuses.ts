import { useQuery } from '@tanstack/react-query';
import { fetchVenueStatuses } from '@/api';
import { queryKeys } from '@/lib/queryKeys';

export function useVenueStatuses() {
  return useQuery({
    queryKey: queryKeys.venueStatuses,
    queryFn: fetchVenueStatuses,
    staleTime: 5_000,
    refetchInterval: 8_000,
  });
}
