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
  venue_id: string;
  slide_map: SlideMapEntry[];
}

export interface WorshipTriggerRequest {
  index: number;
}

export interface WorshipTriggerResponse {
  venue_id: string;
  index: number;
  ok: boolean;
  message?: string;
}

export interface ApiErrorBody {
  detail?: string;
  message?: string;
}
