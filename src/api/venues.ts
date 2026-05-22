import { apiFetch, isMockMode } from './client';
import { mockFetchVenues, mockProbeVenue } from './mock';
import type { Venue, VenueProbe } from './types';

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
  return apiFetch<VenueProbe>(`/venues/${encodeURIComponent(venueId)}/probe`);
}
