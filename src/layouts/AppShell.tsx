import { Outlet, useLocation } from 'react-router-dom';
import docTextSvg from 'cupertino-icons-svg/svg/doc_text.svg?raw';
import musicNoteSvg from 'cupertino-icons-svg/svg/music_note.svg?raw';
import houseSvg from 'cupertino-icons-svg/svg/house.svg?raw';
import playCircleSvg from 'cupertino-icons-svg/svg/play_circle.svg?raw';
import gearSvg from 'cupertino-icons-svg/svg/gear.svg?raw';
import { CupertinoIcon } from '@/components';
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle';
import { useConnectOverlay } from '@/lib/connectOverlay';
import { getSelectedVenueId } from '@/lib/session';
import { CONNECT_PATH, TAB_PATHS } from '@/lib/tabRoutes';
import { useVenues } from '@/hooks';
import { TabNavLink } from './TabNavLink';
import styles from './AppShell.module.css';

const tabs = [
  { to: TAB_PATHS.build, label: '구절', icon: docTextSvg, end: false },
  { to: TAB_PATHS.song, label: '찬양', icon: musicNoteSvg, end: false },
  {
    to: TAB_PATHS.home,
    label: '홈',
    icon: houseSvg,
    end: true,
    featured: true,
  },
  { to: TAB_PATHS.trigger, label: '송출', icon: playCircleSvg, end: false },
  { to: TAB_PATHS.settings, label: '설정', icon: gearSvg, end: true },
] as const;

export function AppShell() {
  const location = useLocation();
  const venueId = getSelectedVenueId();
  const { data: venues } = useVenues();
  const venueName =
    venues?.find((v) => v.id === venueId)?.name ?? venueId ?? '미선택';

  const isConnectPage = location.pathname === CONNECT_PATH;
  const showEnterOverlay = useConnectOverlay();

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

      <main
        className={[styles.main, isConnectPage ? styles.mainNoNav : '']
          .filter(Boolean)
          .join(' ')}
      >
        <Outlet />
      </main>

      {!isConnectPage ? (
        <nav className={styles.nav} aria-label="주 메뉴">
          <div className={styles.navBar}>
            {tabs.map((tab) => (
              <TabNavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  [
                    styles.navLink,
                    'featured' in tab && tab.featured
                      ? styles.navLinkFeatured
                      : '',
                    isActive ? styles.navLinkActive : '',
                  ]
                    .filter(Boolean)
                    .join(' ')
                }
              >
                <span className={styles.navIconWrap} aria-hidden>
                  <CupertinoIcon
                    svg={tab.icon}
                    className={styles.navIcon}
                  />
                </span>
                <span className={styles.navLabel}>{tab.label}</span>
              </TabNavLink>
            ))}
          </div>
        </nav>
      ) : null}

      {showEnterOverlay ? (
        <div
          className={styles.enterOverlay}
          role="alertdialog"
          aria-modal="true"
          aria-busy="true"
          aria-label="PC 연결 중"
        >
          <div className={styles.enterPanel}>
            <span className={styles.enterIndicator} aria-hidden>
              <span className={styles.enterDot} />
              <span className={styles.enterDot} />
              <span className={styles.enterDot} />
            </span>
            <p className={styles.enterTitle}>PC 연결 중</p>
            <p className={styles.enterHint}>홈 화면을 준비하고 있어요</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
