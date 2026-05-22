import { useMutation } from '@tanstack/react-query';
import { triggerSlide } from '@/api';

export function useTriggerSlide(venueId: string | null) {
  return useMutation({
    mutationFn: (index: number) => {
      if (!venueId) throw new Error('현장을 먼저 선택하세요');
      return triggerSlide(venueId, { index });
    },
  });
}
