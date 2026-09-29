import { downloadDriveFileArrayBuffer, DriveFile } from './googleDrive';
import { SurveillanceRecord } from '../types';
import { 
  parseAdnisSpreadsheetBuffer, 
  commitAdnisBatchToFirestore, 
  ADNIS_ARCHIVE_FOLDER_ID 
} from './adnisImporter';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface DriveFolderSyncConfig {
  name: string;
  year: number;
  id: string;
  isBaseline: boolean;
  driveUrl: string;
}

export const DRIVE_FOLDERS: DriveFolderSyncConfig[] = [
  { 
    name: 'ADNIS Historical Archive (2-Year Baseline)', 
    year: 2024, 
    id: ADNIS_ARCHIVE_FOLDER_ID, 
    isBaseline: true,
    driveUrl: `https://drive.google.com/drive/folders/${ADNIS_ARCHIVE_FOLDER_ID}`
  },
  { 
    name: 'ADNIS_2025', 
    year: 2025, 
    id: '1PqTNHiMRTuMxwbMy9qPpjGoLzeny4o36', 
    isBaseline: true,
    driveUrl: 'https://drive.google.com/drive/folders/1PqTNHiMRTuMxwbMy9qPpjGoLzeny4o36'
  },
  { 
    name: 'ADNIS_2026', 
    year: 2026, 
    id: '15P2NgBhbC29NlGQ_LCJsEKydw-G1HHcJ', 
    isBaseline: false,
    driveUrl: 'https://drive.google.com/drive/folders/15P2NgBhbC29NlGQ_LCJsEKydw-G1HHcJ'
  }
];

export async function listFilesInFolder(accessToken: string, folderId: string): Promise<DriveFile[]> {
  const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  const fields = encodeURIComponent("files(id, name, mimeType, createdTime, modifiedTime, size)");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&pageSize=100`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch files from folder ${folderId}`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Fetches the cloud-stored extraction mechanism and Drive configuration
 */
export async function getCloudExtractionConfig(): Promise<DriveFolderSyncConfig[]> {
  try {
    const snap = await getDoc(doc(db, 'metadata', 'drive_sync_config'));
    if (snap.exists() && snap.data().configuredDrives) {
      return snap.data().configuredDrives;
    }
  } catch {
    // Non-blocking fallback to local constants
  }
  return DRIVE_FOLDERS;
}

/**
 * Syncs and processes all authorized surveillance archives from Google Drive,
 * extracting verified HRVL operational records and committing them durably
 * to Firestore's baseline_data and current_data collections.
 */
export async function sync2025And2026Data(accessToken: string): Promise<SurveillanceRecord[]> {
  const allAcceptedRecords: SurveillanceRecord[] = [];
  const configuredFolders = await getCloudExtractionConfig();
  let scopeAuthError: Error | null = null;

  for (const folder of configuredFolders) {
    try {
      const files = await listFilesInFolder(accessToken, folder.id);
      
      for (const file of files) {
        const name = file.name.toLowerCase();
        const mime = file.mimeType.toLowerCase();
        const isSpreadsheet = name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv') || mime.includes('spreadsheet') || mime.includes('excel') || mime.includes('csv');
        
        if (!isSpreadsheet) continue;

        try {
          const buffer = await downloadDriveFileArrayBuffer(accessToken, file.id, file.mimeType);
          const parsedResult = parseAdnisSpreadsheetBuffer(
            buffer, 
            file.name, 
            file.id, 
            folder.id, 
            folder.isBaseline, 
            folder.year
          );
          
          if (parsedResult.acceptedRecords.length > 0) {
            allAcceptedRecords.push(...parsedResult.acceptedRecords);
            // Write durably to cloud Firestore (baseline_data / current_data + personnel + metadata)
            await commitAdnisBatchToFirestore(parsedResult, folder.isBaseline);
          }
        } catch (fileErr) {
          console.error(`[Drive Sync] Error parsing file ${file.name}:`, fileErr);
        }
      }
    } catch (err: any) {
      console.error(`Error syncing folder ${folder.name} (${folder.id}):`, err);
      const errMsg = err?.message || String(err);
      if (errMsg.includes('insufficient authentication scopes') || errMsg.includes('403') || errMsg.includes('401')) {
        scopeAuthError = err instanceof Error ? err : new Error(errMsg);
      }
    }
  }

  if (allAcceptedRecords.length === 0 && scopeAuthError) {
    throw scopeAuthError;
  }

  // Record extraction mechanism execution in the Cloud
  try {
    await setDoc(doc(db, 'metadata', 'drive_sync_config'), {
      lastSyncTimestamp: Date.now(),
      lastSyncRecordCount: allAcceptedRecords.length,
      configuredDrives: configuredFolders,
      storageArchitecture: 'CLOUD_FIRST_FIRESTORE_DECOUPLED',
      collections: {
        baseline: 'baseline_data',
        current: 'current_data',
        personnel: 'personnel',
        batches: 'import_batches',
        legacyMirror: 'surveillanceRecords'
      }
    }, { merge: true });
  } catch {
    // Non-blocking
  }

  return allAcceptedRecords;
}
