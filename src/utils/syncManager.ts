import { loadCachedRecords, getStorageMetadata } from './storage';
import { flushCachedRecordsToFirestore } from './firebaseStorage';
import { loadFieldInvestigations, syncOfflineDrafts } from './fieldToolkitStorage';
import { loadCachedAdnisReports, syncAllPendingAdnisReports } from '../services/adnisReportingService';

const PENDING_SURVEILLANCE_IDS_KEY = 'veterinary_surveillance_pending_ids';
const LAST_SYNC_TIMESTAMP_KEY = 'orvl_last_sync_timestamp';

export interface GranularSyncDetails {
  totalPending: number;
  surveillancePending: number;
  investigationsPending: number;
  samplesPending: number;
  adnisPending: number;
  totalCachedRecords: number;
  lastSyncTimestamp: number | null;
  isOnline: boolean;
  status: 'idle' | 'offline' | 'syncing' | 'error' | 'synced';
}

export interface SyncProgressUpdate {
  current: number;
  total: number;
  percent: number;
  stepMessage: string;
}

/**
 * Returns IDs of surveillance records marked as pending sync.
 */
export function getPendingSurveillanceRecordIds(): string[] {
  try {
    const raw = localStorage.getItem(PENDING_SURVEILLANCE_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Marks a surveillance record ID as pending synchronization.
 */
export function markRecordPendingSync(id: string): void {
  try {
    const ids = new Set(getPendingSurveillanceRecordIds());
    ids.add(id);
    localStorage.setItem(PENDING_SURVEILLANCE_IDS_KEY, JSON.stringify(Array.from(ids)));
    notifySyncListeners();
  } catch {}
}

/**
 * Clears pending surveillance records queue.
 */
export function clearPendingSurveillanceRecords(): void {
  try {
    localStorage.removeItem(PENDING_SURVEILLANCE_IDS_KEY);
    notifySyncListeners();
  } catch {}
}

/**
 * Notifies all listeners (in current and other tabs) of a sync state change.
 */
export function notifySyncListeners(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('orvl-sync-updated'));
  }
}

/**
 * Retrieves the last successful sync timestamp.
 */
export function getLastSyncTimestamp(): number | null {
  try {
    const raw = localStorage.getItem(LAST_SYNC_TIMESTAMP_KEY);
    return raw ? parseInt(raw, 10) : null;
  } catch {
    return null;
  }
}

/**
 * Updates the last successful sync timestamp.
 */
export function setLastSyncTimestamp(ts: number = Date.now()): void {
  try {
    localStorage.setItem(LAST_SYNC_TIMESTAMP_KEY, String(ts));
    notifySyncListeners();
  } catch {}
}

/**
 * Computes granular pending sync details across all Firestore entities.
 */
export function getGranularSyncDetails(): GranularSyncDetails {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  // 1. Surveillance records pending sync
  const pendingSurvIds = getPendingSurveillanceRecordIds();
  const surveillancePending = pendingSurvIds.length;

  // 2. Field investigations, samples, and lab results
  let investigationsPending = 0;
  let samplesPending = 0;
  try {
    const invs = loadFieldInvestigations();
    invs.forEach(inv => {
      if (inv.syncStatus === 'pending_sync' || inv.syncStatus === 'local_draft') {
        investigationsPending++;
      }
      inv.samples?.forEach(s => {
        if (s.syncStatus === 'pending_sync' || s.syncStatus === 'local_draft') {
          samplesPending++;
        }
      });
      inv.labResults?.forEach(l => {
        if (l.syncStatus === 'pending_sync' || l.syncStatus === 'local_draft') {
          samplesPending++;
        }
      });
    });
  } catch {
    // Non-blocking
  }

  // 3. ADNIS Outbreak and Zero reports
  let adnisPending = 0;
  try {
    const adnisReports = loadCachedAdnisReports();
    adnisPending = adnisReports.filter(
      r => r.report_status === 'SYNC_PENDING' || r.report_status === 'SYNC_ERROR'
    ).length;
  } catch {
    // Non-blocking
  }

  const totalPending = surveillancePending + investigationsPending + samplesPending + adnisPending;
  const storageMeta = getStorageMetadata();
  const lastSyncTimestamp = getLastSyncTimestamp();

  let status: GranularSyncDetails['status'] = 'idle';
  if (!isOnline) {
    status = 'offline';
  } else if (totalPending > 0) {
    status = 'idle';
  } else {
    status = 'synced';
  }

  return {
    totalPending,
    surveillancePending,
    investigationsPending,
    samplesPending,
    adnisPending,
    totalCachedRecords: storageMeta.recordCount,
    lastSyncTimestamp,
    isOnline,
    status
  };
}

/**
 * Synchronizes all pending local records (Surveillance, Field Toolkit, ADNIS) to Cloud Firestore.
 * Provides granular progress updates through callback.
 */
export async function syncAllPendingData(
  onProgress?: (progress: SyncProgressUpdate) => void
): Promise<{
  success: boolean;
  syncedCount: number;
  details: {
    surveillance: number;
    investigations: number;
    adnis: number;
  };
  errors: string[];
}> {
  const initialDetails = getGranularSyncDetails();
  const totalItems = Math.max(initialDetails.totalPending, 1);
  let processed = 0;
  const errors: string[] = [];
  const syncedDetails = {
    surveillance: 0,
    investigations: 0,
    adnis: 0
  };

  const updateProgress = (stepMessage: string) => {
    if (onProgress) {
      const percent = Math.min(100, Math.round((processed / totalItems) * 100));
      onProgress({
        current: processed,
        total: totalItems,
        percent,
        stepMessage
      });
    }
  };

  try {
    // Step 1: Flush surveillance records to Firestore
    updateProgress('Synchronizing Surveillance records to Firestore...');
    const allRecords = loadCachedRecords();
    const survResult = await flushCachedRecordsToFirestore(allRecords);
    if (survResult.success) {
      syncedDetails.surveillance = initialDetails.surveillancePending || survResult.count;
      processed += initialDetails.surveillancePending;
      clearPendingSurveillanceRecords();
    } else if (survResult.error) {
      errors.push(`Surveillance Records: ${survResult.error}`);
    }

    // Step 2: Flush Field Investigations & Samples
    updateProgress('Synchronizing Field Investigations & Laboratory samples...');
    const fieldResult = await syncOfflineDrafts();
    if (fieldResult.success) {
      syncedDetails.investigations = fieldResult.syncedCount;
      processed += (initialDetails.investigationsPending + initialDetails.samplesPending);
    } else {
      errors.push('Field Investigations sync was interrupted');
    }

    // Step 3: Flush ADNIS Field and Zero reports
    updateProgress('Transmitting ADNIS outbreak and zero reports...');
    const adnisResult = await syncAllPendingAdnisReports();
    syncedDetails.adnis = adnisResult.syncedCount;
    processed += initialDetails.adnisPending;
    if (adnisResult.errors && adnisResult.errors.length > 0) {
      errors.push(...adnisResult.errors);
    }

    // Finalize
    const totalSynced = syncedDetails.surveillance + syncedDetails.investigations + syncedDetails.adnis;
    setLastSyncTimestamp(Date.now());
    notifySyncListeners();

    updateProgress('Firestore synchronization completed.');

    return {
      success: errors.length === 0,
      syncedCount: totalSynced,
      details: syncedDetails,
      errors
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    errors.push(`General sync error: ${errMsg}`);
    return {
      success: false,
      syncedCount: 0,
      details: syncedDetails,
      errors
    };
  }
}
