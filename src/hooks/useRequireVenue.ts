import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigateToConnect } from '@/lib/tabRoutes';
import { getSelectedVenueId } from '@/lib/session';

/** 탭 화면 공통 — venue 없으면 PC 연결로 replace 이동 */
export function useRequireVenue(): string | null {
  const navigate = useNavigate();
  const venueId = getSelectedVenueId();

  useEffect(() => {
    if (!venueId) {
      navigateToConnect(navigate);
    }
  }, [navigate, venueId]);

  return venueId;
}
