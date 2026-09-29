import { SurveillanceRecord } from '../types';
import { ALL_SURVEILLANCE_RECORDS, INITIAL_SURVEILLANCE_RECORDS, ASELA_SURVEILLANCE_RECORDS } from '../data/sampleData';

const LOCAL_STORAGE_KEY = 'veterinary_surveillance_records_v2';
const LEGACY_HRVL_KEY = 'hrvl_surveillance_records_v1';
const LOCAL_STORAGE_TIMESTAMP_KEY = 'veterinary_surveillance_last_saved';

/**
 * Loads cached surveillance records from browser localStorage.
 * Automatically ensures both HRVL and ARVL records are available from the authoritative archive.
 */
export function loadCachedRecords(labId?: string): SurveillanceRecord[] {
  try {
    // Try primary key first, then legacy key
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem(LEGACY_HRVL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure multi-laboratory completeness if legacy cache only had HRVL
        const hasArvl = parsed.some(r => r.laboratoryId === 'arvl' || (r.zone !== 'E/H' && r.zone !== 'W/H'));
        const fullRecords = hasArvl ? parsed : [...parsed, ...ASELA_SURVEILLANCE_RECORDS];

        if (labId === 'hrvl') {
          return fullRecords.filter(r => r.laboratoryId === 'hrvl' || r.zone === 'E/H' || r.zone === 'W/H');
        }
        if (labId === 'arvl') {
          return fullRecords.filter(r => r.laboratoryId === 'arvl' || (r.zone !== 'E/H' && r.zone !== 'W/H'));
        }
        return fullRecords;
      }
    }
  } catch (err) {
    console.warn('[Storage] Failed to read surveillance records from localStorage:', err);
  }

  if (labId === 'hrvl') return INITIAL_SURVEILLANCE_RECORDS;
  if (labId === 'arvl') return ASELA_SURVEILLANCE_RECORDS;
  return ALL_SURVEILLANCE_RECORDS;
}

/**
 * Saves current surveillance records to browser localStorage for offline field resilience.
 */
export function saveCachedRecords(records: SurveillanceRecord[]): boolean {
  try {
    const serialized = JSON.stringify(records);
    localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
    const nowIso = new Date().toISOString();
    localStorage.setItem(LOCAL_STORAGE_TIMESTAMP_KEY, nowIso);
    return true;
  } catch (err) {
    console.error('[HRVL Storage] Failed to cache records in localStorage:', err);
    return false;
  }
}

/**
 * Clears cached surveillance records from localStorage and resets back to initial default.
 */
export function clearCachedRecords(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_TIMESTAMP_KEY);
  } catch (err) {
    console.error('[HRVL Storage] Failed to clear localStorage cache:', err);
  }
}

/**
 * Returns diagnostic metadata regarding local storage cache state.
 */
export function getStorageMetadata(): {
  hasCache: boolean;
  recordCount: number;
  lastSavedTimestamp: string | null;
  approxSizeKB: number;
} {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const timestamp = localStorage.getItem(LOCAL_STORAGE_TIMESTAMP_KEY);
    if (!raw) {
      return {
        hasCache: false,
        recordCount: 0,
        lastSavedTimestamp: null,
        approxSizeKB: 0
      };
    }
    const sizeInKB = Math.round((raw.length * 2) / 1024); // approx UTF-16 bytes
    const parsed = JSON.parse(raw);
    return {
      hasCache: true,
      recordCount: Array.isArray(parsed) ? parsed.length : 0,
      lastSavedTimestamp: timestamp,
      approxSizeKB: sizeInKB
    };
  } catch (err) {
    return {
      hasCache: false,
      recordCount: 0,
      lastSavedTimestamp: null,
      approxSizeKB: 0
    };
  }
}
