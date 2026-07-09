import type { ExportData } from './storage';

// ============================================================
// GitHub Gist sync — push/pull ExportData to a private Gist
// ============================================================

const GIST_API = 'https://api.github.com/gists';
const GIST_FILENAME = 'gym-data.json';

/** Fetch data from a Gist. Returns null on any error (network, auth, etc.) */
export async function fetchGistData(
  token: string,
  gistId: string
): Promise<ExportData | null> {
  try {
    const res = await fetch(`${GIST_API}/${gistId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (!res.ok) return null;
    const gist = await res.json();
    const content = gist.files?.[GIST_FILENAME]?.content;
    if (!content) return null;
    const data = JSON.parse(content);
    if (!Array.isArray(data.exercises) || !Array.isArray(data.trainingDays)) {
      return null;
    }
    return data as ExportData;
  } catch {
    return null;
  }
}

/** Push data to a Gist. Returns true on success. */
export async function pushGistData(
  token: string,
  gistId: string,
  data: ExportData
): Promise<boolean> {
  try {
    const res = await fetch(`${GIST_API}/${gistId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(data, null, 2),
          },
        },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Create a new Gist and return its ID. Returns null on failure. */
export async function createGist(
  token: string,
  initialData: ExportData
): Promise<string | null> {
  try {
    const res = await fetch(GIST_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        description: 'GYM Training Data',
        public: false,
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(initialData, null, 2),
          },
        },
      }),
    });
    if (!res.ok) return null;
    const gist = await res.json();
    return gist.id as string;
  } catch {
    return null;
  }
}

export interface SyncConfig {
  enabled: boolean;
  token: string;
  gistId: string;
}

export function loadSyncConfig(): SyncConfig {
  try {
    const raw = localStorage.getItem('gym_sync_config');
    if (!raw) return { enabled: false, token: '', gistId: '' };
    return JSON.parse(raw) as SyncConfig;
  } catch {
    return { enabled: false, token: '', gistId: '' };
  }
}

export function saveSyncConfig(config: SyncConfig): void {
  localStorage.setItem('gym_sync_config', JSON.stringify(config));
}
