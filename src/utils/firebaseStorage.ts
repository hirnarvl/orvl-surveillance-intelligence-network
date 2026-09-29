import { collection, doc, setDoc, onSnapshot, query, where, limit, getDocs, writeBatch, enableNetwork } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { SurveillanceRecord, PersonnelRecord, DatasetMetadata, ImportBatchRecord } from '../types';
import { saveCachedRecords, loadCachedRecords } from './storage';
import { markRecordPendingSync, clearPendingSurveillanceRecords } from './syncManager';

export const BASELINE_COLLECTION = 'baseline_data';
export const CURRENT_COLLECTION = 'current_data';
export const LEGACY_COLLECTION = 'surveillanceRecords';
export const PERSONNEL_COLLECTION = 'personnel';
export const METADATA_COLLECTION = 'metadata';
export const BATCHES_COLLECTION = 'import_batches';

/**
 * Subscribes to the authoritative operational dataset from Firebase Firestore.
 * Merges baseline historical records with current surveillance stream.
 * Scopes queries to the authorized laboratory context to strictly isolate data.
 */
export function subscribeToFirestoreRecords(
  onUpdate: (records: SurveillanceRecord[]) => void,
  onError?: (err: unknown) => void,
  labId?: string
): () => void {
  let baselineRecords: SurveillanceRecord[] = [];
  let currentRecords: SurveillanceRecord[] = [];
  let legacyRecords: SurveillanceRecord[] = [];

  const broadcastMerged = () => {
    // Priority: Baseline + Current, fallback to legacy if baseline is not yet seeded
    const map = new Map<string, SurveillanceRecord>();
    
    // 1. Add baseline
    baselineRecords.forEach(r => map.set(r.id, r));
    // 2. Add current
    currentRecords.forEach(r => map.set(r.id, r));
    
    // If no baseline/current records found, use legacy
    if (map.size === 0 && legacyRecords.length > 0) {
      legacyRecords.forEach(r => map.set(r.id, r));
    }

    const merged = Array.from(map.values());
    if (merged.length > 0) {
      saveCachedRecords(merged);
      onUpdate(merged);
    }
  };

  const handleSnapshotError = (err: unknown, collName: string) => {
    const errMsg = err instanceof Error ? err.message : String(err);
    if (
      !errMsg.includes('closing') && 
      !errMsg.includes('hidden') && 
      !errMsg.includes('offline') && 
      !errMsg.includes('unavailable') &&
      !errMsg.includes('backend') &&
      !errMsg.includes('aborted')
    ) {
      handleFirestoreError(err, OperationType.LIST, collName);
    }
    const cached = loadCachedRecords(labId);
    if (cached && cached.length > 0) {
      onUpdate(cached);
    }
    if (onError) onError(err);
  };

  try {
    const normalizedLab = labId && labId !== 'all' ? labId.toLowerCase() : null;
    const labFilter = normalizedLab 
      ? [where('laboratoryId', 'in', [normalizedLab, normalizedLab.toUpperCase()])]
      : [];

    // 1. Baseline subscription (scoped by laboratoryId)
    const baselineQuery = query(collection(db, BASELINE_COLLECTION), ...labFilter, limit(2500));
    const unsubBaseline = onSnapshot(
      baselineQuery,
      { includeMetadataChanges: true },
      (snap) => {
        baselineRecords = snap.docs.map(d => ({ ...(d.data() as SurveillanceRecord), id: d.id }));
        broadcastMerged();
      },
      (err) => handleSnapshotError(err, BASELINE_COLLECTION)
    );

    // 2. Current subscription (scoped by laboratoryId)
    const currentQuery = query(collection(db, CURRENT_COLLECTION), ...labFilter, limit(1000));
    const unsubCurrent = onSnapshot(
      currentQuery,
      { includeMetadataChanges: true },
      (snap) => {
        currentRecords = snap.docs.map(d => ({ ...(d.data() as SurveillanceRecord), id: d.id }));
        broadcastMerged();
      },
      (err) => handleSnapshotError(err, CURRENT_COLLECTION)
    );

    // 3. Legacy fallback subscription (scoped by laboratoryId)
    const legacyQuery = query(collection(db, LEGACY_COLLECTION), ...labFilter, limit(1000));
    const unsubLegacy = onSnapshot(
      legacyQuery,
      { includeMetadataChanges: true },
      (snap) => {
        legacyRecords = snap.docs.map(d => ({ ...(d.data() as SurveillanceRecord), id: d.id }));
        broadcastMerged();
      },
      (err) => handleSnapshotError(err, LEGACY_COLLECTION)
    );

    return () => {
      unsubBaseline();
      unsubCurrent();
      unsubLegacy();
    };
  } catch (err) {
    handleSnapshotError(err, 'operational_dataset');
    return () => {};
  }
}

/**
 * Subscribes to the Personnel / Reporter Directory in real-time
 */
