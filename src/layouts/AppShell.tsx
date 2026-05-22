import { NavLink, Outlet } from 'react-router-dom';
import { getSelectedVenueId } from '@/lib/session';
import { useVenues } from '@/hooks';
import styles from './AppShell.module.css';

const tabs = [
  { to: '/venue', label: '현장', icon: '🏛' },
  { to: '/worship/build', label: '빌드', icon: '📝' },
  { to: '/worship/trigger', label: '송출', icon: '▶' },
  { to: '/settings', label: '설정', icon: '⚙' },
] as const;

export function AppShell() {
  const venueId = getSelectedVenueId();
  const { data: venues } = useVenues();
  const venueName =
    venues?.find((v) => v.id === venueId)?.name ?? venueId ?? '미선택';

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <h1 className={styles.title}>Pro Presenter</h1>
        <span className={styles.venueBadge} title={venueName}>
          {venueName}
        </span>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <nav className={styles.nav} aria-label="주 메뉴">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              [styles.navLink, isActive ? styles.navLinkActive : '']
                .filter(Boolean)
                .join(' ')
            }
          >
            <span className={styles.navIcon} aria-hidden>
              {tab.icon}
            </span>
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
