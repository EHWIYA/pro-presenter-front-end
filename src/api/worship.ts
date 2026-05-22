import { apiFetch, isMockMode } from './client';
import { mockBuildWorship, mockTriggerSlide } from './mock';
import type {
  WorshipBuildRequest,
  WorshipBuildResponse,
  WorshipTriggerRequest,
  WorshipTriggerResponse,
} from './types';

export async function buildWorship(
  venueId: string,
  body: WorshipBuildRequest,
): Promise<WorshipBuildResponse> {
  if (isMockMode()) {
    return mockBuildWorship(venueId, body);
  }
  return apiFetch<WorshipBuildResponse>(
    `/venues/${encodeURIComponent(venueId)}/worship/build`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
}

export async function triggerSlide(
  venueId: string,
  body: WorshipTriggerRequest,
): Promise<WorshipTriggerResponse> {
  if (isMockMode()) {
    return mockTriggerSlide(venueId, body);
  }
  return apiFetch<WorshipTriggerResponse>(
    `/venues/${encodeURIComponent(venueId)}/worship/trigger`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
}
