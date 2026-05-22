import type {
  Venue,
  VenueProbe,
  VenuePresentationsResponse,
  WorshipBuildRequest,
  WorshipBuildResponse,
  WorshipTriggerRequest,
  WorshipTriggerResponse,
} from './types';

const MOCK_VENUES: Venue[] = [
  { id: 'test', name: '현장 테스트 PC', description: 'NAS venues.json' },
  { id: 'main-hall', name: '본당', description: '주일 예배' },
  { id: 'chapel', name: '소예배실', description: '수요·금요' },
];

const MOCK_PRESENTATIONS_BY_VENUE: Record<string, VenuePresentationsResponse> = {
  test: {
    venue_id: 'test',
    presentations: [
      {
        id: 'pres-sunday-am',
        label: '주일 1부',
        group_count: 4,
        slide_count: 48,
        groups: [
          { label: '예배 전', slide_count: 4 },
          { label: '찬양', slide_count: 12 },
          { label: '말씀', slide_count: 28 },
          { label: '봉헌·광고', slide_count: 4 },
        ],
      },
      {
        id: 'pres-sunday-pm',
        label: '주일 2부',
        group_count: 3,
        slide_count: 35,
        groups: [
          { label: '찬양', slide_count: 10 },
          { label: '말씀', slide_count: 22 },
          { label: '마무리', slide_count: 3 },
        ],
      },
      {
        id: 'pres-special',
        label: '특별집회',
        group_count: 2,
        slide_count: 18,
        groups: [
          { label: '소개', slide_count: 5 },
          { label: '본 프로그램', slide_count: 13 },
        ],
      },
    ],
  },
  'main-hall': {
    venue_id: 'main-hall',
    presentations: [
      {
        id: 'pres-main-default',
        label: '본당 기본',
        group_count: 2,
        slide_count: 20,
        groups: [
          { label: '오프닝', slide_count: 6 },
          { label: '본문', slide_count: 14 },
        ],
      },
    ],
  },
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function mockFetchVenues(): Promise<Venue[]> {
  await delay(200);
  return [...MOCK_VENUES];
}

export async function mockFetchVenuePresentations(
  venueId: string,
): Promise<VenuePresentationsResponse> {
  await delay(350);
  return (
    MOCK_PRESENTATIONS_BY_VENUE[venueId] ?? {
      venue_id: venueId,
      presentations: [],
    }
  );
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
