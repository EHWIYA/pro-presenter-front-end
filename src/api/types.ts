export interface Venue {
  id: string;
  name: string;
  description?: string;
}

/** UI·훅용 정규화 결과 */
export interface VenueProbe {
  venue_id: string;
  online: boolean;
  agent_reachable: boolean;
  agent_status_code?: string;
  agent_message?: string;
  agent_health_url?: string;
  message?: string;
}

/** pro-api GET /venues/{id}/probe 원본 */
export interface VenueProbeApiResponse {
  venue_id: string;
  ok?: boolean;
  online?: boolean;
  agent_reachable?: boolean;
  agent_status_code?: string;
  agent_message?: string;
  agent_health_url?: string;
  url?: string;
  status_code?: number;
  hint?: string | null;
  message?: string;
}

/** GET /venues/status venue별 상태 요약 */
export interface VenueStatus {
  venue_id: string;
  connected: boolean;
  agent_reachable?: boolean;
  agent_status_code?: string;
  agent_message?: string;
  agent_health_url?: string;
  status_code?: number;
  message?: string;
  checked_at?: string;
}

export interface VenueStatusResponse {
  statuses: VenueStatus[];
}

export interface SlideMapEntry {
  index: number;
  label: string;
  preview?: string;
}

export interface WorshipBuildRequest {
  text: string;
}

export interface WorshipBuildResponse {
  ok: boolean;
  reference?: string;
  slide_count?: number;
  slide_map: SlideMapEntry[];
  message?: string;
}

export interface WorshipTriggerRequest {
  index: number;
}

export interface WorshipTriggerResponse {
  ok: boolean;
  message?: string;
  index?: number;
}

/** 프레젠테이션 내 그룹 요약 (라벨 + 슬라이드 수) */
export interface PresentationGroupSummary {
  label: string;
  slide_count: number;
}

/** 현장 PC가 보유한 프레젠테이션 요약 */
export interface PresentationSummary {
  id: string;
  label: string;
  group_count: number;
  slide_count: number;
  groups: PresentationGroupSummary[];
}

export interface VenuePresentationsResponse {
  venue_id: string;
  presentations: PresentationSummary[];
}

/** GET /venues/{id}/presentation/current (가용 필드 최소화) */
export interface CurrentPresentationPreview {
  label?: string;
  index?: number;
  preview_text?: string;
}

export interface ApiErrorBody {
  detail?: string;
  message?: string;
}

export type SongSectionType =
  | 'intro'
  | 'verse'
  | 'pre_chorus'
  | 'chorus'
  | 'bridge'
  | 'tag'
  | 'outro'
  | 'instrumental'
  | 'unknown';

export interface SongSection {
  type: SongSectionType;
  label: string;
  lines: string[];
}

export interface SongAnalyzeRequest {
  songTitle: string;
  imageBase64?: string;
  imageMimeType?: string;
  lyricsText?: string;
  forceReanalyze?: boolean;
  saveToLibrary?: boolean;
  librarySongId?: string | null;
  clientRef?: string;
}

export type AnalyzeLibraryHit = {
  source: 'library';
  songId: string;
  title: string;
  sections: SongSection[];
  schemaVersion: string;
};

export type AnalyzeCandidates = {
  source: 'library_candidates';
  query: string;
  candidates: Array<{
    songId: string;
    title: string;
    sectionCount: number;
    updatedAt: string;
  }>;
};

export type AnalyzeJobQueued = {
  jobId: string;
  status: 'queued';
  kind: 'song_analyze';
  pollUrl: string;
};

export type AnalyzeResponse =
  | AnalyzeLibraryHit
  | AnalyzeCandidates
  | AnalyzeJobQueued;

/** @deprecated AnalyzeJobQueued 사용 — 하위 호환 mock용 */
export interface SongAnalyzeResponse {
  jobId: string;
  status: string;
  pollUrl: string;
  kind: string;
}

export interface SongParsed {
  song_title: string;
  sections: SongSection[];
  warnings: string[];
}

export type LibraryAction = 'created' | 'updated' | 'skipped';

export interface SongJobResponse {
  jobId?: string;
  status: 'queued' | 'running' | 'finished' | 'error' | string;
  parsed?: SongParsed;
  error?: string;
  errorCode?: string;
  songId?: string;
  libraryAction?: LibraryAction;
  songTitle?: string;
}

export type SongBuildMode = 'append' | 'replace';

export interface SongBuildRequest {
  venueId: string;
  buildMode: SongBuildMode;
  songId?: string;
  songTitle?: string;
  sections?: SongSection[];
}

export interface SongBuildGroup {
  name: string;
  uuid: string;
  slide_count: number;
  first_index: number;
  color_hex: string;
}

export interface SongBuildResponse {
  ok: boolean;
  song_title: string;
  sourceSongId?: string;
  build_mode: SongBuildMode;
  slide_map: SlideMapEntry[];
  groups: SongBuildGroup[];
  section_results: unknown[];
  total_slide_count: number;
  message?: string;
}

export interface SongListItem {
  songId: string;
  title: string;
  artist: string | null;
  tags: string[];
  sectionCount: number;
  updatedAt: string;
}

export interface SongListResponse {
  items: SongListItem[];
  total: number;
}

export interface SongDetail {
  songId: string;
  title: string;
  artist: string | null;
  tags: string[];
  sections: SongSection[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSongSectionsRequest {
  sections: SongSection[];
}
