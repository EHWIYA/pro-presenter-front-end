import { ApiError, apiFetch, assertApiKeyConfigured, getApiBaseUrl, getApiKey, isMockMode } from './client';
import { formatSongAnalyzeError } from './songAnalyzeError';
import type { ApiErrorBody } from './types';
import {
  mockAnalyzeSong,
  mockBuildSong,
  mockGetSongJob,
} from './mock';
import {
  normalizeBuildResponse,
  normalizeSongJob,
  parseAnalyzeResponse,
} from './normalize';
import type {
  AnalyzeResponse,
  SongAnalyzeRequest,
  SongBuildRequest,
  SongBuildResponse,
  SongJobResponse,
} from './types';

export async function analyzeSong(
  body: SongAnalyzeRequest,
): Promise<AnalyzeResponse> {
  if (isMockMode()) {
    return mockAnalyzeSong(body);
  }

  assertApiKeyConfigured();
  const base = getApiBaseUrl();
  const url = `${base}/api/v1/song/analyze`;
  const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
  headers.set('Accept', 'application/json; charset=utf-8');
  const apiKey = getApiKey();
  if (apiKey) headers.set('X-API-Key', apiKey);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let body: ApiErrorBody | undefined;
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      body = undefined;
    }
    const message = formatSongAnalyzeError(body);
    throw new ApiError(response.status, message, body);
  }

  const data = (await response.json()) as Record<string, unknown>;
  return parseAnalyzeResponse(data);
}

export async function getSongJob(jobId: string): Promise<SongJobResponse> {
  if (isMockMode()) {
    return mockGetSongJob(jobId);
  }
  const raw = await apiFetch<Record<string, unknown>>(
    `/api/v1/song/jobs/${encodeURIComponent(jobId)}`,
  );
  return normalizeSongJob(raw);
}

export async function buildSong(
  body: SongBuildRequest,
): Promise<SongBuildResponse> {
  if (isMockMode()) {
    return mockBuildSong(body);
  }
  const raw = await apiFetch<Record<string, unknown>>(
    '/api/v1/worship/build-song',
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
  return normalizeBuildResponse(raw);
}
