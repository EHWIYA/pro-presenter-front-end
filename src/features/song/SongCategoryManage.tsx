import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Button } from '@/components';
import { useSongCategories } from '@/hooks/useSongCategories';
import type { SongCategoryDef } from '@/lib/songCategoryStore';
import styles from './SongCategoryManage.module.css';

interface SongCategoryManageProps {
  disabled?: boolean;
  /** inline: 필터 옆 · block: 폼 하단 전체 너비 */
  layout?: 'inline' | 'block';
}

function ManageIcon() {
  return (
    <svg
      className={styles.triggerIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 6h16M4 12h10M4 18h16" />
      <circle cx="17" cy="12" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SongCategoryManage({
  disabled = false,
  layout = 'inline',
}: SongCategoryManageProps) {
  const { defs, addCategory, updateCategory, removeCategory, isLoading, isMutating } =
    useSongCategories();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeModal();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  function resetEditor() {
    setEditingId(null);
    setEditName('');
    setNewName('');
    setMessage(null);
  }

  function closeModal() {
    setOpen(false);
    resetEditor();
  }

  function handleAdd() {
    setMessage(null);
    void addCategory(newName).then((result) => {
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      setNewName('');
      setMessage('카테고리를 추가했습니다.');
    });
  }

  function startEdit(def: SongCategoryDef) {
    if (def.builtin) return;
    setEditingId(def.id);
    setEditName(def.label);
    setMessage(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
    setMessage(null);
  }

  function handleSaveEdit(id: `custom:${string}`) {
    setMessage(null);
    void updateCategory(id, editName).then((result) => {
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      cancelEdit();
      setMessage('카테고리를 수정했습니다.');
    });
  }

  function handleRemove(def: SongCategoryDef) {
    if (def.builtin) return;
    const ok = window.confirm(`「${def.label}」 카테고리를 삭제할까요?`);
    if (!ok) return;
    if (editingId === def.id) {
      cancelEdit();
    }
    void removeCategory(def.id as `custom:${string}`).then((result) => {
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      setMessage('카테고리를 삭제했습니다.');
    });
  }

  const manageDisabled = disabled || isLoading || isMutating;

  const builtins = defs.filter((d) => d.builtin);
  const customs = defs.filter((d) => !d.builtin);

  return (
    <>
      <button
        type="button"
        className={[
          styles.trigger,
          layout === 'block' ? styles.triggerBlock : '',
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={manageDisabled}
        aria-label="카테고리 관리"
        onClick={() => setOpen(true)}
      >
        <ManageIcon />
        <span className={styles.triggerText}>관리</span>
      </button>

      {open ? (
        <div
          className={styles.backdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby="category-manage-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className={styles.modal}>
            <header className={styles.modalHeader}>
              <div className={styles.modalHeading}>
                <h2 id="category-manage-title" className={styles.modalTitle}>
                  카테고리 관리
                </h2>
                <p className={styles.modalSubtitle}>
                  서버에 저장 · 모든 사용자와 공유됩니다
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                aria-label="닫기"
                onClick={closeModal}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </header>

            <div className={styles.modalBody}>
              <p className={styles.hint}>
                기본 카테고리는 조회만 가능하고, 사용자 카테고리는 추가·수정·삭제할
                수 있습니다.
              </p>

              <section className={styles.section} aria-labelledby="builtin-cats">
                <h3 id="builtin-cats" className={styles.sectionTitle}>
                  기본 카테고리
                  <span className={styles.sectionCount}>{builtins.length}</span>
                </h3>
                <ul className={styles.list}>
                  {builtins.map((def) => (
                    <CategoryRow
                      key={def.id}
                      def={def}
                      disabled={manageDisabled}
                      editing={false}
                      editName=""
                      onEditNameChange={() => {}}
                      onStartEdit={() => {}}
                      onSaveEdit={() => {}}
                      onCancelEdit={() => {}}
                      onRemove={() => {}}
                    />
                  ))}
                </ul>
              </section>

              <section className={styles.section} aria-labelledby="custom-cats">
                <h3 id="custom-cats" className={styles.sectionTitle}>
                  사용자 카테고리
                  <span className={styles.sectionCount}>{customs.length}</span>
                </h3>
                {customs.length > 0 ? (
                  <ul className={styles.list}>
                    {customs.map((def) => (
                      <CategoryRow
                        key={def.id}
                        def={def}
                        disabled={manageDisabled}
                        editing={editingId === def.id}
                        editName={editName}
                        onEditNameChange={setEditName}
                        onStartEdit={() => startEdit(def)}
                        onSaveEdit={() =>
                          handleSaveEdit(def.id as `custom:${string}`)
                        }
                        onCancelEdit={cancelEdit}
                        onRemove={() => handleRemove(def)}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className={styles.empty}>추가된 사용자 카테고리가 없습니다.</p>
                )}
              </section>

              <section className={styles.addSection} aria-labelledby="add-cat">
                <h3 id="add-cat" className={styles.sectionTitle}>
                  새 카테고리
                </h3>
                <div className={styles.addRow}>
                  <input
                    className={styles.input}
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="예: 주일 1부, 청년부"
                    maxLength={24}
                    disabled={manageDisabled}
                    aria-label="새 카테고리 이름"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAdd();
                    }}
                  />
                  <Button
                    disabled={manageDisabled || !newName.trim()}
                    onClick={handleAdd}
                  >
                    추가
                  </Button>
                </div>
              </section>

              {message ? <p className={styles.message}>{message}</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

interface CategoryRowProps {
  def: SongCategoryDef;
  disabled: boolean;
  editing: boolean;
  editName: string;
  onEditNameChange: (value: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onRemove: () => void;
}

function CategoryRow({
  def,
  disabled,
  editing,
  editName,
  onEditNameChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onRemove,
}: CategoryRowProps) {
  return (
    <li
      className={styles.listItem}
      style={{ '--category-accent': def.accent } as CSSProperties}
    >
      <div className={styles.listMain}>
        {editing ? (
          <input
            className={styles.editInput}
            type="text"
            value={editName}
            onChange={(e) => onEditNameChange(e.target.value)}
            maxLength={24}
            disabled={disabled}
            aria-label={`${def.label} 이름 수정`}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveEdit();
              if (e.key === 'Escape') onCancelEdit();
            }}
          />
        ) : (
          <>
            <span className={styles.listLabel}>{def.label}</span>
            <span className={styles.listDesc}>{def.description}</span>
          </>
        )}
      </div>

      {def.builtin ? (
        <span className={styles.builtinBadge}>기본</span>
      ) : editing ? (
        <div className={styles.rowActions}>
          <button
            type="button"
            className={[styles.actionBtn, styles.actionBtnPrimary].join(' ')}
            disabled={disabled || !editName.trim()}
            onClick={onSaveEdit}
          >
            저장
          </button>
          <button
            type="button"
            className={styles.actionBtn}
            disabled={disabled}
            onClick={onCancelEdit}
          >
            취소
          </button>
        </div>
      ) : (
        <div className={styles.rowActions}>
          <button
            type="button"
            className={styles.actionBtn}
            disabled={disabled}
            onClick={onStartEdit}
          >
            수정
          </button>
          <button
            type="button"
            className={[styles.actionBtn, styles.actionBtnDanger].join(' ')}
            disabled={disabled}
            onClick={onRemove}
          >
            삭제
          </button>
        </div>
      )}
    </li>
  );
}
