import { apiFetch, isMockMode } from './client';
import { mockFetchVenueStatuses, mockFetchVenues, mockProbeVenue } from './mock';
import type {
  Venue,
  VenueProbe,
  VenueProbeApiResponse,
  VenueStatus,
  VenueStatusResponse,
} from './types';

function normalizeVenueProbe(data: VenueProbeApiResponse): VenueProbe {
  const reachable =
    data.agent_reachable ?? data.ok ?? data.online ?? false;
  const fallbackMessage =
    data.message ??
    data.hint ??
    (data.status_code != null ? `HTTP ${data.status_code}` : undefined) ??
    (data.url ? data.url : undefined);

  return {
    venue_id: data.venue_id,
    online: data.online ?? reachable,
    agent_reachable: reachable,
    agent_status_code: toStringOrUndefined(data.agent_status_code),
    agent_message: toStringOrUndefined(data.agent_message),
    agent_health_url: toStringOrUndefined(data.agent_health_url),
    message: fallbackMessage,
  };
}

/** pro-api: `{ venues: Venue[] }` · 레거시/목: 배열만 */
type VenuesApiResponse = Venue[] | { venues: Venue[] };

function normalizeVenuesList(data: VenuesApiResponse): Venue[] {
  if (Array.isArray(data)) return data;
  return Array.isArray(data.venues) ? data.venues : [];
}

export async function fetchVenues(): Promise<Venue[]> {
  if (isMockMode()) {
    return mockFetchVenues();
  }
  const data = await apiFetch<VenuesApiResponse>('/venues');
  return normalizeVenuesList(data);
}

export async function probeVenue(venueId: string): Promise<VenueProbe> {
  if (isMockMode()) {
    return mockProbeVenue(venueId);
  }
  const data = await apiFetch<VenueProbeApiResponse>(
    `/venues/${encodeURIComponent(venueId)}/probe`,
  );
  return normalizeVenueProbe(data);
}

type VenueStatusApiResponse =
  | VenueStatus[]
  | VenueStatusResponse
  | { venues: VenueStatus[] }
  | Record<string, unknown>;

function toBool(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'connected';
  }
  return false;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function toStringOrUndefined(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function normalizeStatusItem(raw: unknown): VenueStatus | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;

  const venueId =
    toStringOrUndefined(item.venue_id) ??
    toStringOrUndefined(item.venueId) ??
    toStringOrUndefined(item.id);
  if (!venueId) return null;

  return {
    venue_id: venueId,
    connected: toBool(item.connected) || toBool(item.online),
    agent_reachable:
      item.agent_reachable == null ? undefined : toBool(item.agent_reachable),
    agent_status_code: toStringOrUndefined(item.agent_status_code),
    agent_message: toStringOrUndefined(item.agent_message),
    agent_health_url: toStringOrUndefined(item.agent_health_url),
    status_code: toNumber(item.status_code ?? item.statusCode ?? item.code),
    message: toStringOrUndefined(item.message ?? item.detail),
    checked_at: toStringOrUndefined(item.checked_at ?? item.checkedAt ?? item.timestamp),
  };
}

function normalizeVenueStatuses(data: VenueStatusApiResponse): VenueStatus[] {
  const list = Array.isArray(data)
    ? data
    : Array.isArray((data as { statuses?: unknown }).statuses)
      ? ((data as { statuses: unknown[] }).statuses ?? [])
      : Array.isArray((data as { venues?: unknown }).venues)
        ? ((data as { venues: unknown[] }).venues ?? [])
        : [];

  return list
    .map((item) => normalizeStatusItem(item))
    .filter((item): item is VenueStatus => item !== null);
}

export async function fetchVenueStatuses(): Promise<VenueStatus[]> {
  if (isMockMode()) {
    const mock = await mockFetchVenueStatuses();
    return normalizeVenueStatuses(mock);
  }

  const data = await apiFetch<VenueStatusApiResponse>('/venues/status');
  return normalizeVenueStatuses(data);
}
