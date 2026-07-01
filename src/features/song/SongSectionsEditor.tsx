import type { CSSProperties } from 'react';
import type { SongSection, SongSectionType } from '@/api';
import { Button, StatusBanner } from '@/components';
import {
  SECTION_TYPE_ACCENT,
  SECTION_TYPE_OPTIONS,
  sectionTypeLabel,
} from './sectionTypeMeta';
import styles from './SongSectionsEditor.module.css';

export function sectionLinesValid(
  lines: string[],
  ppCatalogMode = false,
): boolean {
  const nonEmpty = lines.map((l) => l.trim()).filter(Boolean);
  if (ppCatalogMode) {
    return nonEmpty.length >= 1;
  }
  return nonEmpty.length >= 1 && nonEmpty.length <= 2;
}

export function allSectionsValid(
  sections: SongSection[],
  ppCatalogMode = false,
): boolean {
  return (
    sections.length > 0 &&
    sections.every((s) => sectionLinesValid(s.lines, ppCatalogMode))
  );
}

function parseDraftLinesText(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 2);
}

function parseCatalogLinesText(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

export function countValidSections(
  sections: SongSection[],
  ppCatalogMode = false,
): number {
  return sections.filter((s) => sectionLinesValid(s.lines, ppCatalogMode)).length;
}

interface SongSectionsEditorProps {
  sections: SongSection[];
  warnings?: string[];
  disabled?: boolean;
  canSave?: boolean;
  savePending?: boolean;
  saveMessage?: string | null;
  onChange: (sections: SongSection[]) => void;
  onBack: () => void;
  onSave?: () => void;
  saveLabel?: string;
  backLabel?: string;
  /** 라이브러리 저장이 주 액션일 때 true (검수·빌드 분리) */
  savePrimary?: boolean;
  /** PP .pro 카탈로그 편집 — 줄 1개=슬라이드 1장, PP 라벨(V1·C…) 유지 */
  ppCatalogMode?: boolean;
}

export function SongSectionsEditor({
  sections,
  warnings = [],
  disabled = false,
  canSave = false,
  savePending = false,
  saveMessage = null,
  onChange,
  onBack,
  onSave,
  saveLabel = '라이브러리에 저장',
  backLabel = '입력으로',
  savePrimary = true,
  ppCatalogMode = false,
}: SongSectionsEditorProps) {
  const hasInvalid = !allSectionsValid(sections, ppCatalogMode);
  const validCount = countValidSections(sections, ppCatalogMode);

  function updateSection(index: number, patch: Partial<SongSection>) {
    onChange(sections.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function removeSection(index: number) {
    onChange(sections.filter((_, i) => i !== index));
  }

  function addSection() {
    onChange([
      ...sections,
      {
        type: 'verse',
        label: ppCatalogMode ? `V${sections.length + 1}` : `${sections.length + 1}절`,
        lines: [''],
      },
    ]);
  }

  const parseLinesText = ppCatalogMode ? parseCatalogLinesText : parseDraftLinesText;

  return (
    <div className={styles.root}>
      <div className={styles.sectionHead}>
        <h3 className={styles.sectionTitle}>가사 구간</h3>
        <p className={styles.sectionSub}>
          {ppCatalogMode
            ? `줄 1개 = 슬라이드 1장 · ${sections.length}개 구간`
            : `슬라이드당 1~2줄 · ${sections.length}개 구간`}
        </p>
      </div>

      {warnings.length > 0 ? (
        <ul className={styles.warnings} aria-label="분석 참고">
          {warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ) : null}

      <ol className={styles.timeline}>
        {sections.map((section, index) => {
          const nonEmptyLines = section.lines
            .map((l) => l.trim())
            .filter(Boolean);
          const lineCount = nonEmptyLines.length;
          const invalid = ppCatalogMode
            ? lineCount < 1
            : lineCount < 1 || lineCount > 2;
          const accent = SECTION_TYPE_ACCENT[section.type];
          const slideCount = ppCatalogMode
            ? Math.ceil(
                lineCount / Math.max(1, section.lines_per_slide ?? 1),
              )
            : null;

          return (
            <li
              key={`section-${index}`}
              className={styles.block}
              style={{ '--section-accent': accent } as CSSProperties}
            >
              <div className={styles.blockRail} aria-hidden>
                <span className={styles.index}>{index + 1}</span>
              </div>

              <article
                className={[
                  styles.card,
                  invalid ? styles.cardInvalid : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className={styles.cardTop}>
                  <div className={styles.cardMeta}>
                    <select
                      className={styles.typeSelect}
                      value={section.type}
                      disabled={disabled}
                      aria-label={`${index + 1}번 구간 유형`}
                      onChange={(e) =>
                        updateSection(index, {
                          type: e.target.value as SongSectionType,
                        })
                      }
                    >
                      {SECTION_TYPE_OPTIONS.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <span className={styles.typeHint}>
                      {sectionTypeLabel(section.type)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles.removeBtn}
                    disabled={disabled || sections.length <= 1}
                    onClick={() => removeSection(index)}
                  >
                    삭제
                  </button>
                </div>

                <label className={styles.labelField}>
                  <span className={styles.fieldLabel}>
                    {ppCatalogMode ? 'PP 라벨' : '표시 이름'}
                  </span>
                  <input
                    className={styles.input}
                    value={section.label}
                    disabled={disabled}
                    placeholder={ppCatalogMode ? 'V1, C, B…' : '1절, 후렴…'}
                    onChange={(e) =>
                      updateSection(index, { label: e.target.value })
                    }
                  />
                </label>

                <div className={styles.lyricsHead}>
                  <span className={styles.fieldLabel}>
                    {ppCatalogMode
                      ? `가사 (${lineCount}줄 · 슬라이드 ${slideCount ?? 0}장)`
                      : '가사 (1~2줄)'}
                  </span>
                  {!ppCatalogMode ? (
                    <div
                      className={styles.lineMeter}
                      aria-label={`${lineCount}줄 입력됨`}
                    >
                      <span
                        className={[
                          styles.lineDot,
                          lineCount >= 1 ? styles.lineDotOn : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      />
                      <span
                        className={[
                          styles.lineDot,
                          lineCount >= 2 ? styles.lineDotOn : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      />
                    </div>
                  ) : null}
                </div>
                <textarea
                  className={[
                    styles.textarea,
                    invalid ? styles.textareaInvalid : '',
                    ppCatalogMode ? styles.textareaCatalog : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  value={section.lines.join('\n')}
                  disabled={disabled}
                  placeholder={
                    ppCatalogMode
                      ? '한 줄에 슬라이드 한 장'
                      : '첫 번째 줄\n두 번째 줄 (선택)'
                  }
                  onChange={(e) =>
                    updateSection(index, { lines: parseLinesText(e.target.value) })
                  }
                  rows={ppCatalogMode ? Math.max(3, lineCount + 1) : 2}
                />
                {invalid ? (
                  <p className={styles.fieldError}>
                    {ppCatalogMode
                      ? '최소 1줄의 가사가 필요합니다.'
                      : '1~2줄의 가사가 필요합니다.'}
                  </p>
                ) : null}
              </article>
            </li>
          );
        })}
      </ol>

      <button
        type="button"
        className={styles.addBtn}
        disabled={disabled}
        onClick={addSection}
      >
        + 구간 추가
      </button>

      {hasInvalid ? (
        <StatusBanner tone="error">
          {validCount}/{sections.length}구간만 준비됐습니다.{' '}
          {ppCatalogMode
            ? '모든 구간에 최소 1줄 가사를 넣어 주세요.'
            : '모든 구간에 1~2줄 가사를 넣어 주세요.'}
        </StatusBanner>
      ) : null}

      {saveMessage ? (
        <StatusBanner tone="info">{saveMessage}</StatusBanner>
      ) : null}

      <div className={styles.actionBar}>
        {canSave && onSave ? (
          <Button
            variant={savePrimary ? undefined : 'secondary'}
            fullWidth
            disabled={disabled || savePending || hasInvalid}
            onClick={onSave}
          >
            {savePending ? '저장 중…' : saveLabel}
          </Button>
        ) : null}
        <Button variant="secondary" fullWidth disabled={disabled} onClick={onBack}>
          {backLabel}
        </Button>
      </div>
    </div>
  );
}
