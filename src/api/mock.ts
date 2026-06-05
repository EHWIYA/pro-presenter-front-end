import type {
  AnalyzeResponse,
  DeleteSongCategoryResponse,
  SongAnalyzeRequest,
  SongBuildRequest,
  SongBuildResponse,
  SongCategoriesResponse,
  SongCategoryRecord,
  SongDetail,
  SongJobResponse,
  SongListResponse,
  SongSection,
  Venue,
  VenueStatusResponse,
  VenueProbe,
  VenuePresentationsResponse,
  WorshipBuildRequest,
  WorshipBuildResponse,
  WorshipTriggerRequest,
  WorshipTriggerResponse,
} from './types';
import { slugifyCategoryLabel } from '@/lib/songCategoryStore';

const MOCK_VENUES: Venue[] = [
  { id: 'hwiya-pc', name: '개발·테스트 PC', description: 'E2E 검증' },
  { id: 'hcc-pre', name: '방송실', description: '오프라인 시 probe 실패 가능' },
  { id: 'test', name: '현장 테스트 PC', description: 'NAS venues.json' },
  { id: 'main-hall', name: '본당', description: '주일 예배' },
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

export async function mockFetchVenueStatuses(): Promise<VenueStatusResponse> {
  await delay(250);
  const checkedAt = new Date().toISOString();
  return {
    statuses: [
      {
        venue_id: 'test',
        connected: true,
        agent_reachable: true,
        agent_status_code: 'ok',
        agent_message: 'agent reachable',
        agent_health_url: 'http://127.0.0.1:8787/health',
        status_code: 200,
        message: 'connected',
        checked_at: checkedAt,
      },
      {
        venue_id: 'main-hall',
        connected: false,
        agent_reachable: false,
        agent_status_code: 'timeout',
        agent_message: 'agent unreachable',
        agent_health_url: 'http://127.0.0.1:8787/health',
        status_code: 504,
        message: 'timeout',
        checked_at: checkedAt,
      },
    ],
  };
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

export async function mockFetchCurrentPresentation(
  venueId: string,
): Promise<{
  label?: string;
  index?: number;
  preview_text?: string;
}> {
  await delay(220);
  if (venueId === 'test') {
    return {
      label: '주일 1부',
      index: 12,
      preview_text: '오늘 우리에게 주시는 말씀 본문 미리보기',
    };
  }

  return {
    label: '대기 화면',
    index: 0,
    preview_text: '현재 송출 가능한 프리뷰가 없습니다.',
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

const MOCK_LIBRARY_SONGS: SongDetail[] = [
  {
    songId: '550e8400-e29b-41d4-a716-446655440000',
    title: '주님의 마음',
    artist: null,
    category: 'praise',
    tags: [],
    sections: [
      {
        type: 'verse',
        label: '1절',
        lines: ['주님의 마음 주님의 음성', '나를 부르시네'],
      },
      {
        type: 'chorus',
        label: '후렴',
        lines: ['할렐루야', '주님께 영광'],
      },
    ],
    createdAt: '2026-06-01T00:00:00+00:00',
    updatedAt: '2026-06-02T05:13:17+00:00',
  },
  {
    songId: '660e8400-e29b-41d4-a716-446655440001',
    title: '주님만이',
    artist: null,
    category: 'praise',
    tags: [],
    sections: [
      { type: 'verse', label: '1절', lines: ['주님만이', '나의 주님'] },
      { type: 'chorus', label: '후렴', lines: ['오 주님', '찬양해'] },
    ],
    createdAt: '2026-06-01T00:00:00+00:00',
    updatedAt: '2026-06-01T12:00:00+00:00',
  },
  {
    songId: '770e8400-e29b-41d4-a716-446655440003',
    title: '나의 기도하는 것을',
    artist: null,
    category: 'hymn',
    tags: [],
    sections: [
      {
        type: 'verse',
        label: '1절',
        lines: ['나의 기도하는 것을', '주께서 들으시고'],
      },
      { type: 'verse', label: '2절', lines: ['나의 간구하는 것을', '주께서 아시네'] },
    ],
    createdAt: '2026-05-20T00:00:00+00:00',
    updatedAt: '2026-05-28T09:00:00+00:00',
  },
  {
    songId: '880e8400-e29b-41d4-a716-446655440004',
    title: '은혜 아니면',
    artist: '김윤진',
    category: 'special',
    tags: [],
    sections: [
      { type: 'verse', label: '1절', lines: ['은혜 아니면', '날 구원할 이 없네'] },
      { type: 'chorus', label: '후렴', lines: ['오 주 예수', '나의 구주'] },
    ],
    createdAt: '2026-06-03T00:00:00+00:00',
    updatedAt: '2026-06-04T14:00:00+00:00',
  },
];

const mockJobStore = new Map<
  string,
  { createdAt: number; request: SongAnalyzeRequest }
>();

function mockSectionsFromLyrics(lyrics: string, title: string): SongSection[] {
  const blocks = lyrics
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return [
      {
        type: 'verse',
        label: '1절',
        lines: ['데모 가사 첫 줄', '데모 가사 둘째 줄'],
      },
      { type: 'chorus', label: '후렴', lines: ['할렐루야', title || '주님께'] },
    ];
  }

  return blocks.map((block, i) => {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    const isChorus = /후렴|chorus/i.test(block.slice(0, 20));
    return {
      type: isChorus ? 'chorus' : 'verse',
      label: isChorus ? '후렴' : `${i + 1}절`,
      lines: lines.slice(0, 2),
    } as SongSection;
  });
}

export async function mockFetchSongs(
  q: string,
  limit: number,
  offset: number,
  category?: import('./types').SongCategory,
): Promise<SongListResponse> {
  await delay(250);
  const query = q.trim().toLowerCase();
  const filtered = MOCK_LIBRARY_SONGS.filter((s) => {
    if (category && s.category !== category) return false;
    return !query || s.title.toLowerCase().includes(query);
  });
  const items = filtered.slice(offset, offset + limit).map((s) => ({
    songId: s.songId,
    title: s.title,
    artist: s.artist,
    category: s.category,
    tags: s.tags,
    sectionCount: s.sections.length,
    updatedAt: s.updatedAt,
  }));
  return { items, total: filtered.length };
}

export async function mockFetchSong(songId: string): Promise<SongDetail> {
  await delay(200);
  const found = MOCK_LIBRARY_SONGS.find((s) => s.songId === songId);
  if (!found) {
    throw new Error('곡을 찾을 수 없습니다.');
  }
  return { ...found, sections: found.sections.map((s) => ({ ...s, lines: [...s.lines] })) };
}

export async function mockUpdateSongSections(
  songId: string,
  sections: SongSection[],
  options?: { title?: string; category?: import('./types').SongCategory },
): Promise<void> {
  await delay(300);
  const idx = MOCK_LIBRARY_SONGS.findIndex((s) => s.songId === songId);
  if (idx < 0) throw new Error('곡을 찾을 수 없습니다.');
  MOCK_LIBRARY_SONGS[idx] = {
    ...MOCK_LIBRARY_SONGS[idx],
    title: options?.title?.trim() || MOCK_LIBRARY_SONGS[idx].title,
    category: options?.category ?? MOCK_LIBRARY_SONGS[idx].category,
    sections: sections.map((s) => ({ ...s, lines: [...s.lines] })),
    updatedAt: new Date().toISOString(),
  };
}

export async function mockDeleteSong(
  songId: string,
): Promise<import('./types').DeleteSongResponse> {
  await delay(200);
  const idx = MOCK_LIBRARY_SONGS.findIndex((s) => s.songId === songId);
  if (idx < 0) {
    throw new Error('곡을 찾을 수 없습니다.');
  }
  MOCK_LIBRARY_SONGS.splice(idx, 1);
  return { songId, deleted: true };
}

export async function mockCreateSong(body: {
  title: string;
  sections: SongSection[];
  category?: import('./types').SongCategory;
}): Promise<SongDetail> {
  await delay(300);
  const title = body.title.trim();
  if (!title) {
    throw new Error('곡 제목이 필요합니다.');
  }
  const song: SongDetail = {
    songId: `mock-${Date.now()}`,
    title,
    artist: null,
    category: body.category ?? 'praise',
    tags: [],
    sections: body.sections.map((s) => ({ ...s, lines: [...s.lines] })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  MOCK_LIBRARY_SONGS.unshift(song);
  return { ...song, sections: song.sections.map((s) => ({ ...s, lines: [...s.lines] })) };
}

export async function mockAnalyzeSong(
  body: SongAnalyzeRequest,
): Promise<AnalyzeResponse> {
  await delay(300);
  const title = body.songTitle?.trim() ?? '';
  const hasImage = Boolean(body.imageBase64 && body.imageMimeType);
  const hasLyrics = Boolean(body.lyricsText?.trim());
  if (hasImage === hasLyrics) {
    throw new Error('악보 이미지 또는 가사 중 하나만 넣어 주세요.');
  }
  if (!hasImage && !hasLyrics) {
    throw new Error('악보 이미지 또는 가사 중 하나만 넣어 주세요.');
  }

  if (!body.forceReanalyze && title === '주님의 마음') {
    const song = MOCK_LIBRARY_SONGS[0];
    return {
      source: 'library',
      songId: song.songId,
      title: song.title,
      sections: song.sections.map((s) => ({ ...s, lines: [...s.lines] })),
      schemaVersion: 'song-sections/v1',
    };
  }

  if (!body.forceReanalyze && /후보/i.test(title)) {
    return {
      source: 'library_candidates',
      query: title.replace(/후보/gi, '').trim() || '주님',
      candidates: MOCK_LIBRARY_SONGS.map((s) => ({
        songId: s.songId,
        title: s.title,
        category: s.category,
        sectionCount: s.sections.length,
        updatedAt: s.updatedAt,
      })),
    };
  }

  const jobId = `song-mock-${Date.now()}`;
  mockJobStore.set(jobId, { createdAt: Date.now(), request: body });
  return {
    jobId,
    status: 'queued',
    pollUrl: `/api/v1/song/jobs/${jobId}`,
    kind: 'song_analyze',
  };
}

export async function mockGetSongJob(jobId: string): Promise<SongJobResponse> {
  await delay(200);
  const entry = mockJobStore.get(jobId);
  if (!entry) {
    return { jobId, status: 'error', error: 'job not found', errorCode: 'NOT_FOUND' };
  }

  const elapsed = Date.now() - entry.createdAt;
  if (elapsed < 1500) {
    return { jobId, status: elapsed < 700 ? 'queued' : 'running' };
  }

  const { request } = entry;
  const lyrics = request.lyricsText ?? '1절\n첫 줄\n둘째 줄\n\n후렴\n할렐루야';
  const extractedTitle =
    request.songTitle?.trim() ||
    (request.imageBase64 ? '악보에서 추출한 곡 (데모)' : '제목 미확인');
  const persist = request.saveToLibrary === true;
  const mockSongId = '770e8400-e29b-41d4-a716-446655440002';
  return {
    jobId,
    status: 'finished',
    parsed: {
      song_title: extractedTitle,
      sections: mockSectionsFromLyrics(lyrics, extractedTitle),
      warnings: request.imageBase64
        ? ['mock: 이미지 분석은 가사 기반 데모 결과입니다.']
        : [],
    },
    songId: persist ? mockSongId : undefined,
    libraryAction: persist ? 'created' : 'skipped',
  };
}

export async function mockBuildSong(
  body: SongBuildRequest,
): Promise<SongBuildResponse> {
  await delay(600);
  const baseIndex = body.buildMode === 'replace' ? 0 : 14;

  let sections: SongSection[] = body.sections ?? [];
  let songTitle = body.songTitle ?? '';
  let sourceSongId = body.songId;

  if (body.songId && !body.sections) {
    const song = MOCK_LIBRARY_SONGS.find((s) => s.songId === body.songId);
    if (song) {
      sections = song.sections;
      songTitle = song.title;
      sourceSongId = song.songId;
    }
  }

  const slide_map = sections.map((section, i) => ({
    index: baseIndex + i,
    label: section.label,
    preview: section.lines.join(' / ').slice(0, 48),
  }));

  return {
    ok: true,
    song_title: songTitle,
    sourceSongId,
    build_mode: body.buildMode,
    slide_map,
    groups: sections.map((section, i) => ({
      name: section.label,
      uuid: `mock-uuid-${i}`,
      slide_count: 1,
      first_index: baseIndex + i,
      color_hex: '#26a559',
    })),
    section_results: [],
    total_slide_count: baseIndex + sections.length,
    message: 'mock build-song ok',
  };
}

const MOCK_CUSTOM_CATEGORIES: SongCategoryRecord[] = [];

function mockBuiltinCategories(): SongCategoriesResponse['builtin'] {
  return ['praise', 'hymn', 'special'];
}

export async function mockFetchSongCategories(): Promise<SongCategoriesResponse> {
  await delay(150);
  return {
    builtin: mockBuiltinCategories(),
    custom: MOCK_CUSTOM_CATEGORIES.map((row) => ({ ...row })),
  };
}

export async function mockCreateSongCategory(
  label: string,
): Promise<SongCategoryRecord> {
  await delay(200);
  const trimmed = label.trim();
  if (!trimmed) throw new Error('label이 비어 있습니다.');
  if (trimmed.length > 24) throw new Error('이름은 24자 이하로 입력하세요.');
  const builtins = ['찬양', '성가곡', '특송'];
  if (builtins.includes(trimmed)) {
    throw new Error('기본 카테고리와 동일한 라벨은 사용할 수 없습니다.');
  }
  const slug = slugifyCategoryLabel(trimmed);
  if (!slug) throw new Error('label에서 유효한 slug를 생성할 수 없습니다.');
  const id = `custom:${slug}` as `custom:${string}`;
  if (MOCK_CUSTOM_CATEGORIES.some((row) => row.id === id)) {
    const err = new Error('category_exists');
    (err as Error & { status?: number }).status = 409;
    throw err;
  }
  const now = new Date().toISOString();
  const row: SongCategoryRecord = {
    id,
    label: trimmed,
    createdAt: now,
    updatedAt: now,
  };
  MOCK_CUSTOM_CATEGORIES.push(row);
  return { ...row };
}

export async function mockUpdateSongCategory(
  id: `custom:${string}`,
  label: string,
): Promise<SongCategoryRecord> {
  await delay(200);
  const index = MOCK_CUSTOM_CATEGORIES.findIndex((row) => row.id === id);
  if (index < 0) throw new Error('카테고리를 찾을 수 없습니다.');
  const trimmed = label.trim();
  if (!trimmed || trimmed.length > 24) {
    throw new Error('이름은 24자 이하로 입력하세요.');
  }
  const next = { ...MOCK_CUSTOM_CATEGORIES[index], label: trimmed, updatedAt: new Date().toISOString() };
  MOCK_CUSTOM_CATEGORIES[index] = next;
  return { ...next };
}

export async function mockDeleteSongCategory(
  id: `custom:${string}`,
): Promise<DeleteSongCategoryResponse> {
  await delay(200);
  const index = MOCK_CUSTOM_CATEGORIES.findIndex((row) => row.id === id);
  if (index < 0) throw new Error('카테고리를 찾을 수 없습니다.');
  const songCount = MOCK_LIBRARY_SONGS.filter((song) => song.category === id).length;
  if (songCount > 0) {
    const err = new Error('이 카테고리를 사용하는 곡이 있습니다.');
    (err as Error & { status?: number; body?: unknown }).status = 409;
    (err as Error & { body?: unknown }).body = {
      detail: 'category_in_use',
      message: '이 카테고리를 사용하는 곡이 있습니다.',
      songCount,
    };
    throw err;
  }
  MOCK_CUSTOM_CATEGORIES.splice(index, 1);
  return { deleted: true };
}
