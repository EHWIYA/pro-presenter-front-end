import { useEffect, useRef } from 'react';

type UseInternalStepBackOptions = {
  isAtRoot: boolean;
  onBack: () => void;
};

/**
 * 탭 내부 단계(라우트 없음)에서 브라우저 뒤로가기 처리.
 * 루트가 아닐 때 history 항목을 쌓고, popstate 시 onBack 호출.
 */
export function useInternalStepBack({
  isAtRoot,
  onBack,
}: UseInternalStepBackOptions) {
  const depthRef = useRef(0);
  const onBackRef = useRef(onBack);
  const wasAtRootRef = useRef(isAtRoot);

  onBackRef.current = onBack;

  useEffect(() => {
    if (isAtRoot) {
      depthRef.current = 0;
      wasAtRootRef.current = true;
      return;
    }

    if (wasAtRootRef.current) {
      window.history.pushState({ internalStep: true }, '');
      depthRef.current = 1;
      wasAtRootRef.current = false;
      return;
    }

    window.history.pushState({ internalStep: true }, '');
    depthRef.current += 1;
  }, [isAtRoot]);

  useEffect(() => {
    function handlePopState() {
      if (depthRef.current <= 0) return;
      depthRef.current -= 1;
      onBackRef.current();
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function collapseInternalHistory() {
    const depth = depthRef.current;
    depthRef.current = 0;
    wasAtRootRef.current = true;
    if (depth > 0) {
      window.history.go(-depth);
    }
  }

  /** 화면 내 뒤로 버튼 — 브라우저 뒤로가기와 동일하게 처리 */
  function syncHistoryBack() {
    if (depthRef.current <= 0) return false;
    window.history.back();
    return true;
  }

  return { collapseInternalHistory, syncHistoryBack };
}
