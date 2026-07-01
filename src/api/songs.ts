import { apiFetch, isMockMode } from './client';
import { normalizeSongDetail } from './normalize';
import {
  mockFetchLibrarySongSections,
  mockFetchSong,
  mockFetchSongs,
} from './mock';
import type {
  LibrarySongSectionsResponse,
  SongCategory,
  SongDetail,
  SongListResponse,
} from './types';

export interface FetchSongsParams {
  q?: string;
  category?: SongCategory;
  libraryCategory?: string;
  limit?: number;
  offset?: number;
}

export async function fetchSongs(
  params: FetchSongsParams = {},
): Promise<SongListResponse> {
  const { q = '', category, libraryCategory, limit = 20, offset = 0 } = params;
  if (isMockMode()) {
    return mockFetchSongs(q, limit, offset, category, libraryCategory);
  }
  const search = new URLSearchParams();
  if (q) search.set('q', q);
  if (category) search.set('category', category);
  if (libraryCategory) search.set('libraryCategory', libraryCategory);
  search.set('limit', String(limit));
  search.set('offset', String(offset));
  return apiFetch<SongListResponse>(`/api/v1/songs?${search.toString()}`);
}

export interface FetchSongOptions {
  venueId?: string;
}

export async function fetchSong(
  songId: string,
  options: FetchSongOptions = {},
): Promise<SongDetail> {
  if (isMockMode()) {
    return mockFetchSong(songId, options.venueId);
  }
  const search = new URLSearchParams();
  if (options.venueId) {
    search.set('venueId', options.venueId);
  }
  const qs = search.toString();
  const raw = await apiFetch<Record<string, unknown>>(
    `/api/v1/songs/${encodeURIComponent(songId)}${qs ? `?${qs}` : ''}`,
  );
  return normalizeSongDetail(raw);
}

export async function fetchLibrarySongSections(
  venueId: string,
  songId: string,
): Promise<LibrarySongSectionsResponse> {
  if (isMockMode()) {
    return mockFetchLibrarySongSections(venueId, songId);
  }
  return apiFetch<LibrarySongSectionsResponse>(
    `/api/v1/venues/${encodeURIComponent(venueId)}/library/songs/${encodeURIComponent(songId)}/sections`,
  );
}
