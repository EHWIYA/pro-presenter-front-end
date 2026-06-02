import { apiFetch, isMockMode } from './client';
import { mockFetchCurrentPresentation, mockFetchVenuePresentations } from './mock';
import type { CurrentPresentationPreview, VenuePresentationsResponse } from './types';

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

type CurrentPresentationApiResponse = {
  label?: string;
  index?: number;
  preview_text?: string;
  presentation_label?: string;
  current_index?: number;
  preview?: string;
  text?: string;
  current?: {
    label?: string;
    index?: number;
    preview_text?: string;
    preview?: string;
    text?: string;
  };
  presentation?: {
    label?: string;
    index?: number;
    preview_text?: string;
    preview?: string;
    text?: string;
  };
};

function asText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function normalizeCurrentPresentation(
  data: CurrentPresentationApiResponse,
): CurrentPresentationPreview {
  const nested = data.current ?? data.presentation;
  return {
    label:
      asText(data.label) ??
      asText(data.presentation_label) ??
      asText(nested?.label),
    index:
      asNumber(data.index) ??
      asNumber(data.current_index) ??
      asNumber(nested?.index),
    preview_text:
      asText(data.preview_text) ??
      asText(data.preview) ??
      asText(data.text) ??
      asText(nested?.preview_text) ??
      asText(nested?.preview) ??
      asText(nested?.text),
  };
}

export async function fetchCurrentPresentation(
  venueId: string,
): Promise<CurrentPresentationPreview> {
  if (isMockMode()) {
    return mockFetchCurrentPresentation(venueId);
  }

  const data = await apiFetch<CurrentPresentationApiResponse>(
    `/venues/${encodeURIComponent(venueId)}/presentation/current`,
  );
  return normalizeCurrentPresentation(data);
}
