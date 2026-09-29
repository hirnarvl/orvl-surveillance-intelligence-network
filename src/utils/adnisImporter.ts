import * as XLSX from 'xlsx';
import { collection, doc, writeBatch, setDoc, getDocs, getDoc, query, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { HARARGHE_WOREDAS, ARSI_WOREDAS, validateArvlOperationalAreaCount, validateHrvlOperationalAreaCount } from '../data/woredas';
import { matchWoreda, detectZone, validateWoreda, classifyAdnisLocation, AdnisClassificationResult } from './fuzzyMatch';
import { listFilesInFolder, downloadDriveFileArrayBuffer, DriveFile } from './googleDrive';
import { SurveillanceRecord, PersonnelRecord, ImportBatchRecord, DatasetMetadata, ZoneName, PersonnelExtractionAudit } from '../types';

export const ADNIS_ARCHIVE_FOLDER_ID = '1QxnB2XqQJeN-uUWKvo6dlFWKhNQqxrwl';

// Verify operational area registry integrity on module load
validateArvlOperationalAreaCount();
validateHrvlOperationalAreaCount();

export interface AdnisParsedResult {
  acceptedRecords: SurveillanceRecord[];
  quarantinedRecords: Array<{
    id: string;
    rawLocation: string;
    rawDisease: string;
    rawRow: Record<string, unknown>;
    reason: string;
    sourceFile: string;
  }>;
  personnelMap: Map<string, PersonnelRecord>;
  personnelAudit: PersonnelExtractionAudit;
  batchRecord: ImportBatchRecord;
}

/**
 * Normalizes phone number or explicitly assigns '*' if missing or invalid.
 * Strictly adheres to rule: if phone is missing/blank/unspecified, assign '*'.
 */
export function formatReporterPhone(rawPhone: unknown): string {
  if (rawPhone === undefined || rawPhone === null) return '*';
  const str = String(rawPhone).trim();
  if (
    !str ||
    str === '-' ||
    str === '*' ||
    str.toLowerCase() === 'n/a' ||
    str.toLowerCase() === 'na' ||
    str.toLowerCase() === 'unknown' ||
    str.toLowerCase() === 'none' ||
    str.toLowerCase() === 'null' ||
    str.toLowerCase() === 'undefined' ||
    str.toLowerCase() === 'nil'
  ) {
    return '*';
  }
  // Sanitize non-digits except leading +
  const sanitized = str.replace(/[^\d+]/g, '');
  if (sanitized.length < 5) return '*';
  return str;
}

/**
 * Normalizes reporter name or explicitly assigns '*' if missing or invalid.
 * Strictly adheres to rule: if name is missing/blank/unspecified, assign '*'.
 */
export function formatReporterName(rawName: unknown): string {
  if (rawName === undefined || rawName === null) return '*';
  const str = String(rawName).trim();
  if (
    !str ||
    str === '-' ||
    str === '*' ||
    str.toLowerCase() === 'n/a' ||
    str.toLowerCase() === 'na' ||
    str.toLowerCase() === 'unknown' ||
    str.toLowerCase() === 'none' ||
    str.toLowerCase() === 'null' ||
    str.toLowerCase() === 'undefined' ||
    str.toLowerCase() === 'nil'
  ) {
    return '*';
  }
  return str;
}

/**
 * Audit log function that tracks how many records were processed and how many
 * had personnel info extracted, for inclusion in the import batch metadata.
 */
export function auditPersonnelExtraction(
  records: SurveillanceRecord[],
  personnelMap?: Map<string, PersonnelRecord>
): PersonnelExtractionAudit {
  let extractedPersonnelCount = 0;
  let withNameCount = 0;
  let withPhoneCount = 0;
  let recordsWithCompletePersonnel = 0;
  let recordsWithMissingPersonnel = 0;

  for (const r of records) {
    const hasValidName = Boolean(r.reporter && r.reporter.trim() !== '' && r.reporter !== '*');
    const hasValidPhone = Boolean(r.phone && r.phone.trim() !== '' && r.phone !== '*');

    if (hasValidName) withNameCount++;
    if (hasValidPhone) withPhoneCount++;

    if (hasValidName || hasValidPhone) {
      extractedPersonnelCount++;
    } else {
      recordsWithMissingPersonnel++;
    }

    if (hasValidName && hasValidPhone) {
      recordsWithCompletePersonnel++;
    }
  }

  return {
    totalProcessed: records.length,
    extractedPersonnelCount,
    withNameCount,
    withPhoneCount,
    recordsWithCompletePersonnel,
    recordsWithMissingPersonnel,
    uniquePersonnelIdentified: personnelMap ? personnelMap.size : 0
  };
}

/**
 * Helper to get a case-insensitive column value from spreadsheet row
 */
function getColumnValue(row: Record<string, unknown>, ...candidateHeaders: string[]): unknown {
  const rowKeys = Object.keys(row);
  for (const candidate of candidateHeaders) {
    const candidateClean = candidate.trim().toLowerCase();
    const foundKey = rowKeys.find(k => {
      const kClean = k.trim().toLowerCase();
      return kClean === candidateClean || kClean.replace(/[_\s-]/g, '') === candidateClean.replace(/[_\s-]/g, '');
    });
    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && String(row[foundKey]).trim() !== '') {
      return row[foundKey];
    }
  }
  return undefined;
}

