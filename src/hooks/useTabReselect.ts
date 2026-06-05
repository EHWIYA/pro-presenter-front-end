import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { TabPath, TabReselectState } from '@/lib/tabRoutes';

export function useTabReselect(
  tabPath: TabPath,
  onReselect: () => void,
  options?: { beforeNavigate?: () => void },
) {
  const location = useLocation();
  const navigate = useNavigate();
  const onReselectRef = useRef(onReselect);
  const beforeNavigateRef = useRef(options?.beforeNavigate);

  onReselectRef.current = onReselect;
  beforeNavigateRef.current = options?.beforeNavigate;

  useEffect(() => {
    const state = location.state as TabReselectState | null;
    if (!state?.tabReselect || location.pathname !== tabPath) return;

    beforeNavigateRef.current?.();
    onReselectRef.current();

    const frame = requestAnimationFrame(() => {
      navigate(tabPath, { replace: true, state: null });
    });

    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.state, navigate, tabPath]);
}
