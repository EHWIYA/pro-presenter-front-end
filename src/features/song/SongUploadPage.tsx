import { useRef, useState, type ClipboardEvent } from 'react';
import { Button, StatusBanner } from '@/components';
import styles from './SongUploadPage.module.css';

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PASTED_IMAGE_LABEL = '클립보드에서 붙여넣음';

export interface SongUploadPayload {
  imageBase64: string;
  imageMimeType: string;
}

interface SongUploadPageProps {
  disabled?: boolean;
  onSubmit: (payload: SongUploadPayload) => void;
}

async function readImageFile(
  file: File,
): Promise<{ base64: string; mimeType: string }> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('JPEG·PNG·WebP 이미지만 업로드할 수 있습니다.');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('이미지는 약 4MB 이하여야 합니다.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('이미지를 읽지 못했습니다.'));
        return;
      }
      const comma = result.indexOf(',');
      resolve({
        base64: comma >= 0 ? result.slice(comma + 1) : result,
        mimeType: file.type,
      });
    };
    reader.onerror = () => reject(new Error('이미지를 읽지 못했습니다.'));
    reader.readAsDataURL(file);
  });
}

function getImageFileFromClipboard(clipboardData: DataTransfer): File | null {
  for (const item of clipboardData.items) {
    if (item.kind !== 'file' || !item.type.startsWith('image/')) {
      continue;
    }
    const file = item.getAsFile();
    if (!file) {
      continue;
    }
    if (ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return file;
    }
    if (!file.type) {
      return new File([file], 'pasted-image.png', { type: 'image/png' });
    }
    return file;
  }
  return null;
}

function clipboardHasNonImageContent(clipboardData: DataTransfer): boolean {
  return [...clipboardData.items].some(
    (item) =>
      (item.kind === 'string' && item.type === 'text/plain') ||
      (item.kind === 'file' && item.type !== '' && !item.type.startsWith('image/')),
  );
}

export function SongUploadPage({ disabled = false, onSubmit }: SongUploadPageProps) {
  const pasteZoneRef = useRef<HTMLDivElement>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{
    base64: string;
    mimeType: string;
  } | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleImageChange(
    file: File | undefined,
    displayName?: string,
  ) {
    setLocalError(null);
    if (!file) {
      setImageName(null);
      setImageData(null);
      return;
    }
    try {
      const data = await readImageFile(file);
      setImageName(displayName ?? file.name);
      setImageData(data);
    } catch (err) {
      setImageName(null);
      setImageData(null);
      setLocalError(err instanceof Error ? err.message : '이미지 오류');
    }
  }

  function handleImagePaste(e: ClipboardEvent<HTMLDivElement>) {
    if (disabled) {
      return;
    }
    const file = getImageFileFromClipboard(e.clipboardData);
    if (!file) {
      if (clipboardHasNonImageContent(e.clipboardData)) {
        e.preventDefault();
        setLocalError('이미지를 붙여넣으세요.');
      }
      return;
    }
    e.preventDefault();
    void handleImageChange(file, PASTED_IMAGE_LABEL);
  }

  function handleSubmit() {
    setLocalError(null);

    if (!imageData) {
      setLocalError('악보 이미지를 선택하거나 붙여넣으세요.');
      return;
    }
    onSubmit({
      imageBase64: imageData.base64,
      imageMimeType: imageData.mimeType,
    });
  }

  const canSubmit = !disabled && Boolean(imageData);

  return (
    <div className={styles.root}>
      <div className={styles.field}>
        <span className={styles.label} id="song-image-label">
          악보 이미지 (JPEG·PNG·WebP, ~4MB)
        </span>
        <div
          ref={pasteZoneRef}
          className={styles.pasteZone}
          tabIndex={disabled ? -1 : 0}
          role="group"
          aria-labelledby="song-image-label"
          aria-describedby="song-image-hint"
          onPaste={handleImagePaste}
          onClick={() => pasteZoneRef.current?.focus()}
        >
          <p id="song-image-hint" className={styles.pasteHint}>
            악보 이미지를 선택하거나 붙여넣기(Ctrl+V / ⌘+V)하세요. 곡 제목은 AI
            분석 후 검수 화면에서 확인·수정합니다.
          </p>
          <input
            id="song-image"
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            className={styles.fileInput}
            disabled={disabled}
            onChange={(e) => void handleImageChange(e.target.files?.[0])}
          />
          {imageData ? (
            <img
              className={styles.preview}
              src={`data:${imageData.mimeType};base64,${imageData.base64}`}
              alt="악보 미리보기"
            />
          ) : null}
          {imageName ? (
            <p className={styles.fileName}>{imageName}</p>
          ) : null}
        </div>
      </div>

      <p className={styles.hint}>
        분석 결과는 검수 후 「라이브러리에 저장」할 때만 DB에 반영됩니다. 저장 전에
        나가면 결과가 사라집니다.
      </p>

      {localError ? <StatusBanner tone="error">{localError}</StatusBanner> : null}

      <Button fullWidth disabled={!canSubmit} onClick={handleSubmit}>
        분석 시작
      </Button>
    </div>
  );
}