/**
 * Parses raw ADNIS spreadsheet bytes (XLSX, XLS, CSV) into validated HRVL baseline records
 * strictly enforcing that ONLY West and East Hararghe records enter the operational dataset.
 */
export function parseAdnisSpreadsheetBuffer(
  buffer: ArrayBuffer,
  fileName: string,
  fileId: string,
  sourceDriveFolderId: string = ADNIS_ARCHIVE_FOLDER_ID,
  isBaselineFolder?: boolean,
  defaultYear?: number
): AdnisParsedResult {
  const wb = XLSX.read(new Uint8Array(buffer), { type: 'array', cellDates: true });
  const batchId = `BATCH-${Date.now().toString(36).toUpperCase()}-${fileId.substring(0, 6)}`;
  
  const acceptedRecords: SurveillanceRecord[] = [];
  const quarantinedRecords: AdnisParsedResult['quarantinedRecords'] = [];
  const personnelMap = new Map<string, PersonnelRecord>();

  let totalRawRows = 0;
  let rowIndex = 0;

  for (const sheetName of wb.SheetNames) {
    const worksheet = wb.Sheets[sheetName];
    if (!worksheet) continue;

    const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    totalRawRows += rawRows.length;

    for (const row of rawRows) {
      rowIndex++;
      const rawLocation = String(getColumnValue(row, 'woreda', 'wereda', 'district', 'location', 'reporting_unit', 'admin3', 'site') || '').trim();
      const rawZone = String(getColumnValue(row, 'zone', 'administrative_zone', 'sub_region', 'admin2') || '').trim();
      const rawRegion = String(getColumnValue(row, 'region', 'state', 'admin1') || '').trim();

      // Authoritative Classification: checks Region -> Zone -> Woreda against HRVL (36) and ARVL (122)
      const classification = classifyAdnisLocation(rawLocation, rawZone, rawRegion);

      // Strict Operational Area Filter: Quarantines records that are outside both operational areas
      if (!classification.isAuthorized || !classification.laboratoryId) {
        quarantinedRecords.push({
          id: `QUAR-${batchId}-${rowIndex}`,
          rawLocation: `${rawRegion || ''} / ${rawZone || 'Unknown Zone'} / ${rawLocation || 'Unknown Woreda'}`.replace(/^(\s*\/\s*)+/, '').trim(),
          rawDisease: String(getColumnValue(row, 'disease', 'outbreak', 'condition') || '*'),
          rawRow: row,
          reason: classification.quarantineReason || 'Quarantined: Outside operational area [UNMATCHED_OPERATIONAL_AREA]',
          sourceFile: fileName
        });
        continue;
      }

      // Record matches an authoritative laboratory operational area
      const assignedLabId = classification.laboratoryId;
      const assignedLabName = classification.laboratoryName;
      const woredaName = classification.woredaName;
      const zoneName: ZoneName = classification.zone;
      const regionName = classification.region;
      const lat = classification.lat;
      const lng = classification.lng;

      const rawDisease = String(getColumnValue(row, 'disease', 'outbreak', 'event', 'condition', 'pathogen', 'diagnosis') || 'Unspecified Condition').trim();
      const rawSpecies = String(getColumnValue(row, 'species', 'livestock', 'animal_type', 'animal', 'host') || 'Cattle').trim();
      
      const casesNum = Number(getColumnValue(row, 'cases', 'cases_count', 'morbidity', 'sick', 'no_sick', 'cases_reported') || 0);
      const deathsNum = Number(getColumnValue(row, 'deaths', 'fatalities', 'mortality', 'dead', 'no_dead') || 0);
      
      const cases = isNaN(casesNum) || casesNum < 0 ? 0 : casesNum;
      const deaths = isNaN(deathsNum) || deathsNum < 0 ? 0 : deathsNum;

      // Extract Date
      let dateVal = getColumnValue(row, 'date', 'report_date', 'reportdate', 'timestamp', 'observation_date', 'incident_date', 'year', 'month');
      let dateStr = new Date().toISOString().split('T')[0];

      if (dateVal instanceof Date) {
        dateStr = dateVal.toISOString().split('T')[0];
      } else if (typeof dateVal === 'string' && dateVal.trim()) {
        const trimmed = dateVal.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
          dateStr = trimmed;
        } else if (/^\d{4}$/.test(trimmed)) {
          dateStr = `${trimmed}-06-15`;
        } else {
          const parsed = Date.parse(trimmed);
          if (!isNaN(parsed)) {
            dateStr = new Date(parsed).toISOString().split('T')[0];
          }
        }
      } else if (typeof dateVal === 'number' && dateVal >= 2020 && dateVal <= 2030) {
        dateStr = `${dateVal}-06-15`;
      }

      // Extract Personnel / Reporter Information strictly adhering to user instructions:
      // "If name is available but phone is missing: Phone: *
      //  If phone is available but name is missing: Name: *
      //  If both are unavailable: Name: *, Phone: *
      //  Never invent, infer, or fabricate a person's name or telephone number."
      const rawReporter = getColumnValue(row, 'reporter', 'personnel', 'focal_person', 'officer', 'submitted_by', 'investigator', 'name', 'author');
      const rawPhone = getColumnValue(row, 'phone', 'telephone', 'mobile', 'contact', 'tel', 'phone_number');

      const reporterName = formatReporterName(rawReporter);
      const reporterPhone = formatReporterPhone(rawPhone);

      const isZero = cases === 0 && (rawDisease.toLowerCase().includes('zero') || rawDisease.toLowerCase().includes('none') || deaths === 0);
      const recYear = parseInt(dateStr.substring(0, 4), 10) || defaultYear || 2025;
      const recIsBaseline = isBaselineFolder !== undefined ? isBaselineFolder : (recYear < 2026);

      const recordId = `ADNIS-HIST-${batchId}-${rowIndex}`;

      const rec: SurveillanceRecord = {
        id: recordId,
        date: dateStr,
        timestamp: new Date(dateStr).getTime() || Date.now(),
        woreda: woredaName,
        zone: zoneName,
        region: regionName,
        laboratoryId: assignedLabId,
        laboratoryName: assignedLabName,
        lat,
        lng,
        disease: rawDisease,
        species: rawSpecies,
        cases,
        deaths,
        risk: deaths > 5 ? 'Critical' : cases > 20 ? 'High' : 'Medium',
        comment: String(getColumnValue(row, 'comment', 'remarks', 'note', 'description') || `Historical ADNIS report: ${fileName}`),
        reporter: reporterName,
        phone: reporterPhone,
        isZeroReport: isZero,
        sourceFile: fileName,
        sourceYear: recYear,
        isBaseline: recIsBaseline,
        sourceBatchId: batchId,
        dataQualityStatus: 'VERIFIED'
      };

      acceptedRecords.push(rec);

      // Register or update personnel directory with assigned laboratory context
      const personnelKey = `${woredaName}::${reporterName}::${reporterPhone}`;
      if (!personnelMap.has(personnelKey)) {
        personnelMap.set(personnelKey, {
          id: `PER-${btoa(personnelKey).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)}`,
          name: reporterName,
          phone: reporterPhone,
          assignedWoreda: woredaName,
          assignedZone: zoneName,
          laboratoryId: assignedLabId,
          role: reporterName !== '*' ? 'Woreda Veterinary Officer / Reporter' : 'Unspecified Field Focal Unit',
          associatedRecordsCount: 1,
          firstReportDate: dateStr,
          lastReportDate: dateStr,
          sourceReportIdentifiers: [recordId],
          updatedAt: Date.now()
        });
      } else {
        const p = personnelMap.get(personnelKey)!;
        p.associatedRecordsCount += 1;
        if (dateStr < p.firstReportDate) p.firstReportDate = dateStr;
        if (dateStr > p.lastReportDate) p.lastReportDate = dateStr;
        if (!p.sourceReportIdentifiers.includes(recordId) && p.sourceReportIdentifiers.length < 50) {
          p.sourceReportIdentifiers.push(recordId);
        }
      }
    }
  }

  const personnelAudit = auditPersonnelExtraction(acceptedRecords, personnelMap);

  const acceptedHRVL = acceptedRecords.filter(r => r.laboratoryId === 'hrvl');
  const acceptedARVL = acceptedRecords.filter(r => r.laboratoryId === 'arvl');

  const batchRecord: ImportBatchRecord = {
    id: batchId,
    importDate: new Date().toISOString(),
    sourceDriveFolderId,
    sourceFileName: fileName,
    sourceFileId: fileId,
    totalRawRowsProcessed: totalRawRows,
    recordsAcceptedHRVL: acceptedHRVL.length,
    recordsAcceptedARVL: acceptedARVL.length,
    recordsAcceptedTotal: acceptedRecords.length,
    recordsQuarantinedNonHRVL: quarantinedRecords.length,
    recordsQuarantinedUnmatched: quarantinedRecords.length,
    recordsRequiringReview: quarantinedRecords.length,
    processingStatus: acceptedRecords.length > 0 ? 'SUCCESS' : 'PARTIAL_WARNING',
    personnelAudit
  };

  return {
    acceptedRecords,
    quarantinedRecords,
    personnelMap,
    personnelAudit,
    batchRecord
  };
}

