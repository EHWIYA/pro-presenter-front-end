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
  message?: string;
}

/** pro-api GET /venues/{id}/probe 원본 */
export interface VenueProbeApiResponse {
  venue_id: string;
  ok?: boolean;
  online?: boolean;
  agent_reachable?: boolean;
  url?: string;
  status_code?: number;
  hint?: string | null;
  message?: string;
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
}

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

export interface SongJobResponse {
  jobId?: string;
  status: 'queued' | 'running' | 'finished' | 'error' | string;
  parsed?: SongParsed;
  error?: string;
  errorCode?: string;
}

export type SongBuildMode = 'append' | 'replace';

export interface SongBuildRequest {
  venueId: string;
  songTitle: string;
  buildMode: SongBuildMode;
  sections: SongSection[];
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
  build_mode: SongBuildMode;
  slide_map: SlideMapEntry[];
  groups: SongBuildGroup[];
  section_results: unknown[];
  total_slide_count: number;
  message?: string;
}
