import { AppState } from '../types';

export interface DatabaseHealth {
  connected: boolean;
  status: string;
}

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return { connected: false, status: 'error' };
    const data = await res.json();
    return {
      connected: data.database === 'connected',
      status: data.database || 'disconnected',
    };
  } catch {
    return { connected: false, status: 'offline' };
  }
}

export async function fetchCloudState(): Promise<AppState | null> {
  try {
    const res = await fetch('/api/state');
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.state) {
      return data.state as AppState;
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch state from MongoDB Atlas, falling back to local cache:', err);
    return null;
  }
}

let saveTimeout: any = null;

export function syncStateToCloud(state: AppState): void {
  // Debounce sync so frequent typing or slider changes batch into a single network call
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(async () => {
    try {
      await fetch('/api/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(state),
      });
    } catch (err) {
      console.warn('Failed to sync state to MongoDB Atlas:', err);
    }
  }, 500);
}
