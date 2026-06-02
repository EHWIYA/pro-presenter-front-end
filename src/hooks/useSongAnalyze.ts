import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { analyzeSong, getSongJob } from '@/api';
import type {
  AnalyzeCandidates,
  AnalyzeLibraryHit,
  AnalyzeResponse,
  SongAnalyzeRequest,
  SongJobResponse,
} from '@/api';
import { queryKeys } from '@/lib/queryKeys';

const POLL_MS = 3000;
const POLL_TIMEOUT_MS = 120_000;

function isTerminalJob(status: string | undefined): boolean {
  return status === 'finished' || status === 'error';
}

function isJobResponse(res: AnalyzeResponse): res is AnalyzeResponse & { jobId: string } {
  return 'jobId' in res && Boolean(res.jobId);
}

export function useSongAnalyze() {
  const queryClient = useQueryClient();
  const [jobId, setJobId] = useState<string | null>(null);
  const [pollStartedAt, setPollStartedAt] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [immediateResult, setImmediateResult] = useState<
    AnalyzeLibraryHit | AnalyzeCandidates | null
  >(null);

  const start = useMutation({
    mutationFn: (body: SongAnalyzeRequest) => analyzeSong(body),
    onSuccess: (data) => {
      if (isJobResponse(data)) {
        setJobId(data.jobId);
        setPollStartedAt(Date.now());
        setTimedOut(false);
        setImmediateResult(null);
        queryClient.removeQueries({ queryKey: queryKeys.songJob(data.jobId) });
        return;
      }
      setJobId(null);
      setPollStartedAt(null);
      setImmediateResult(data);
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
      if (isTerminalJob(status)) return false;
      if (
        pollStartedAt &&
        Date.now() - pollStartedAt > POLL_TIMEOUT_MS
      ) {
        return false;
      }
      return POLL_MS;
    },
    retry: 1,
  });

  const job: SongJobResponse | undefined = jobQuery.data;

  useEffect(() => {
    if (!jobId || !pollStartedAt) {
      setTimedOut(false);
      return;
    }
    if (isTerminalJob(job?.status)) {
      setTimedOut(false);
      return;
    }
    const remaining = POLL_TIMEOUT_MS - (Date.now() - pollStartedAt);
    if (remaining <= 0) {
      setTimedOut(true);
      return;
    }
    const timer = setTimeout(() => setTimedOut(true), remaining);
    return () => clearTimeout(timer);
  }, [job?.status, jobId, pollStartedAt]);

  const reset = useCallback(() => {
    setJobId(null);
    setPollStartedAt(null);
    setTimedOut(false);
    setImmediateResult(null);
    start.reset();
    if (jobId) {
      queryClient.removeQueries({ queryKey: queryKeys.songJob(jobId) });
    }
  }, [jobId, queryClient, start]);

  const isPolling =
    Boolean(jobId) &&
    !isTerminalJob(job?.status) &&
    !timedOut &&
    !jobQuery.error &&
    (jobQuery.isFetching || start.isPending);

  const pollTimedOut =
    timedOut && Boolean(jobId) && !isTerminalJob(job?.status);

  return {
    start,
    job,
    jobId,
    immediateResult,
    libraryHit:
      immediateResult?.source === 'library' ? immediateResult : undefined,
    candidates:
      immediateResult?.source === 'library_candidates'
        ? immediateResult
        : undefined,
    isPolling,
    pollTimedOut,
    jobError: jobQuery.error ?? start.error,
    reset,
  };
}
