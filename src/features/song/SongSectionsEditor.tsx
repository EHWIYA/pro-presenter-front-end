import type { SongSection, SongSectionType } from '@/api';
import { Button, StatusBanner } from '@/components';
import styles from './SongSectionsEditor.module.css';

const SECTION_TYPES: { value: SongSectionType; label: string }[] = [
  { value: 'intro', label: 'Intro' },
  { value: 'verse', label: 'Verse' },
  { value: 'pre_chorus', label: 'Pre-chorus' },
  { value: 'chorus', label: 'Chorus' },
  { value: 'bridge', label: 'Bridge' },
  { value: 'tag', label: 'Tag' },
  { value: 'outro', label: 'Outro' },
  { value: 'instrumental', label: 'Instrumental' },
  { value: 'unknown', label: 'Unknown' },
];

export function sectionLinesValid(lines: string[]): boolean {
  const nonEmpty = lines.map((l) => l.trim()).filter(Boolean);
  return nonEmpty.length >= 1 && nonEmpty.length <= 2;
}

export function allSectionsValid(sections: SongSection[]): boolean {
  return sections.length > 0 && sections.every((s) => sectionLinesValid(s.lines));
}

function parseLinesText(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 2);
}

interface SongSectionsEditorProps {
  sections: SongSection[];
  warnings?: string[];
  disabled?: boolean;
  canSave?: boolean;
  savePending?: boolean;
  saveMessage?: string | null;
  onChange: (sections: SongSection[]) => void;
  onConfirm: () => void;
  onBack: () => void;
  onSave?: () => void;
  backLabel?: string;
}

export function SongSectionsEditor({
  sections,
  warnings = [],
  disabled = false,
  canSave = false,
  savePending = false,
  saveMessage = null,
  onChange,
  onConfirm,
  onBack,
  onSave,
  backLabel = '입력으로',
}: SongSectionsEditorProps) {
  const hasInvalid = !allSectionsValid(sections);

  function updateSection(index: number, patch: Partial<SongSection>) {
    onChange(sections.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function removeSection(index: number) {
    onChange(sections.filter((_, i) => i !== index));
  }

  function addSection() {
    onChange([
      ...sections,
      { type: 'verse', label: `${sections.length + 1}절`, lines: [''] },
    ]);
  }

  return (
    <div className={styles.root}>
      {warnings.length > 0 ? (
        <StatusBanner tone="warning">
          {warnings.map((w) => (
            <span key={w} className={styles.warningLine}>
              {w}
            </span>
          ))}
        </StatusBanner>
      ) : null}

      <p className={styles.hint}>
        구간당 1~2줄만 빌드 가능합니다. 초과 줄은 나누거나 줄여 주세요.
      </p>

      <ul className={styles.list}>
        {sections.map((section, index) => {
          const lineCount = section.lines.filter((l) => l.trim()).length;
          const invalid = lineCount < 1 || lineCount > 2;

          return (
            <li key={`section-${index}`} className={styles.card}>
              <div className={styles.row}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>라벨</span>
                  <input
                    className={styles.input}
                    value={section.label}
                    disabled={disabled}
                    onChange={(e) =>
                      updateSection(index, { label: e.target.value })
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>구간</span>
                  <select
                    className={styles.select}
                    value={section.type}
                    disabled={disabled}
                    onChange={(e) =>
                      updateSection(index, {
                        type: e.target.value as SongSectionType,
                      })
                    }
                  >
                    {SECTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>
                  가사 줄 (1~2줄){invalid ? ' — 줄 수 확인' : ''}
                </span>
                <textarea
                  className={[
                    styles.textarea,
                    invalid ? styles.textareaInvalid : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  value={section.lines.join('\n')}
                  disabled={disabled}
                  onChange={(e) =>
                    updateSection(index, { lines: parseLinesText(e.target.value) })
                  }
                  rows={2}
                />
              </label>

              <Button
                variant="secondary"
                fullWidth
                disabled={disabled || sections.length <= 1}
                onClick={() => removeSection(index)}
              >
                구간 삭제
              </Button>
            </li>
          );
        })}
      </ul>

      <Button variant="secondary" fullWidth disabled={disabled} onClick={addSection}>
        구간 추가
      </Button>

      {hasInvalid ? (
        <StatusBanner tone="error">
          모든 구간에 1~2줄의 가사가 필요합니다.
        </StatusBanner>
      ) : null}

      {saveMessage ? (
        <StatusBanner tone="info">{saveMessage}</StatusBanner>
      ) : null}

      {canSave && onSave ? (
        <Button
          variant="secondary"
          fullWidth
          disabled={disabled || savePending || hasInvalid}
          onClick={onSave}
        >
          {savePending ? '저장 중…' : '라이브러리에 저장'}
        </Button>
      ) : null}

      <div className={styles.actions}>
        <Button variant="secondary" fullWidth disabled={disabled} onClick={onBack}>
          {backLabel}
        </Button>
        <Button
          fullWidth
          disabled={disabled || hasInvalid}
          onClick={onConfirm}
        >
          검수 완료 · 빌드
        </Button>
      </div>
    </div>
  );
}
