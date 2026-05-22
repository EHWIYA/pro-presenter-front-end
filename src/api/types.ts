export interface Venue {
  id: string;
  name: string;
  description?: string;
}

export interface VenueProbe {
  venue_id: string;
  online: boolean;
  agent_reachable: boolean;
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

export interface ApiErrorBody {
  detail?: string;
  message?: string;
}
