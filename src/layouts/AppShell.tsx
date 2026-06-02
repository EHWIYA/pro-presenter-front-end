import { NavLink, Outlet } from 'react-router-dom';
import { getSelectedVenueId } from '@/lib/session';
import { useVenues } from '@/hooks';
import styles from './AppShell.module.css';

const tabs = [
  { to: '/home', label: '홈', icon: '🏠', end: true },
  { to: '/worship/build', label: '구절', icon: '📝', end: false },
  { to: '/worship/song', label: '찬양', icon: '🎵', end: false },
  { to: '/worship/trigger', label: '송출', icon: '▶', end: false },
  { to: '/settings', label: '설정', icon: '⚙', end: true },
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
            end={tab.end}
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
