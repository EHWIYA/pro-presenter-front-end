export const queryKeys = {
  venues: ['venues'] as const,
  venueProbe: (venueId: string) => ['venues', venueId, 'probe'] as const,
  venuePresentations: (venueId: string) =>
    ['venues', venueId, 'presentations'] as const,
  worshipBuild: (venueId: string, text: string) =>
    ['worship', 'build', venueId, text] as const,
  songJob: (jobId: string) => ['song-analyze-job', jobId] as const,
  songs: (params: { q: string; limit: number; offset: number }) =>
    ['songs', params] as const,
  song: (songId: string) => ['song', songId] as const,
  buildSong: (venueId: string, songId: string | null) =>
    ['build-song', venueId, songId] as const,
};
