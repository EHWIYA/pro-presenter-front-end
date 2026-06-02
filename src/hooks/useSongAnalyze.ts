import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { analyzeSong, getSongJob } from '@/api';
import type { SongAnalyzeRequest, SongJobResponse } from '@/api';
import { queryKeys } from '@/lib/queryKeys';

const POLL_MS = 3000;

function isTerminalJob(status: string | undefined): boolean {
  return status === 'finished' || status === 'error';
}

export function useSongAnalyze() {
  const queryClient = useQueryClient();
  const [jobId, setJobId] = useState<string | null>(null);

  const start = useMutation({
    mutationFn: (body: SongAnalyzeRequest) => analyzeSong(body),
    onSuccess: (data) => {
      setJobId(data.jobId);
      queryClient.removeQueries({ queryKey: queryKeys.songJob(data.jobId) });
    },
  });

  const jobQuery = useQuery({
    queryKey: jobId ? queryKeys.songJob(jobId) : ['song', 'job', 'none'],
    queryFn: () => {
      if (!jobId) throw new Error('jobId required');
      return getSongJob(jobId);
    },
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return isTerminalJob(status) ? false : POLL_MS;
    },
    retry: 1,
  });

  const reset = useCallback(() => {
    setJobId(null);
    start.reset();
    if (jobId) {
      queryClient.removeQueries({ queryKey: queryKeys.songJob(jobId) });
    }
  }, [jobId, queryClient, start]);

  const job: SongJobResponse | undefined = jobQuery.data;
  const isPolling =
    Boolean(jobId) &&
    !isTerminalJob(job?.status) &&
    !jobQuery.error &&
    (jobQuery.isFetching || start.isPending);

  return {
    start,
    job,
    jobId,
    isPolling,
    jobError: jobQuery.error ?? start.error,
    reset,
  };
}
