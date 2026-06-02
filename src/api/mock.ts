import type {
  AnalyzeResponse,
  SongAnalyzeRequest,
  SongBuildRequest,
  SongBuildResponse,
  SongDetail,
  SongJobResponse,
  SongListResponse,
  SongSection,
  Venue,
  VenueProbe,
  VenuePresentationsResponse,
  WorshipBuildRequest,
  WorshipBuildResponse,
  WorshipTriggerRequest,
  WorshipTriggerResponse,
} from './types';

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

const MOCK_LIBRARY_SONGS: SongDetail[] = [
  {
    songId: '550e8400-e29b-41d4-a716-446655440000',
    title: '주님의 마음',
    artist: null,
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
    tags: ['찬양'],
    sections: [
      { type: 'verse', label: '1절', lines: ['주님만이', '나의 주님'] },
      { type: 'chorus', label: '후렴', lines: ['오 주님', '찬양해'] },
    ],
    createdAt: '2026-06-01T00:00:00+00:00',
    updatedAt: '2026-06-01T12:00:00+00:00',
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
): Promise<SongListResponse> {
  await delay(250);
  const query = q.trim().toLowerCase();
  const filtered = MOCK_LIBRARY_SONGS.filter(
    (s) => !query || s.title.toLowerCase().includes(query),
  );
  const items = filtered.slice(offset, offset + limit).map((s) => ({
    songId: s.songId,
    title: s.title,
    artist: s.artist,
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
): Promise<void> {
  await delay(300);
  const idx = MOCK_LIBRARY_SONGS.findIndex((s) => s.songId === songId);
  if (idx < 0) throw new Error('곡을 찾을 수 없습니다.');
  MOCK_LIBRARY_SONGS[idx] = {
    ...MOCK_LIBRARY_SONGS[idx],
    sections: sections.map((s) => ({ ...s, lines: [...s.lines] })),
    updatedAt: new Date().toISOString(),
  };
}

export async function mockAnalyzeSong(
  body: SongAnalyzeRequest,
): Promise<AnalyzeResponse> {
  await delay(300);
  const title = body.songTitle.trim();

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
  const mockSongId = '770e8400-e29b-41d4-a716-446655440002';
  return {
    jobId,
    status: 'finished',
    parsed: {
      song_title: request.songTitle,
      sections: mockSectionsFromLyrics(lyrics, request.songTitle),
      warnings: request.imageBase64
        ? ['mock: 이미지 분석은 가사 기반 데모 결과입니다.']
        : [],
    },
    songId: mockSongId,
    libraryAction: 'created',
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
