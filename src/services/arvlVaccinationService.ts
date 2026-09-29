import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  ARVLVaccinationRecord, 
  VaccineDictionaryEntry, 
  ARVLAuditLogEntry,
  ARVLAuditAction,
  RawMonthlyTargets,
  EthiopianFiscalMonthKey
} from '../types/arvlVaccination';
import { 
  INITIAL_ARVL_VACCINATION_CALENDAR, 
  INITIAL_VACCINE_DICTIONARY,
  parseTargetCodes,
  MONTH_ORDER,
  MONTH_LABELS
} from '../data/arvlVaccinationData';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const STORAGE_KEY_RECORDS = 'arvl_vaccination_calendar_records_v1';
const STORAGE_KEY_DICTIONARY = 'arvl_vaccine_dictionary_v1';
const STORAGE_KEY_AUDIT = 'arvl_vaccination_audit_logs_v1';

const COLLECTION_CALENDAR = 'arvl_vaccination_calendar';
const COLLECTION_DICTIONARY = 'arvl_vaccine_dictionary';
const COLLECTION_AUDIT = 'arvl_vaccination_audit';

// In-memory fallback / cache
let cachedRecords: ARVLVaccinationRecord[] = [];
let cachedDictionary: VaccineDictionaryEntry[] = [];
let cachedAuditLogs: ARVLAuditLogEntry[] = [];

/**
 * 1. Initialize local cache from localStorage or default master data
 */
function initLocalCache() {
  try {
    const rawRecs = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (rawRecs) {
      cachedRecords = JSON.parse(rawRecs);
    } else {
      cachedRecords = [...INITIAL_ARVL_VACCINATION_CALENDAR];
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(cachedRecords));
    }

    const rawDict = localStorage.getItem(STORAGE_KEY_DICTIONARY);
    if (rawDict) {
      cachedDictionary = JSON.parse(rawDict);
    } else {
      cachedDictionary = [...INITIAL_VACCINE_DICTIONARY];
      localStorage.setItem(STORAGE_KEY_DICTIONARY, JSON.stringify(cachedDictionary));
    }

    const rawAudit = localStorage.getItem(STORAGE_KEY_AUDIT);
    if (rawAudit) {
      cachedAuditLogs = JSON.parse(rawAudit);
    }
  } catch (err) {
    console.warn('Local storage reading error for ARVL calendar, using defaults:', err);
    cachedRecords = [...INITIAL_ARVL_VACCINATION_CALENDAR];
    cachedDictionary = [...INITIAL_VACCINE_DICTIONARY];
  }
}

initLocalCache();

/**
 * 2. Record an Audit Action
 */
export async function logARVLAction(
  action: ARVLAuditAction,
  recordId: string,
  recordName: string,
  actor: { uid?: string; name?: string },
  details?: { reason?: string; oldValue?: string; newValue?: string }
): Promise<void> {
  const entry: ARVLAuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    action,
    recordId,
    recordName,
    actorUserId: actor.uid || 'anonymous-user',
    actorName: actor.name || 'Veterinary Health Officer',
    timestamp: Date.now(),
    reason: details?.reason,
    oldValue: details?.oldValue,
    newValue: details?.newValue
  };

  cachedAuditLogs.unshift(entry);
  if (cachedAuditLogs.length > 500) {
    cachedAuditLogs = cachedAuditLogs.slice(0, 500);
  }

  try {
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(cachedAuditLogs));
  } catch {
    // Ignore quota issues
  }

  try {
    const ref = doc(db, COLLECTION_AUDIT, entry.id);
    await setDoc(ref, entry);
  } catch {
    // Firestore offline fallback
  }
}

/**
 * 3. Subscribe or Fetch Calendar Records
 */
export function subscribeToARVLCalendar(
  onData: (records: ARVLVaccinationRecord[]) => void,
  onError?: (err: any) => void
): () => void {
  // Emit local cache immediately for snappy instant rendering
  onData(cachedRecords.length > 0 ? cachedRecords : INITIAL_ARVL_VACCINATION_CALENDAR);

  try {
    const colRef = collection(db, COLLECTION_CALENDAR);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteRecords: ARVLVaccinationRecord[] = [];
          snapshot.forEach((docSnap) => {
            remoteRecords.push(docSnap.data() as ARVLVaccinationRecord);
          });
          cachedRecords = remoteRecords;
          try {
            localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(remoteRecords));
          } catch {}
          onData(remoteRecords);
        } else {
          // If Firestore is empty, upload seed master dataset in background
          seedFirestoreCalendarIfEmpty();
        }
      },
      (error) => {
        console.warn('Firestore subscription offline for ARVL calendar, using cached records:', error);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not initialize snapshot listener for ARVL calendar:', err);
    return () => {};
  }
}

