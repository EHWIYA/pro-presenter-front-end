import type { ReactNode } from 'react';
import styles from './StatusBanner.module.css';

type Tone = 'info' | 'success' | 'error' | 'warning';

interface StatusBannerProps {
  tone?: Tone;
  children: ReactNode;
}

export function StatusBanner({ tone = 'info', children }: StatusBannerProps) {
  return (
    <div className={`${styles.banner} ${styles[tone]}`} role="status">
      {children}
    </div>
  );
}