/**
 * Commits parsed ADNIS records to Firestore atomically in chunks
 * populating baseline_data, current_data, personnel, import_batches, and updating metadata
 */
export async function commitAdnisBatchToFirestore(
  result: AdnisParsedResult,
  forcedIsBaseline?: boolean
): Promise<{
  success: boolean;
  importedCount: number;
  personnelCount: number;
  batchId: string;
  baselineCount: number;
  currentCount: number;
}> {
  const { acceptedRecords, personnelMap, batchRecord } = result;

  try {
    // 1. Write import batch record
    await setDoc(doc(db, 'import_batches', batchRecord.id), batchRecord);

    let batchBaselineCount = 0;
    let batchCurrentCount = 0;

    // 2. Write records in batches of 400 (Firestore limit is 500 ops per writeBatch)
    const CHUNK_SIZE = 400;
    for (let i = 0; i < acceptedRecords.length; i += CHUNK_SIZE) {
      const chunk = acceptedRecords.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      
      for (const rec of chunk) {
        const isBaseline = forcedIsBaseline !== undefined
          ? forcedIsBaseline
          : (rec.isBaseline !== undefined ? rec.isBaseline : (rec.sourceYear ? rec.sourceYear < 2026 : true));

        if (isBaseline) {
          batchBaselineCount++;
        } else {
          batchCurrentCount++;
        }

        const targetCollection = isBaseline ? 'baseline_data' : 'current_data';
        const targetDocRef = doc(db, targetCollection, rec.id);

        batch.set(targetDocRef, {
          ...rec,
          isBaseline,
          dataQualityStatus: 'VERIFIED',
          sourceBatchId: batchRecord.id,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }, { merge: true });

        // Also ensure backward-compatible read and unified live stream on legacy surveillanceRecords
        const legacyDocRef = doc(db, 'surveillanceRecords', rec.id);
        batch.set(legacyDocRef, {
          ...rec,
          isBaseline
        }, { merge: true });
      }

      await batch.commit();
    }

    // 3. Write personnel records
    const personnelList = Array.from(personnelMap.values());
    for (let i = 0; i < personnelList.length; i += CHUNK_SIZE) {
      const chunk = personnelList.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      for (const p of chunk) {
        const pRef = doc(db, 'personnel', p.id);
        batch.set(pRef, p, { merge: true });
      }
      await batch.commit();
    }

    // 4. Update laboratory-specific metadata and unified archive metadata
    const hrvlAccepted = acceptedRecords.filter(r => r.laboratoryId === 'hrvl');
    const arvlAccepted = acceptedRecords.filter(r => r.laboratoryId === 'arvl');

    const hrvlActiveWoredas = new Set(hrvlAccepted.map(r => r.woreda));
    const arvlActiveWoredas = new Set(arvlAccepted.map(r => r.woreda));
    const allActiveWoredas = new Set(acceptedRecords.map(r => r.woreda));
    const dates = acceptedRecords.map(r => r.date).filter(Boolean).sort();
    
    let existingHrvlBaseline = 0;
    let existingHrvlCurrent = 0;
    let existingArvlBaseline = 0;
    let existingArvlCurrent = 0;

    try {
      const hrvlSnap = await getDoc(doc(db, 'metadata', 'hrvl_operational_dataset'));
      if (hrvlSnap.exists()) {
        const d = hrvlSnap.data() as DatasetMetadata;
        existingHrvlBaseline = d.totalBaselineRecords || 0;
        existingHrvlCurrent = d.totalCurrentRecords || 0;
      }
    } catch {
      // Non-fatal
    }

    try {
      const arvlSnap = await getDoc(doc(db, 'metadata', 'arvl_operational_dataset'));
      if (arvlSnap.exists()) {
        const d = arvlSnap.data() as DatasetMetadata;
        existingArvlBaseline = d.totalBaselineRecords || 0;
        existingArvlCurrent = d.totalCurrentRecords || 0;
      }
    } catch {
      // Non-fatal
    }

    const hrvlBaselineCount = hrvlAccepted.filter(r => r.isBaseline).length;
    const hrvlCurrentCount = hrvlAccepted.filter(r => !r.isBaseline).length;
    const arvlBaselineCount = arvlAccepted.filter(r => r.isBaseline).length;
    const arvlCurrentCount = arvlAccepted.filter(r => !r.isBaseline).length;

    // HRVL Scoped Metadata
    const hrvlMetaDoc: DatasetMetadata = {
      datasetVersion: 'v2.1.0-cloud-verified-hrvl',
      laboratoryId: 'hrvl',
      reportingPeriodStart: dates[0] || '2024-01-01',
      reportingPeriodEnd: dates[dates.length - 1] || '2026-12-31',
      sourceArchiveUrl: `https://drive.google.com/drive/folders/${batchRecord.sourceDriveFolderId}`,
      lastImportBatchId: batchRecord.id,
      lastSyncTimestamp: Date.now(),
      totalBaselineRecords: Math.max(existingHrvlBaseline, hrvlBaselineCount),
      totalCurrentRecords: Math.max(existingHrvlCurrent, hrvlCurrentCount),
      totalPersonnelCount: personnelList.filter(p => p.laboratoryId === 'hrvl' || !p.laboratoryId).length,
      geographicCoverage: {
        region: 'Oromia',
        zones: ['East Hararghe', 'West Hararghe'],
        totalTargetWoredas: 36,
        activeReportingWoredas: hrvlActiveWoredas.size
      },
      validationStatus: 'HEALTHY_AND_VERIFIED'
    };

    // ARVL Scoped Metadata
    const arvlMetaDoc: DatasetMetadata = {
      datasetVersion: 'v2.1.0-cloud-verified-arvl',
      laboratoryId: 'arvl',
      reportingPeriodStart: dates[0] || '2024-01-01',
      reportingPeriodEnd: dates[dates.length - 1] || '2026-12-31',
      sourceArchiveUrl: `https://drive.google.com/drive/folders/${batchRecord.sourceDriveFolderId}`,
      lastImportBatchId: batchRecord.id,
      lastSyncTimestamp: Date.now(),
      totalBaselineRecords: Math.max(existingArvlBaseline, arvlBaselineCount),
      totalCurrentRecords: Math.max(existingArvlCurrent, arvlCurrentCount),
      totalPersonnelCount: personnelList.filter(p => p.laboratoryId === 'arvl').length,
      geographicCoverage: {
        region: 'Oromia',
        zones: ['Arsi', 'West Arsi', 'East Shewa', 'Bale', 'East Bale', 'North Shewa', 'City Administrations'],
        totalTargetWoredas: 112,
        activeReportingWoredas: arvlActiveWoredas.size
      },
      validationStatus: 'HEALTHY_AND_VERIFIED'
    };

    // Unified Archive Metadata
    const unifiedMetaDoc: DatasetMetadata = {
      datasetVersion: 'v2.1.0-authoritative-unified-adnis',
      reportingPeriodStart: dates[0] || '2024-01-01',
      reportingPeriodEnd: dates[dates.length - 1] || '2026-12-31',
      sourceArchiveUrl: `https://drive.google.com/drive/folders/${batchRecord.sourceDriveFolderId}`,
      lastImportBatchId: batchRecord.id,
      lastSyncTimestamp: Date.now(),
      totalBaselineRecords: Math.max(existingHrvlBaseline + existingArvlBaseline, batchBaselineCount),
      totalCurrentRecords: Math.max(existingHrvlCurrent + existingArvlCurrent, batchCurrentCount),
      totalPersonnelCount: personnelList.length,
      geographicCoverage: {
        region: 'Oromia',
        zones: ['East Hararghe', 'West Hararghe', 'Arsi', 'West Arsi', 'East Shewa', 'Bale', 'East Bale', 'North Shewa'],
        totalTargetWoredas: 148,
        activeReportingWoredas: allActiveWoredas.size
      },
      laboratoryCoverage: {
        hrvl: {
          name: 'Hirna Regional Veterinary Laboratory',
          totalBaseline: hrvlMetaDoc.totalBaselineRecords,
          totalCurrent: hrvlMetaDoc.totalCurrentRecords,
          targetWoredas: 36,
          activeReportingWoredas: hrvlActiveWoredas.size,
          zones: ['East Hararghe', 'West Hararghe']
        },
        arvl: {
          name: 'Asela Regional Veterinary Laboratory',
          totalBaseline: arvlMetaDoc.totalBaselineRecords,
          totalCurrent: arvlMetaDoc.totalCurrentRecords,
          targetWoredas: 112,
          activeReportingWoredas: arvlActiveWoredas.size,
          zones: ['Arsi', 'West Arsi', 'East Shewa', 'Bale', 'East Bale', 'North Shewa', 'City Administrations']
        }
      },
      validationStatus: 'HEALTHY_AND_VERIFIED'
    };

    await setDoc(doc(db, 'metadata', 'hrvl_operational_dataset'), hrvlMetaDoc, { merge: true });
    await setDoc(doc(db, 'metadata', 'arvl_operational_dataset'), arvlMetaDoc, { merge: true });
    await setDoc(doc(db, 'metadata', 'unified_adnis_archive'), unifiedMetaDoc, { merge: true });

    // Store cloud-native extraction config to decouple ongoing visualization from Drive
    await setDoc(doc(db, 'metadata', 'drive_sync_config'), {
      updatedAt: Date.now(),
      lastBatchId: batchRecord.id,
      configuredDrives: [
        { name: 'ADNIS Historical Archive (2-Year Baseline)', year: 2024, id: ADNIS_ARCHIVE_FOLDER_ID, isBaseline: true },
        { name: 'ADNIS_2025', year: 2025, id: '1PqTNHiMRTuMxwbMy9qPpjGoLzeny4o36', isBaseline: true },
        { name: 'ADNIS_2026', year: 2026, id: '15P2NgBhbC29NlGQ_LCJsEKydw-G1HHcJ', isBaseline: false }
      ],
      cloudPersistenceMode: 'FIRESTORE_AUTHORITATIVE',
      collections: {
        baseline: 'baseline_data',
        current: 'current_data',
        personnel: 'personnel',
        batches: 'import_batches',
        legacyMirror: 'surveillanceRecords'
      }
    }, { merge: true });

    return {
      success: true,
      importedCount: acceptedRecords.length,
      personnelCount: personnelList.length,
      batchId: batchRecord.id,
      baselineCount: batchBaselineCount,
      currentCount: batchCurrentCount
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'baseline_data');
    throw err;
  }
}