/**
 * Seed initial data if remote collection is empty
 */
async function seedFirestoreCalendarIfEmpty() {
  try {
    const colRef = collection(db, COLLECTION_CALENDAR);
    const snap = await getDocs(query(colRef, limit(1)));
    if (snap.empty) {
      for (const rec of INITIAL_ARVL_VACCINATION_CALENDAR) {
        await setDoc(doc(db, COLLECTION_CALENDAR, rec.id), rec);
      }
    }
  } catch {
    // Offline mode expected
  }
}

/**
 * 4. Save (Create or Update) Calendar Record
 */
export async function saveARVLRecord(
  record: ARVLVaccinationRecord,
  actor: { uid?: string; name?: string }
): Promise<void> {
  const existingIdx = cachedRecords.findIndex(r => r.id === record.id);
  const isNew = existingIdx === -1;
  const oldVal = !isNew ? JSON.stringify(cachedRecords[existingIdx]) : undefined;

  const updatedRecord: ARVLVaccinationRecord = {
    ...record,
    updatedAt: Date.now(),
    updatedBy: actor.name || 'Veterinary Officer'
  };

  if (isNew) {
    cachedRecords.unshift(updatedRecord);
  } else {
    cachedRecords[existingIdx] = updatedRecord;
  }

  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(cachedRecords));
  } catch {}

  await logARVLAction(
    isNew ? 'ADD_DISTRICT' : 'EDIT_MONTH',
    record.id,
    `${record.district} (${record.zone})`,
    actor,
    { oldValue: oldVal, newValue: JSON.stringify(updatedRecord) }
  );

  try {
    const docRef = doc(db, COLLECTION_CALENDAR, record.id);
    await setDoc(docRef, updatedRecord);
  } catch (err) {
    console.warn('Saved ARVL record to local cache (Firestore offline):', err);
  }
}

/**
 * 5. Delete Calendar Record
 */
export async function deleteARVLRecord(
  recordId: string,
  actor: { uid?: string; name?: string }
): Promise<void> {
  const existing = cachedRecords.find(r => r.id === recordId);
  const districtName = existing ? `${existing.district} (${existing.zone})` : recordId;

  cachedRecords = cachedRecords.filter(r => r.id !== recordId);
  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(cachedRecords));
  } catch {}

  await logARVLAction(
    'DELETE_RECORD',
    recordId,
    districtName,
    actor,
    { oldValue: existing ? JSON.stringify(existing) : undefined }
  );

  try {
    const docRef = doc(db, COLLECTION_CALENDAR, recordId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Deleted ARVL record locally (Firestore offline):', err);
  }
}

/**
 * 6. Vaccine Dictionary CRUD
 */
export function getVaccineDictionary(): VaccineDictionaryEntry[] {
  return cachedDictionary.length > 0 ? cachedDictionary : INITIAL_VACCINE_DICTIONARY;
}

export async function saveVaccineDictionaryEntry(
  entry: VaccineDictionaryEntry,
  actor: { uid?: string; name?: string }
): Promise<void> {
  const idx = cachedDictionary.findIndex(d => d.code.toLowerCase() === entry.code.toLowerCase());
  if (idx !== -1) {
    cachedDictionary[idx] = entry;
  } else {
    cachedDictionary.push(entry);
  }

  try {
    localStorage.setItem(STORAGE_KEY_DICTIONARY, JSON.stringify(cachedDictionary));
  } catch {}

  await logARVLAction(
    'DICTIONARY_UPDATE',
    entry.code,
    `${entry.code} - ${entry.officialName}`,
    actor,
    { newValue: JSON.stringify(entry) }
  );

  try {
    const docRef = doc(db, COLLECTION_DICTIONARY, entry.code);
    await setDoc(docRef, entry);
  } catch {}
}

/**
 * 7. Copy / Roll Forward Planning Year
 */
