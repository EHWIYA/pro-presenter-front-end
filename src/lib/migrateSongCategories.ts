import { ApiError, createSongCategory, isMockMode } from '@/api';
import type { SongCategoryRecord } from '@/api';

const LEGACY_STORAGE_KEY = 'pro-presenter:song-categories:custom';
const MIGRATION_FLAG_KEY = 'pro-presenter:song-categories:migrated-v1';

interface LegacyCustomRecord {
  id: `custom:${string}`;
  label: string;
}

function readLegacyCustom(): LegacyCustomRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is LegacyCustomRecord =>
        typeof row === 'object' &&
        row !== null &&
        typeof (row as LegacyCustomRecord).id === 'string' &&
        (row as LegacyCustomRecord).id.startsWith('custom:') &&
        typeof (row as LegacyCustomRecord).label === 'string',
    );
  } catch {
    return [];
  }
}

function markMigrated(): void {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    localStorage.setItem(MIGRATION_FLAG_KEY, '1');
  } catch {
    // ignore quota / private mode
  }
}

/** localStorage custom → 서버 POST (최초 1회). 새로 올린 항목이 있으면 true */
export async function migrateLegacySongCategories(
  serverCustom: SongCategoryRecord[],
): Promise<boolean> {
  if (isMockMode() || typeof window === 'undefined') return false;
  if (localStorage.getItem(MIGRATION_FLAG_KEY)) return false;

  const legacy = readLegacyCustom();
  if (legacy.length === 0) {
    markMigrated();
    return false;
  }

  const serverIds = new Set(serverCustom.map((row) => row.id));
  const serverLabels = new Set(serverCustom.map((row) => row.label.trim()));
  let changed = false;

  for (const row of legacy) {
    if (serverIds.has(row.id) || serverLabels.has(row.label.trim())) {
      continue;
    }
    try {
      await createSongCategory({ label: row.label.trim() });
      changed = true;
    } catch (err) {
      if (err instanceof ApiError && (err.status === 409 || err.status === 422)) {
        continue;
      }
      return false;
    }
  }

  markMigrated();
  return changed;
}
