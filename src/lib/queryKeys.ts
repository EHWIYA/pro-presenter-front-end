export const queryKeys = {
  venues: ['venues'] as const,
  venueProbe: (venueId: string) => ['venues', venueId, 'probe'] as const,
  venuePresentations: (venueId: string) =>
    ['venues', venueId, 'presentations'] as const,
  worshipBuild: (venueId: string, text: string) =>
    ['worship', 'build', venueId, text] as const,
  songJob: (jobId: string) => ['song', 'job', jobId] as const,
};
