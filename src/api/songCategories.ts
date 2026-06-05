import { ApiError, apiFetch, isMockMode } from './client';
import { formatApiErrorMessage } from './songAnalyzeError';
import {
  mockCreateSongCategory,
  mockDeleteSongCategory,
  mockFetchSongCategories,
  mockUpdateSongCategory,
} from './mock';
import type {
  ApiErrorBody,
  DeleteSongCategoryResponse,
  SongCategoriesResponse,
  SongCategoryRecord,
} from './types';

function formatSongCategoryError(
  body: ApiErrorBody | undefined,
  fallback: string,
): string {
  if (
    body &&
    typeof body === 'object' &&
    'detail' in body &&
    body.detail === 'category_in_use'
  ) {
    const row = body as ApiErrorBody & { songCount?: number; message?: string };
    if (typeof row.songCount === 'number') {
      return `이 카테고리를 사용하는 곡이 ${row.songCount}곡 있습니다.`;
    }
    if (row.message?.trim()) return row.message.trim();
    return '이 카테고리를 사용하는 곡이 있습니다.';
  }
  return formatApiErrorMessage(body, fallback);
}

async function categoryFetch<T>(
  path: string,
  init: RequestInit | undefined,
  fallback: string,
): Promise<T> {
  if (isMockMode()) {
    throw new Error('mock should not call categoryFetch');
  }
  try {
    return await apiFetch<T>(path, init);
  } catch (err) {
    if (err instanceof ApiError) {
      throw new ApiError(
        err.status,
        formatSongCategoryError(err.body, err.message || fallback),
        err.body,
      );
    }
    throw err;
  }
}

export async function fetchSongCategories(): Promise<SongCategoriesResponse> {
  if (isMockMode()) {
    return mockFetchSongCategories();
  }
  return categoryFetch<SongCategoriesResponse>(
    '/api/v1/song-categories',
    undefined,
    '카테고리 목록을 불러오지 못했습니다.',
  );
}

export async function createSongCategory(body: {
  label: string;
}): Promise<SongCategoryRecord> {
  if (isMockMode()) {
    return mockCreateSongCategory(body.label);
  }
  return categoryFetch<SongCategoryRecord>(
    '/api/v1/song-categories',
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    '카테고리를 추가하지 못했습니다.',
  );
}

export async function updateSongCategory(
  id: `custom:${string}`,
  body: { label: string },
): Promise<SongCategoryRecord> {
  if (isMockMode()) {
    return mockUpdateSongCategory(id, body.label);
  }
  return categoryFetch<SongCategoryRecord>(
    `/api/v1/song-categories/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
    '카테고리를 수정하지 못했습니다.',
  );
}

export async function deleteSongCategory(
  id: `custom:${string}`,
): Promise<DeleteSongCategoryResponse> {
  if (isMockMode()) {
    return mockDeleteSongCategory(id);
  }
  return categoryFetch<DeleteSongCategoryResponse>(
    `/api/v1/song-categories/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
    '카테고리를 삭제하지 못했습니다.',
  );
}
