import { apiFetch, isMockMode } from './client';
import {
  mockAnalyzeSong,
  mockBuildSong,
  mockGetSongJob,
} from './mock';
import type {
  SongAnalyzeRequest,
  SongAnalyzeResponse,
  SongBuildRequest,
  SongBuildResponse,
  SongJobResponse,
} from './types';

export async function analyzeSong(
  body: SongAnalyzeRequest,
): Promise<SongAnalyzeResponse> {
  if (isMockMode()) {
    return mockAnalyzeSong(body);
  }
  return apiFetch<SongAnalyzeResponse>('/api/v1/song/analyze', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getSongJob(jobId: string): Promise<SongJobResponse> {
  if (isMockMode()) {
    return mockGetSongJob(jobId);
  }
  return apiFetch<SongJobResponse>(
    `/api/v1/song/jobs/${encodeURIComponent(jobId)}`,
  );
}

export async function buildSong(
  body: SongBuildRequest,
): Promise<SongBuildResponse> {
  if (isMockMode()) {
    return mockBuildSong(body);
  }
  return apiFetch<SongBuildResponse>('/api/v1/worship/build-song', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