export async function copyPlanningYear(
  sourceYear: string,
  targetYear: string,
  actor: { uid?: string; name?: string }
): Promise<number> {
  const sourceRecords = cachedRecords.filter(r => r.planningYear === sourceYear);
  if (sourceRecords.length === 0) return 0;

  let copiedCount = 0;
  for (const src of sourceRecords) {
    const newId = `arvl-cal-${targetYear.replace(/\//g, '-')}-${src.district.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const newRecord: ARVLVaccinationRecord = {
      ...src,
      id: newId,
      planningYear: targetYear,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: actor.name || 'Administrator',
      source: `Rolled forward from ${sourceYear}`
    };

    // Check if target already exists
    const exists = cachedRecords.some(r => r.id === newId || (r.planningYear === targetYear && r.district.toLowerCase() === src.district.toLowerCase() && r.zone.toLowerCase() === src.zone.toLowerCase()));
    if (!exists) {
      cachedRecords.push(newRecord);
      copiedCount++;
      try {
        const docRef = doc(db, COLLECTION_CALENDAR, newId);
        setDoc(docRef, newRecord);
      } catch {}
    }
  }

  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(cachedRecords));
  } catch {}

  await logARVLAction(
    'COPY_PLANNING_YEAR',
    targetYear,
    `Copied ${copiedCount} district plans from ${sourceYear} to ${targetYear}`,
    actor
  );

  return copiedCount;
}

/**
 * 8. Audit Logs Fetcher
 */
export function getAuditLogs(): ARVLAuditLogEntry[] {
  return [...cachedAuditLogs];
}

/**
 * 9. CSV Export Helper
 */
export function exportCalendarToCSV(records: ARVLVaccinationRecord[], fileName: string = 'ARVL_Vaccination_Calendar.csv'): void {
  const headers = [
    'Region',
    'Zone',
    'District',
    'Planning Year',
    'July (Q1)',
    'August (Q1)',
    'September (Q1)',
    'October (Q2)',
    'November (Q2)',
    'December (Q2)',
    'January (Q3)',
    'February (Q3)',
    'March (Q3)',
    'April (Q4)',
    'May (Q4)',
    'June (Q4)',
    'Remark'
  ];

  const escapeCSV = (str: string | undefined | null) => {
    if (!str) return '""';
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const rows = records.map(r => [
    escapeCSV(r.region),
    escapeCSV(r.zone),
    escapeCSV(r.district),
    escapeCSV(r.planningYear),
    escapeCSV(r.rawMonths.july || r.months.july?.join(', ')),
    escapeCSV(r.rawMonths.august || r.months.august?.join(', ')),
    escapeCSV(r.rawMonths.september || r.months.september?.join(', ')),
    escapeCSV(r.rawMonths.october || r.months.october?.join(', ')),
    escapeCSV(r.rawMonths.november || r.months.november?.join(', ')),
    escapeCSV(r.rawMonths.december || r.months.december?.join(', ')),
    escapeCSV(r.rawMonths.january || r.months.january?.join(', ')),
    escapeCSV(r.rawMonths.february || r.months.february?.join(', ')),
    escapeCSV(r.rawMonths.march || r.months.march?.join(', ')),
    escapeCSV(r.rawMonths.april || r.months.april?.join(', ')),
    escapeCSV(r.rawMonths.may || r.months.may?.join(', ')),
    escapeCSV(r.rawMonths.june || r.months.june?.join(', ')),
    escapeCSV(r.remark)
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 10. CSV Parser & Importer
 */
export function parseCalendarCSV(csvText: string): Partial<ARVLVaccinationRecord>[] {
  const lines = csvText.split(/\r\n|\n|\r/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Simple CSV line parser taking quotes into account
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const parsedRecords: Partial<ARVLVaccinationRecord>[] = [];
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    if (cols.length >= 3 && cols[2]) {
      const region = cols[0] || 'Oromia ARVL';
      const zone = cols[1] || 'Arsi';
      const district = cols[2];
      const planningYear = cols[3] || '2026/27';

      const rawMonths: RawMonthlyTargets = {
        july: cols[4] || '',
        august: cols[5] || '',
        september: cols[6] || '',
        october: cols[7] || '',
        november: cols[8] || '',
        december: cols[9] || '',
        january: cols[10] || '',
        february: cols[11] || '',
        march: cols[12] || '',
        april: cols[13] || '',
        may: cols[14] || '',
        june: cols[15] || ''
      };

      const remark = cols[16] || '';

      parsedRecords.push({
        id: `import-${Date.now()}-${i}`,
        region,
        zone,
        district,
        planningYear,
        rawMonths,
        months: {
          july: parseTargetCodes(rawMonths.july),
          august: parseTargetCodes(rawMonths.august),
          september: parseTargetCodes(rawMonths.september),
          october: parseTargetCodes(rawMonths.october),
          november: parseTargetCodes(rawMonths.november),
          december: parseTargetCodes(rawMonths.december),
          january: parseTargetCodes(rawMonths.january),
          february: parseTargetCodes(rawMonths.february),
          march: parseTargetCodes(rawMonths.march),
          april: parseTargetCodes(rawMonths.april),
          may: parseTargetCodes(rawMonths.may),
          june: parseTargetCodes(rawMonths.june)
        },
        remark,
        source: 'CSV Import'
      });
    }
  }

  return parsedRecords;
}

/**
 * 11. PDF Export Generator
 */
export function exportCalendarToPDF(
  records: ARVLVaccinationRecord[],
  options: {
    planningYear?: string;
    filterZone?: string;
    filterQuarter?: string;
    filterTarget?: string;
  } = {}
): void {
  const doc = new jsPDF('landscape');

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 297, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ARVL VACCINATION CALENDAR — LIVESTOCK VACCINATION PLANNING', 14, 11);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Animal Resources and Livestock-related Veterinary Vaccination Planning & Monitoring | Asela Regional Veterinary Laboratory', 14, 18);

  // Subtitle / Filters Metadata
  doc.setTextColor(51, 65, 85); // slate-700
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Planning Year: ${options.planningYear || 'All'}`, 14, 30);
  doc.text(`Zone: ${options.filterZone || 'All'}`, 80, 30);
  doc.text(`Quarter: ${options.filterQuarter || 'All'}`, 140, 30);
  doc.text(`Target Filter: ${options.filterTarget || 'All'}`, 190, 30);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 250, 30);

  // Status Disclaimer Banner
  doc.setFillColor(254, 243, 199); // amber-100
  doc.rect(14, 34, 269, 7, 'F');
  doc.setTextColor(146, 64, 14); // amber-800
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('STATUS: PLANNED / SCHEDULED VACCINATION ACTIVITIES — SCHEDULED ≠ COMPLETED (Preserves Ethiopian Fiscal Planning Structure: July–June)', 17, 38.5);

  const tableColumns = [
    { header: 'Zone', dataKey: 'zone' },
    { header: 'District', dataKey: 'district' },
    { header: 'Jul', dataKey: 'july' },
    { header: 'Aug', dataKey: 'august' },
    { header: 'Sep', dataKey: 'september' },
    { header: 'Oct', dataKey: 'october' },
    { header: 'Nov', dataKey: 'november' },
    { header: 'Dec', dataKey: 'december' },
    { header: 'Jan', dataKey: 'january' },
    { header: 'Feb', dataKey: 'february' },
    { header: 'Mar', dataKey: 'march' },
    { header: 'Apr', dataKey: 'april' },
    { header: 'May', dataKey: 'may' },
    { header: 'Jun', dataKey: 'june' },
    { header: 'Remark', dataKey: 'remark' }
  ];

  const tableRows = records.map(r => ({
    zone: r.zone,
    district: r.district,
    july: r.months.july?.join(', ') || '-',
    august: r.months.august?.join(', ') || '-',
    september: r.months.september?.join(', ') || '-',
    october: r.months.october?.join(', ') || '-',
    november: r.months.november?.join(', ') || '-',
    december: r.months.december?.join(', ') || '-',
    january: r.months.january?.join(', ') || '-',
    february: r.months.february?.join(', ') || '-',
    march: r.months.march?.join(', ') || '-',
    april: r.months.april?.join(', ') || '-',
    may: r.months.may?.join(', ') || '-',
    june: r.months.june?.join(', ') || '-',
    remark: r.remark ? (r.remark.length > 25 ? r.remark.substring(0, 23) + '...' : r.remark) : '-'
  }));

  autoTable(doc, {
    startY: 44,
    columns: tableColumns,
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      fontSize: 6.8,
      cellPadding: 1.5,
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // slate-50
    },
    columnStyles: {
      zone: { cellWidth: 26, fontStyle: 'bold' },
      district: { cellWidth: 28, fontStyle: 'bold' },
      july: { cellWidth: 16, halign: 'center' },
      august: { cellWidth: 16, halign: 'center' },
      september: { cellWidth: 16, halign: 'center' },
      october: { cellWidth: 16, halign: 'center' },
      november: { cellWidth: 16, halign: 'center' },
      december: { cellWidth: 16, halign: 'center' },
      january: { cellWidth: 16, halign: 'center' },
      february: { cellWidth: 16, halign: 'center' },
      march: { cellWidth: 16, halign: 'center' },
      april: { cellWidth: 16, halign: 'center' },
      may: { cellWidth: 16, halign: 'center' },
      june: { cellWidth: 16, halign: 'center' },
      remark: { cellWidth: 35 }
    }
  });

  doc.save(`ARVL_Vaccination_Calendar_${options.planningYear || 'Annual'}.pdf`);
}
