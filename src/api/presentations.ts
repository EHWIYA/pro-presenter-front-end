import { apiFetch, isMockMode } from './client';
import { mockFetchVenuePresentations } from './mock';
import type { VenuePresentationsResponse } from './types';

/**
 * 현장 ProPresenter 보유 프레젠테이션·그룹 목록.
 * 운영 API (백엔드 협의 예정): GET /venues/{venue_id}/presentations
 */
export async function fetchVenuePresentations(
  venueId: string,
): Promise<VenuePresentationsResponse> {
  if (isMockMode()) {
    return mockFetchVenuePresentations(venueId);
  }
  return apiFetch<VenuePresentationsResponse>(
    `/venues/${encodeURIComponent(venueId)}/presentations`,
  );
}