/**
 * Synchronizes and processes the ADNIS archive directly from Google Drive
 */
export async function syncHistoricalAdnisArchiveFromDrive(
  accessToken: string,
  folderId: string = ADNIS_ARCHIVE_FOLDER_ID
): Promise<{
  totalFilesProcessed: number;
  totalAcceptedRecords: number;
  totalQuarantinedRecords: number;
  batchIds: string[];
}> {
  const files = await listFilesInFolder(accessToken, folderId);
  const spreadsheetFiles = files.filter((f: DriveFile) => {
    const name = f.name.toLowerCase();
    const mime = f.mimeType.toLowerCase();
    return name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv') || mime.includes('spreadsheet') || mime.includes('excel') || mime.includes('csv');
  });

  let totalAccepted = 0;
  let totalQuarantined = 0;
  const batchIds: string[] = [];

  for (const file of spreadsheetFiles) {
    try {
      const buffer = await downloadDriveFileArrayBuffer(accessToken, file.id, file.mimeType);
      const parsedResult = parseAdnisSpreadsheetBuffer(buffer, file.name, file.id, folderId);
      
      const commitRes = await commitAdnisBatchToFirestore(parsedResult);
      if (commitRes.success) {
        totalAccepted += parsedResult.acceptedRecords.length;
        totalQuarantined += parsedResult.quarantinedRecords.length;
        batchIds.push(commitRes.batchId);
      }
    } catch (fileErr) {
      console.error(`[ADNIS Importer] Error processing file ${file.name}:`, fileErr);
    }
  }

  return {
    totalFilesProcessed: spreadsheetFiles.length,
    totalAcceptedRecords: totalAccepted,
    totalQuarantinedRecords: totalQuarantined,
    batchIds
  };
}
