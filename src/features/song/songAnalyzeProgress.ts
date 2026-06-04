export type AnalyzePhase = 'request' | 'queued' | 'running' | 'finishing';

export const ANALYZE_STEPS: { id: AnalyzePhase; label: string }[] = [
  { id: 'request', label: '요청' },
  { id: 'queued', label: '대기' },
  { id: 'running', label: '분석' },
  { id: 'finishing', label: '완료' },
];

const PHASE_ORDER: AnalyzePhase[] = ['request', 'queued', 'running', 'finishing'];

export function resolveAnalyzePhase(
  startPending: boolean,
  jobStatus: string | undefined,
): AnalyzePhase {
  if (startPending) {
    return 'request';
  }
  if (jobStatus === 'running') {
    return 'running';
  }
  if (jobStatus === 'finished') {
    return 'finishing';
  }
  return 'queued';
}

export function analyzePhaseIndex(phase: AnalyzePhase): number {
  return PHASE_ORDER.indexOf(phase);
}

export function analyzeStatusMessage(
  phase: AnalyzePhase,
  jobStatus: string | undefined,
): string {
  if (phase === 'request') {
    return '서버에 악보 이미지를 전송하는 중입니다…';
  }
  if (phase === 'running') {
    return 'AI가 악보에서 가사·구간을 추출하는 중입니다…';
  }
  if (phase === 'finishing') {
    return '결과를 정리하는 중입니다…';
  }
  if (jobStatus === 'queued') {
    return '분석 대기열에 등록되었습니다. 곧 시작합니다…';
  }
  return '분석을 준비하는 중입니다…';
}
