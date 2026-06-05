import { normalizeSongCategory } from './songCategory';
import type {
  AnalyzeCandidates,
  AnalyzeJobQueued,
  AnalyzeLibraryHit,
  AnalyzeResponse,
  SlideMapEntry,
  SongBuildGroup,
  SongBuildMode,
  SongBuildResponse,
  SongDetail,
  SongJobResponse,
  SongParsed,
  SongSection,
} from './types';

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

export function normalizeSections(raw: unknown): SongSection[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const s = item as Record<string, unknown>;
    return {
      type: (s.type as SongSection['type']) ?? 'unknown',
      label: asString(s.label) ?? '',
      lines: Array.isArray(s.lines)
        ? s.lines.map((l) => String(l))
        : [],
    };
  });
}

export function normalizeSongDetail(raw: Record<string, unknown>): SongDetail {
  const tags = Array.isArray(raw.tags) ? raw.tags.map((t) => String(t)) : [];
  return {
    songId: asString(raw.songId) ?? '',
    title: asString(raw.title) ?? '',
    artist: raw.artist === null ? null : (asString(raw.artist) ?? null),
    category: normalizeSongCategory(raw.category ?? raw.genre, tags),
    tags,
    sections: normalizeSections(raw.sections),
    createdAt: asString(raw.createdAt) ?? '',
    updatedAt: asString(raw.updatedAt) ?? '',
  };
}

export function normalizeParsed(raw: unknown): SongParsed | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const p = raw as Record<string, unknown>;
  return {
    song_title: asString(p.songTitle ?? p.song_title) ?? '',
    sections: normalizeSections(p.sections),
    warnings: Array.isArray(p.warnings)
      ? p.warnings.map((w) => String(w))
      : [],
  };
}

export function parseAnalyzeResponse(data: Record<string, unknown>): AnalyzeResponse {
  if (data.source === 'library') {
    return {
      source: 'library',
      songId: asString(data.songId) ?? '',
      title: asString(data.title) ?? '',
      sections: normalizeSections(data.sections),
      schemaVersion: asString(data.schemaVersion) ?? 'song-sections/v1',
    } satisfies AnalyzeLibraryHit;
  }

  if (data.source === 'library_candidates') {
    const candidates = Array.isArray(data.candidates)
      ? data.candidates.map((c) => {
          const row = c as Record<string, unknown>;
          return {
            songId: asString(row.songId) ?? '',
            title: asString(row.title) ?? '',
            sectionCount: asNumber(row.sectionCount) ?? 0,
            updatedAt: asString(row.updatedAt) ?? '',
          };
        })
      : [];
    return {
      source: 'library_candidates',
      query: asString(data.query) ?? '',
      candidates,
    } satisfies AnalyzeCandidates;
  }

  const jobId = asString(data.jobId);
  if (jobId) {
    return {
      jobId,
      status: 'queued',
      kind: 'song_analyze',
      pollUrl: asString(data.pollUrl) ?? `/api/v1/song/jobs/${jobId}`,
    } satisfies AnalyzeJobQueued;
  }

  throw new Error('알 수 없는 분석 응답 형식입니다.');
}

export function normalizeSongJob(raw: Record<string, unknown>): SongJobResponse {
  const status = asString(raw.status) ?? 'queued';
  return {
    jobId: asString(raw.jobId ?? raw.id),
    status,
    parsed: normalizeParsed(raw.parsed),
    error: asString(raw.error),
    errorCode: asString(raw.errorCode ?? raw.error_code),
    songId: asString(raw.songId),
    libraryAction: raw.libraryAction as SongJobResponse['libraryAction'],
    songTitle: asString(raw.songTitle),
  };
}

export function normalizeBuildResponse(
  raw: Record<string, unknown>,
): SongBuildResponse {
  const slideMapRaw = (raw.slideMap ?? raw.slide_map) as unknown;
  const slide_map = Array.isArray(slideMapRaw)
    ? (slideMapRaw as SlideMapEntry[])
    : [];

  const groupsRaw = raw.groups;
  const groups = Array.isArray(groupsRaw)
    ? (groupsRaw as SongBuildGroup[])
    : [];

  return {
    ok: asBoolean(raw.ok),
    song_title:
      asString(raw.songTitle ?? raw.song_title) ?? '',
    sourceSongId: asString(raw.sourceSongId ?? raw.source_song_id),
    build_mode: (asString(raw.buildMode ?? raw.build_mode) ??
      'replace') as SongBuildMode,
    slide_map,
    groups,
    section_results: (raw.sectionResults ?? raw.section_results ?? []) as unknown[],
    total_slide_count:
      asNumber(raw.totalSlideCount ?? raw.total_slide_count) ??
      slide_map.length,
    message: asString(raw.message),
  };
}
