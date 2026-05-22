import { apiFetch, isMockMode } from './client';
import { mockFetchVenues, mockProbeVenue } from './mock';
import type { Venue, VenueProbe } from './types';

export async function fetchVenues(): Promise<Venue[]> {
  if (isMockMode()) {
    return mockFetchVenues();
  }
  return apiFetch<Venue[]>('/venues');
}

export async function probeVenue(venueId: string): Promise<VenueProbe> {
  if (isMockMode()) {
    return mockProbeVenue(venueId);
  }
  return apiFetch<VenueProbe>(`/venues/${encodeURIComponent(venueId)}/probe`);
}
