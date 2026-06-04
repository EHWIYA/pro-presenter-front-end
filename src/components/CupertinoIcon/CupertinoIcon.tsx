import styles from './CupertinoIcon.module.css';

type CupertinoIconProps = {
  svg: string;
  className?: string;
};

export function CupertinoIcon({ svg, className }: CupertinoIconProps) {
  return (
    <span
      className={[styles.icon, className].filter(Boolean).join(' ')}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
