import { NavLink, useLocation, useNavigate, type NavLinkProps } from 'react-router-dom';
import { reselectTab, type TabPath } from '@/lib/tabRoutes';

type TabNavLinkProps = Omit<NavLinkProps, 'replace' | 'to'> & {
  to: TabPath;
};

/** 하단 탭 전용 — replace 전환 + 동일 탭 재클릭 시 루트 리셋 */
export function TabNavLink({ to, onClick, ...props }: TabNavLinkProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <NavLink
      {...props}
      to={to}
      replace
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (location.pathname === to) {
          event.preventDefault();
          reselectTab(navigate, to);
        }
      }}
    />
  );
}
