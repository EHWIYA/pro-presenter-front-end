import type { SlideMapEntry } from '@/api';
import styles from './SlideGrid.module.css';

interface SlideGridProps {
  slides: SlideMapEntry[];
  onTrigger: (index: number) => void;
  disabled?: boolean;
  pendingIndex?: number | null;
  activeIndex?: number | null;
}

export function SlideGrid({
  slides,
  onTrigger,
  disabled = false,
  pendingIndex = null,
  activeIndex = null,
}: SlideGridProps) {
  return (
    <div className={styles.grid} role="group" aria-label="슬라이드 목록">
      {slides.map((slide) => {
        const isPending = pendingIndex === slide.index;
        const isActive = activeIndex === slide.index;
        const className = [
          styles.slideBtn,
          isActive ? styles.slideBtnActive : '',
          isPending ? styles.slideBtnPending : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={slide.index}
            type="button"
            className={className}
            disabled={disabled || isPending}
            onClick={() => onTrigger(slide.index)}
            aria-label={`${slide.label}, index ${slide.index}`}
          >
            <span className={styles.label}>{slide.label}</span>
            <span className={styles.index}>#{slide.index}</span>
            {slide.preview ? (
              <span className={styles.preview}>{slide.preview}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
