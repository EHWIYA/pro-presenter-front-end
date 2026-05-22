import styles from './Spinner.module.css';

export function Spinner({ centered = false }: { centered?: boolean }) {
  const el = <div className={styles.spinner} aria-hidden />;
  if (centered) {
    return <div className={styles.center}>{el}</div>;
  }
  return el;
}
