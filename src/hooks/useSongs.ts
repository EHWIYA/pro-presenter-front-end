import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetchSong, fetchSongs } from '@/api';
import { queryKeys } from '@/lib/queryKeys';

const DEBOUNCE_MS = 300;

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export function useSongs(query: string) {
  const debouncedQ = useDebouncedValue(query, DEBOUNCE_MS);

  return useQuery({
    queryKey: queryKeys.songs({ q: debouncedQ, limit: 20, offset: 0 }),
    queryFn: () => fetchSongs({ q: debouncedQ, limit: 20, offset: 0 }),
  });
}

export function useSongDetail(songId: string | null) {
  return useQuery({
    queryKey: songId ? queryKeys.song(songId) : ['song', 'none'],
    queryFn: () => {
      if (!songId) throw new Error('songId required');
      return fetchSong(songId);
    },
    enabled: Boolean(songId),
  });
}
