export const queryKeys = {
  venues: ['venues'] as const,
  venueProbe: (venueId: string) => ['venues', venueId, 'probe'] as const,
  worshipBuild: (venueId: string, text: string) =>
    ['worship', 'build', venueId, text] as const,
};
