import moonFillSvg from 'cupertino-icons-svg/svg/moon_fill.svg?raw';
import sunMaxFillSvg from 'cupertino-icons-svg/svg/sun_max_fill.svg?raw';
import { CupertinoIcon } from '@/components/CupertinoIcon/CupertinoIcon';
import { useTheme } from '@/hooks/useTheme';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      title={isDark ? '라이트 모드' : '다크 모드'}
    >
      <CupertinoIcon svg={isDark ? sunMaxFillSvg : moonFillSvg} />
    </button>
  );
}
