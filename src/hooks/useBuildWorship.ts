import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buildWorship } from '@/api';
import type { WorshipBuildRequest, WorshipBuildResponse } from '@/api';
import { queryKeys } from '@/lib/queryKeys';

export interface WorshipBuildParams {
  reference: string;
  presentationFilename: string;
}

export function useBuildWorship(venueId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: WorshipBuildParams) => {
      if (!venueId) throw new Error('현장을 먼저 선택하세요');

      const body: WorshipBuildRequest = {
        reference: params.reference,
        presentation_filename: params.presentationFilename,
        auto_trigger: false,
      };
      return buildWorship(venueId, body);
    },
    onSuccess: (data: WorshipBuildResponse, params: WorshipBuildParams) => {
      if (venueId) {
        queryClient.setQueryData(
          queryKeys.worshipBuild(
            venueId,
            params.reference,
            params.presentationFilename,
          ),
          data,
        );
      }
    },
  });
}
