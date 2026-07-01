import { ApiError, apiFetch, isMockMode } from './client';
import { mockFetchVenues, mockProbeVenue } from './mock';
import type {
  Venue,
  VenueProbe,
  VenueProbeApiResponse,
  VenueStatus,
} from './types';

/** venue별 probe — dev-pc 등 느린 PC가 배치 /venues/status wall 15s에 끌지 않도록 */
const PROBE_TIMEOUT_MS = 18_000;

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

function normalizeVenueProbe(data: VenueProbeApiResponse): VenueProbe {
  const reachable =
    data.agent_reachable ?? data.ok ?? data.online ?? false;
  const fallbackMessage =
    data.message ??
    data.hint ??
    (data.status_code != null ? String(data.status_code) : undefined) ??
    (data.url ? data.url : undefined);

  return {
    venue_id: data.venue_id,
    online: data.online ?? data.connected ?? reachable,
    agent_reachable: reachable,
    agent_status_code: toStringOrUndefined(data.agent_status_code),
    agent_message: toStringOrUndefined(data.agent_message),
    agent_health_url: toStringOrUndefined(data.agent_health_url),
    message: fallbackMessage,
  };
}

function probeResponseToVenueStatus(data: VenueProbeApiResponse): VenueStatus {
  const agentReachable =
    data.agent_reachable ?? data.ok ?? data.online ?? false;
  const connected = data.connected ?? agentReachable;

  return {
    venue_id: data.venue_id,
    connected: toBool(connected),
    agent_reachable:
      data.agent_reachable == null ? undefined : toBool(data.agent_reachable),
    agent_status_code: toStringOrUndefined(data.agent_status_code),
    agent_message: toStringOrUndefined(data.agent_message),
    agent_health_url: toStringOrUndefined(data.agent_health_url),
    status_code: toNumber(data.http_status),
    message: toStringOrUndefined(data.message),
    checked_at: toStringOrUndefined(data.checked_at),
  };
}

function offlineVenueStatus(venueId: string, message: string): VenueStatus {
  return {
    venue_id: venueId,
    connected: false,
    agent_reachable: false,
    agent_status_code: 'unreachable',
    message,
    checked_at: new Date().toISOString(),
  };
}

function probeFailureMessage(reason: unknown): string {
  if (reason instanceof ApiError) return reason.message;
  if (reason instanceof Error) return reason.message;
  return '연결 상태를 확인하지 못했습니다';
}

async function fetchVenueProbeRaw(venueId: string): Promise<VenueProbeApiResponse> {
  return apiFetch<VenueProbeApiResponse>(
    `/venues/${encodeURIComponent(venueId)}/probe`,
  );
}

async function probeVenueStatus(venueId: string): Promise<VenueStatus> {
  const data = await fetchVenueProbeRaw(venueId);
  return probeResponseToVenueStatus(data);
}

async function probeVenueStatusSafe(venueId: string): Promise<VenueStatus> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      probeVenueStatus(venueId),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error('점검 시간 초과')),
          PROBE_TIMEOUT_MS,
        );
      }),
    ]);
    return result;
  } catch (reason) {
    return offlineVenueStatus(venueId, probeFailureMessage(reason));
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function mockProbeVenueStatus(venueId: string): Promise<VenueStatus> {
  const probe = await mockProbeVenue(venueId);
  const checkedAt = new Date().toISOString();
  const connected =
    probe.agent_reachable &&
    venueId !== 'main-hall' &&
    venueId !== 'hcc-pre' &&
    venueId !== 'offline-demo';

  return {
    venue_id: venueId,
    connected,
    agent_reachable: probe.agent_reachable,
    agent_status_code: connected ? 'ok' : 'timeout',
    agent_message: probe.agent_message,
    agent_health_url: probe.agent_health_url,
    status_code: connected ? 200 : 504,
    message: connected ? 'connected' : 'timeout',
    checked_at: checkedAt,
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
  const data = await fetchVenueProbeRaw(venueId);
  return normalizeVenueProbe(data);
}

export async function fetchVenueStatuses(): Promise<VenueStatus[]> {
  const venues = await fetchVenues();
  if (venues.length === 0) return [];

  if (isMockMode()) {
    return Promise.all(venues.map((venue) => mockProbeVenueStatus(venue.id)));
  }

  const results = await Promise.allSettled(
    venues.map((venue) => probeVenueStatusSafe(venue.id)),
  );

  return results.map((result, index) => {
    const venueId = venues[index].id;
    if (result.status === 'fulfilled') return result.value;
    return offlineVenueStatus(venueId, probeFailureMessage(result.reason));
  });
}
