import { NavLink, Outlet } from 'react-router-dom';
import docTextSvg from 'cupertino-icons-svg/svg/doc_text.svg?raw';
import musicNoteSvg from 'cupertino-icons-svg/svg/music_note.svg?raw';
import houseSvg from 'cupertino-icons-svg/svg/house.svg?raw';
import playCircleSvg from 'cupertino-icons-svg/svg/play_circle.svg?raw';
import gearSvg from 'cupertino-icons-svg/svg/gear.svg?raw';
import { CupertinoIcon } from '@/components';
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle';
import { getSelectedVenueId } from '@/lib/session';
import { useVenues } from '@/hooks';
import styles from './AppShell.module.css';

const tabs = [
  { to: '/worship/build', label: '구절', icon: docTextSvg, end: false },
  { to: '/worship/song', label: '찬양', icon: musicNoteSvg, end: false },
  { to: '/home', label: '홈', icon: houseSvg, end: true },
  { to: '/worship/trigger', label: '송출', icon: playCircleSvg, end: false },
  { to: '/settings', label: '설정', icon: gearSvg, end: true },
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
        <div className={styles.headerRight}>
          <span className={styles.venueBadge} title={venueName}>
            {venueName}
          </span>
          <ThemeToggle />
        </div>
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
            <CupertinoIcon svg={tab.icon} />
            <span className={styles.navLabel}>{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
