import { apiFetch, isMockMode } from './client';
import { normalizeSongDetail } from './normalize';
import {
  mockCreateSong,
  mockDeleteSong,
  mockFetchSong,
  mockFetchSongs,
  mockUpdateSongSections,
} from './mock';
import type {
  CreateSongRequest,
  DeleteSongResponse,
  SongCategory,
  SongDetail,
  SongListResponse,
  SongSection,
  UpdateSongSectionsRequest,
} from './types';

export interface FetchSongsParams {
  q?: string;
  category?: SongCategory;
  limit?: number;
  offset?: number;
}

export async function fetchSongs(
  params: FetchSongsParams = {},
): Promise<SongListResponse> {
  const { q = '', category, limit = 20, offset = 0 } = params;
  if (isMockMode()) {
    return mockFetchSongs(q, limit, offset, category);
  }
  const search = new URLSearchParams();
  if (q) search.set('q', q);
  if (category) search.set('category', category);
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
  options?: { title?: string; category?: SongCategory },
): Promise<void> {
  const body: UpdateSongSectionsRequest = {
    sections,
    ...(options?.title ? { title: options.title } : {}),
    ...(options?.category ? { category: options.category } : {}),
  };
  if (isMockMode()) {
    await mockUpdateSongSections(songId, sections, options);
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

export async function deleteSong(songId: string): Promise<DeleteSongResponse> {
  if (isMockMode()) {
    return mockDeleteSong(songId);
  }
  return apiFetch<DeleteSongResponse>(
    `/api/v1/songs/${encodeURIComponent(songId)}`,
    { method: 'DELETE' },
  );
}
