import { AppState } from '../types';

export interface DatabaseHealth {
  connected: boolean;
  status: string;
}

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  try {
    const res = await fetch(`/api/health?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
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
    const res = await fetch(`/api/state?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store' },
    });
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

export async function updateTransactionApprovalInCloud(
  txId: string,
  approvalData: {
    approvalStatus: 'approved' | 'on_hold' | 'disputed_review' | 'rejected' | 'pending_approval';
    lockedUntil?: number;
    deniedAt?: number;
    reviewVotes?: Record<string, boolean>;
  }
): Promise<AppState | null> {
  try {
    const res = await fetch(`/api/transactions/${encodeURIComponent(txId)}/approval`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(approvalData),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.state as AppState;
  } catch (err) {
    console.warn('Failed to update transaction approval in cloud cluster:', err);
    return null;
  }
}

export async function requestTransactionDeletionInCloud(
  txId: string,
  payload: {
    deletionRequestedBy: string;
    deletionRespondentId: string;
  }
): Promise<AppState | null> {
  try {
    const res = await fetch(`/api/transactions/${encodeURIComponent(txId)}/deletion-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.state as AppState;
  } catch (err) {
    console.warn('Failed to request transaction deletion in cloud cluster:', err);
    return null;
  }
}

export async function approveTransactionDeletionInCloud(txId: string): Promise<AppState | null> {
  try {
    const res = await fetch(`/api/transactions/${encodeURIComponent(txId)}/deletion-approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.state as AppState;
  } catch (err) {
    console.warn('Failed to approve transaction deletion in cloud cluster:', err);
    return null;
  }
}

export async function rejectTransactionDeletionInCloud(txId: string): Promise<AppState | null> {
  try {
    const res = await fetch(`/api/transactions/${encodeURIComponent(txId)}/deletion-reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.state as AppState;
  } catch (err) {
    console.warn('Failed to reject transaction deletion in cloud cluster:', err);
    return null;
  }
}
