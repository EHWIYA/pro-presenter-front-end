import type { ApiErrorBody, ApiErrorDetailObject, ApiValidationDetail } from './types';

function locIncludes(field: string, loc: (string | number)[] | undefined): boolean {
  return (loc ?? []).some((part) => part === field);
}

function isImageLyricsRuleViolation(item: ApiValidationDetail): boolean {
  const loc = item.loc ?? [];
  if (
    locIncludes('imageBase64', loc) ||
    locIncludes('imageMimeType', loc) ||
    locIncludes('lyricsText', loc)
  ) {
    return true;
  }
  const msg = item.msg ?? '';
  return /imageBase64|imageMimeType|lyricsText|exactly one/i.test(msg);
}

function isDetailObject(detail: unknown): detail is ApiErrorDetailObject {
  return typeof detail === 'object' && detail !== null && !Array.isArray(detail);
}

function formatDetailObject(detail: ApiErrorDetailObject): string | undefined {
  const msg = detail.message?.trim();
  if (!msg) return undefined;
  const hint = detail.hint?.trim();
  if (hint && !msg.includes(hint)) {
    return `${msg} (${hint})`;
  }
  return msg;
}

export function formatApiErrorMessage(
  body: ApiErrorBody | undefined,
  fallback = 'Request failed',
): string {
  const detail = body?.detail;
  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }
  if (isDetailObject(detail)) {
    const msg = formatDetailObject(detail);
    if (msg) return msg;
  }
  if (Array.isArray(detail) && detail.length > 0) {
    const firstMsg = detail[0]?.msg?.trim();
    if (firstMsg) return firstMsg;
  }
  const message = body?.message?.trim();
  if (message) return message;
  return fallback;
}

/** POST /api/v1/song/analyze 422 등 BFF 검증 응답 → 사용자 문구 */
export function formatSongAnalyzeError(body: ApiErrorBody | undefined): string {
  const detail = body?.detail;
  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }
  if (isDetailObject(detail)) {
    const msg = formatDetailObject(detail);
    if (msg) return msg;
  }
  if (Array.isArray(detail) && detail.length > 0) {
    if (detail.some((item) => locIncludes('songTitle', item.loc))) {
      return '곡 제목을 입력한 뒤 분석해 주세요.';
    }
    if (detail.some(isImageLyricsRuleViolation)) {
      return '악보 이미지 또는 가사 중 하나만 넣어 주세요.';
    }
    const firstMsg = detail[0]?.msg?.trim();
    if (firstMsg) return firstMsg;
  }
  return formatApiErrorMessage(body, '분석 요청 실패');
}
