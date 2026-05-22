import { useQuery } from '@tanstack/react-query';
import { fetchVenues } from '@/api';
import { queryKeys } from '@/lib/queryKeys';

export function useVenues() {
  return useQuery({
    queryKey: queryKeys.venues,
    queryFn: fetchVenues,
    staleTime: 60_000,
  });
}
