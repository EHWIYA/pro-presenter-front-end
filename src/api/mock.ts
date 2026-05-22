import type {
  Venue,
  VenueProbe,
  WorshipBuildRequest,
  WorshipBuildResponse,
  WorshipTriggerRequest,
  WorshipTriggerResponse,
} from './types';

const MOCK_VENUES: Venue[] = [
  { id: 'main-hall', name: '본당', description: '주일 예배' },
  { id: 'chapel', name: '소예배실', description: '수요·금요' },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function mockFetchVenues(): Promise<Venue[]> {
  await delay(200);
  return [...MOCK_VENUES];
}

export async function mockProbeVenue(venueId: string): Promise<VenueProbe> {
  await delay(300);
  return {
    venue_id: venueId,
    online: true,
    agent_reachable: venueId !== 'offline-demo',
    message: 'mock probe ok',
  };
}

export async function mockBuildWorship(
  _venueId: string,
  body: WorshipBuildRequest,
): Promise<WorshipBuildResponse> {
  await delay(500);
  const lines = body.text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const slide_map =
    lines.length > 0
      ? lines.map((line, index) => ({
          index,
          label: `슬라이드 ${index + 1}`,
          preview: line.slice(0, 48),
        }))
      : [
          { index: 0, label: '제목', preview: '빈 입력 — 데모 슬라이드' },
          { index: 1, label: '본문 1', preview: '데모 본문' },
          { index: 2, label: '본문 2', preview: '데모 본문 2' },
        ];

  const reference = lines[0] ?? '데모 참조';
  return {
    ok: true,
    reference,
    slide_count: slide_map.length,
    slide_map,
    message: 'mock build ok',
  };
}

export async function mockTriggerSlide(
  _venueId: string,
  body: WorshipTriggerRequest,
): Promise<WorshipTriggerResponse> {
  await delay(400);
  return {
    ok: true,
    index: body.index,
    message: `mock triggered index ${body.index}`,
  };
}
