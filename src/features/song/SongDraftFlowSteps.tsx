import styles from './SongDraftFlowSteps.module.css';

export type DraftFlowStep = 'upload' | 'analyzing' | 'edit';

const STEPS: { id: DraftFlowStep; label: string }[] = [
  { id: 'upload', label: '악보' },
  { id: 'analyzing', label: '분석' },
  { id: 'edit', label: '검수·저장' },
];

interface SongDraftFlowStepsProps {
  current: DraftFlowStep;
}

export function SongDraftFlowSteps({ current }: SongDraftFlowStepsProps) {
  const currentIdx = STEPS.findIndex((s) => s.id === current);

  return (
    <nav className={styles.root} aria-label="신규 악보 진행 단계">
      <ol className={styles.list}>
        {STEPS.map((step, index) => {
          const done = index < currentIdx;
          const active = index === currentIdx;
          return (
            <li
              key={step.id}
              className={[
                styles.item,
                done ? styles.itemDone : '',
                active ? styles.itemActive : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className={styles.badge} aria-hidden>
                {done ? '✓' : index + 1}
              </span>
              <span className={styles.label}>{step.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
