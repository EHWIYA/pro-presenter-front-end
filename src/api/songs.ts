import { apiFetch, isMockMode } from './client';
import { normalizeSongDetail } from './normalize';
import {
  mockCreateSong,
  mockFetchSong,
  mockFetchSongs,
  mockUpdateSongSections,
} from './mock';
import type {
  CreateSongRequest,
  SongDetail,
  SongListResponse,
  SongSection,
  UpdateSongSectionsRequest,
} from './types';

export interface FetchSongsParams {
  q?: string;
  limit?: number;
  offset?: number;
}

export async function fetchSongs(
  params: FetchSongsParams = {},
): Promise<SongListResponse> {
  const { q = '', limit = 20, offset = 0 } = params;
  if (isMockMode()) {
    return mockFetchSongs(q, limit, offset);
  }
  const search = new URLSearchParams();
  if (q) search.set('q', q);
  search.set('limit', String(limit));
  search.set('offset', String(offset));
  return apiFetch<SongListResponse>(`/api/v1/songs?${search.toString()}`);
}

export async function fetchSong(songId: string): Promise<SongDetail> {
  if (isMockMode()) {
    return mockFetchSong(songId);
  }
  const raw = await apiFetch<Record<string, unknown>>(
    `/api/v1/songs/${encodeURIComponent(songId)}`,
  );
  return normalizeSongDetail(raw);
}

export async function createSong(body: CreateSongRequest): Promise<SongDetail> {
  if (isMockMode()) {
    return mockCreateSong(body);
  }
  return apiFetch<SongDetail>('/api/v1/songs', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateSongSections(
  songId: string,
  sections: SongSection[],
  title?: string,
): Promise<void> {
  const body: UpdateSongSectionsRequest = { sections, ...(title ? { title } : {}) };
  if (isMockMode()) {
    await mockUpdateSongSections(songId, sections, title);
    return;
  }
  await apiFetch<void>(
    `/api/v1/songs/${encodeURIComponent(songId)}/sections`,
    {
      method: 'PUT',
      body: JSON.stringify(body),
    },
  );
}
