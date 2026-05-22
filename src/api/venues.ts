import { apiFetch, isMockMode } from './client';
import { mockFetchVenues, mockProbeVenue } from './mock';
import type { Venue, VenueProbe, VenueProbeApiResponse } from './types';

function normalizeVenueProbe(data: VenueProbeApiResponse): VenueProbe {
  const reachable =
    data.agent_reachable ?? data.ok ?? data.online ?? false;
  const message =
    data.message ??
    data.hint ??
    (data.status_code != null ? `HTTP ${data.status_code}` : undefined) ??
    (data.url ? data.url : undefined);

  return {
    venue_id: data.venue_id,
    online: data.online ?? reachable,
    agent_reachable: reachable,
    message,
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
