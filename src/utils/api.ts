import { AppState, Transaction } from '../types';

export interface DatabaseHealth {
  connected: boolean;
  status: string;
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let inFlightSyncCount = 0;
let syncGeneration = 0;

export function isCloudSyncBusy(): boolean {
  return saveTimeout !== null || inFlightSyncCount > 0;
}

export function getSyncGeneration(): number {
  return syncGeneration;
}

export function bumpSyncGeneration(): number {
  syncGeneration += 1;
  return syncGeneration;
}

export function cancelPendingStateSync(): void {
  if (saveTimeout !== null) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
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

export function syncStateToCloud(state: AppState): void {
  // Mark local state as newer immediately so in-flight polls cannot overwrite it
  bumpSyncGeneration();
  cancelPendingStateSync();

  // Debounce sync so frequent typing or slider changes batch into a single network call
  saveTimeout = setTimeout(async () => {
    saveTimeout = null;
    inFlightSyncCount += 1;
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
    } finally {
      inFlightSyncCount = Math.max(0, inFlightSyncCount - 1);
    }
  }, 500);
}

async function postClusterAction(
  url: string,
  body: unknown | undefined,
  errorLabel: string
): Promise<AppState | null> {
  bumpSyncGeneration();
  inFlightSyncCount += 1;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.state as AppState) || null;
  } catch (err) {
    console.warn(`${errorLabel}:`, err);
    return null;
  } finally {
    inFlightSyncCount = Math.max(0, inFlightSyncCount - 1);
  }
}

export async function saveTransactionInCloud(
  friendId: string,
  transaction: Transaction,
  fallbackState?: AppState
): Promise<AppState | null> {
  return postClusterAction(
    '/api/transactions',
    { friendId, transaction, fallbackState },
    'Failed to save transaction in cloud cluster'
  );
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
  return postClusterAction(
    `/api/transactions/${encodeURIComponent(txId)}/approval`,
    approvalData,
    'Failed to update transaction approval in cloud cluster'
  );
}

export async function requestTransactionDeletionInCloud(
  txId: string,
  payload: {
    deletionRequestedBy: string;
    deletionRespondentId: string;
  }
): Promise<AppState | null> {
  return postClusterAction(
    `/api/transactions/${encodeURIComponent(txId)}/deletion-request`,
    payload,
    'Failed to request transaction deletion in cloud cluster'
  );
}

export async function approveTransactionDeletionInCloud(txId: string): Promise<AppState | null> {
  return postClusterAction(
    `/api/transactions/${encodeURIComponent(txId)}/deletion-approve`,
    undefined,
    'Failed to approve transaction deletion in cloud cluster'
  );
}

export async function rejectTransactionDeletionInCloud(txId: string): Promise<AppState | null> {
  return postClusterAction(
    `/api/transactions/${encodeURIComponent(txId)}/deletion-reject`,
    undefined,
    'Failed to reject transaction deletion in cloud cluster'
  );
}