export function subscribeToPersonnel(
  onUpdate: (personnel: PersonnelRecord[]) => void,
  onError?: (err: unknown) => void,
  labId?: string
): () => void {
  try {
    const normalizedLab = labId && labId !== 'all' ? labId.toLowerCase() : null;
    const labFilter = normalizedLab 
      ? [where('laboratoryId', 'in', [normalizedLab, normalizedLab.toUpperCase()])]
      : [];

    const q = query(collection(db, PERSONNEL_COLLECTION), ...labFilter, limit(500));
    const unsub = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snap) => {
        const list = snap.docs.map(d => ({ ...(d.data() as PersonnelRecord), id: d.id }));
        onUpdate(list);
      },
      (err) => {
        const errMsg = err instanceof Error ? err.message : String(err);
        if (!errMsg.includes('offline') && !errMsg.includes('unavailable') && !errMsg.includes('hidden')) {
          handleFirestoreError(err, OperationType.LIST, PERSONNEL_COLLECTION);
        }
        if (onError) onError(err);
      }
    );
    return unsub;
  } catch (err) {
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Subscribes to Dataset Metadata
 */
export function subscribeToDatasetMetadata(
  onUpdate: (meta: DatasetMetadata | null) => void
): () => void {
  try {
    const docRef = doc(db, METADATA_COLLECTION, 'hrvl_operational_dataset');
    const unsub = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          onUpdate(snap.data() as DatasetMetadata);
        } else {
          onUpdate(null);
        }
      },
      () => {
        onUpdate(null);
      }
    );
    return unsub;
  } catch {
    return () => {};
  }
}

/**
 * Subscribes to Import Batches
 */
export function subscribeToImportBatches(
  onUpdate: (batches: ImportBatchRecord[]) => void,
  labId?: string
): () => void {
  try {
    const normalizedLab = labId && labId !== 'all' ? labId.toLowerCase() : null;
    const labFilter = normalizedLab 
      ? [where('laboratoryId', 'in', [normalizedLab, normalizedLab.toUpperCase()])]
      : [];

    const q = query(collection(db, BATCHES_COLLECTION), ...labFilter, limit(50));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map(d => ({ ...(d.data() as ImportBatchRecord), id: d.id }));
        onUpdate(list);
      },
      () => {}
    );
    return unsub;
  } catch {
    return () => {};
  }
}

/**
 * Flushes cached surveillance records from local state / storage to Firebase Firestore.
 * Performs batch writes to baseline_data and current_data with legacy surveillanceRecords mirroring.
 */
export async function flushCachedRecordsToFirestore(
  customRecords?: SurveillanceRecord[]
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    // Attempt to wake/enable network in Firestore if available
    try {
      await enableNetwork(db);
    } catch {
      // Non-blocking
    }

    const recordsToFlush = (customRecords && customRecords.length > 0)
      ? customRecords
      : loadCachedRecords();

    if (!recordsToFlush || recordsToFlush.length === 0) {
      return { success: true, count: 0 };
    }

    const CHUNK_SIZE = 400;
    let flushedCount = 0;

    for (let i = 0; i < recordsToFlush.length; i += CHUNK_SIZE) {
      const chunk = recordsToFlush.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);

      for (const rec of chunk) {
        const isBaseline = rec.isBaseline !== undefined
          ? rec.isBaseline
          : (rec.sourceYear ? rec.sourceYear < 2026 : false);
        const targetCollection = isBaseline ? BASELINE_COLLECTION : CURRENT_COLLECTION;
        const effectiveLabId = (rec.laboratoryId || (rec.zone === 'E/H' || rec.zone === 'W/H' ? 'hrvl' : 'arvl')).toLowerCase();

        const targetRef = doc(db, targetCollection, rec.id);
        batch.set(targetRef, {
          ...rec,
          laboratoryId: effectiveLabId,
          isBaseline,
          updatedAt: Date.now()
        }, { merge: true });

        const legacyRef = doc(db, LEGACY_COLLECTION, rec.id);
        batch.set(legacyRef, {
          ...rec,
          laboratoryId: effectiveLabId,
          isBaseline
        }, { merge: true });

        flushedCount++;
      }

      await batch.commit();
    }

    clearPendingSurveillanceRecords();
    return { success: true, count: flushedCount };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[Storage] Error flushing cached records to Firestore:', err);
    return { success: false, count: 0, error: errMsg };
  }
}

/**
 * Saves or updates a surveillance record in Firebase Firestore.
 * Writes to current_data and mirrors to legacy surveillanceRecords with guaranteed laboratoryId.
 */
export async function saveRecordToFirestore(record: SurveillanceRecord): Promise<boolean> {
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  if (isOffline) {
    markRecordPendingSync(record.id);
  }

  try {
    const isBaseline = record.sourceYear && record.sourceYear < 2026;
    const targetCollection = isBaseline ? BASELINE_COLLECTION : CURRENT_COLLECTION;
    const effectiveLabId = (record.laboratoryId || (record.zone === 'E/H' || record.zone === 'W/H' ? 'hrvl' : 'arvl')).toLowerCase();
    
    const docRef = doc(db, targetCollection, record.id);
    await setDoc(docRef, {
      ...record,
      laboratoryId: effectiveLabId,
      updatedAt: Date.now()
    }, { merge: true });

    // Legacy mirror
    const legacyRef = doc(db, LEGACY_COLLECTION, record.id);
    await setDoc(legacyRef, {
      ...record,
      laboratoryId: effectiveLabId
    }, { merge: true });

    if (!isOffline) {
      // Successfully pushed while online
    }
    return true;
  } catch (err) {
    markRecordPendingSync(record.id);
    handleFirestoreError(err, OperationType.WRITE, `${CURRENT_COLLECTION}/${record.id}`);
    return false;
  }
}

/**
 * Seeds initial surveillance records to Firestore if collections are empty.
 */
export async function seedRecordsToFirestore(records: SurveillanceRecord[]): Promise<void> {
  try {
    for (const record of records.slice(0, 100)) {
      const docRef = doc(db, BASELINE_COLLECTION, record.id);
      await setDoc(docRef, {
        ...record,
        isBaseline: true,
        dataQualityStatus: 'VERIFIED',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }, { merge: true });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, BASELINE_COLLECTION);
  }
}
