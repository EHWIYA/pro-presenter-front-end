import { formatApiErrorMessage } from './songAnalyzeError';
import type { ApiErrorBody } from './types';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export function isMockMode(): boolean {
  return useMock;
}

export function getApiKey(): string | undefined {
  const key = import.meta.env.VITE_API_KEY?.trim();
  return key || undefined;
}

export function assertApiKeyConfigured(): void {
  if (useMock) return;
  if (!getApiKey()) {
    throw new Error(
      'VITE_API_KEY가 설정되지 않았습니다. NAS live/.env의 API_KEY를 .env에 추가하세요.',
    );
  }
}

export function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!base && !useMock) {
    throw new Error('VITE_API_BASE_URL is not set');
  }
  return (base ?? '').replace(/\/$/, '');
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody | undefined;

  constructor(status: number, message: string, body?: ApiErrorBody) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  assertApiKeyConfigured();
  const base = getApiBaseUrl();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(init?.headers);

  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json');
  }

  const apiKey = getApiKey();
  if (apiKey && !headers.has('X-API-Key')) {
    headers.set('X-API-Key', apiKey);
  }

  const response = await fetch(url, { ...init, headers });

  if (!response.ok) {
    let body: ApiErrorBody | undefined;
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      body = undefined;
    }
    const message = formatApiErrorMessage(
      body,
      response.statusText || 'Request failed',
    );
    throw new ApiError(response.status, message, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
