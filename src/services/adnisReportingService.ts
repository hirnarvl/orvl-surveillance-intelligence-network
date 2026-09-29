import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { AdnisReport, WoredaReportingCompleteness } from '../types/adnisReporting';
import { INITIAL_DEMO_ADNIS_REPORTS } from '../data/adnisMetadata';
import { HARARGHE_WOREDAS, ARSI_WOREDAS, ALL_OPERATIONAL_WOREDAS, getWoredasForLaboratory } from '../data/woredas';
import { validateWoreda, classifyAdnisLocation } from '../utils/fuzzyMatch';
import { SurveillanceRecord, ZoneName, RiskLevel } from '../types';
import { getLaboratory, LABORATORIES_REGISTRY } from '../data/laboratories';
import { saveRecordToFirestore } from '../utils/firebaseStorage';
import { logAuditEvent } from './auditLogger';

const ADNIS_REPORTS_STORAGE_KEY = 'adnis_native_reports_v2';
const ADNIS_DEVICE_ID_KEY = 'adnis_client_device_id';

/**
 * Custom error class for reporting validation failures
 */
export class EpidemiologicalValidationError extends Error {
  errors: string[];
  constructor(errors: string[]) {
    super(`Epidemiological Validation Failed: ${errors.join('; ')}`);
    this.name = 'EpidemiologicalValidationError';
    this.errors = errors;
  }
}

/**
 * Validates an ADNIS report strictly against epidemiological constraints and GPS integrity rules
 * before database write or synchronization.
 */
export function validateAdnisReport(report: AdnisReport, targetLabId?: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 1. Basic Report Integrity
  if (!report.id || typeof report.id !== 'string') {
    errors.push('Report ID is missing or invalid');
  }
  if (!report.report_date || !report.report_date.trim()) {
    errors.push('Report date is required');
  }
  if (!report.district || !report.district.trim()) {
    errors.push('Administrative district (Woreda) is required');
  } else {
    const labIdForCheck = report.laboratoryId || targetLabId;
    const woredaValidation = validateWoreda(report.district, labIdForCheck);
    if (!woredaValidation.isValid) {
      errors.push(`Woreda '${report.district}' is not authorized for laboratory catchment (${labIdForCheck || 'all'}) [UNMATCHED_WOREDA]`);
    }
  }
  if (!report.reporting_unit || !report.reporting_unit.trim()) {
    errors.push('Reporting unit (Kebele / Clinic) is required');
  }
  if (!report.reporter_name || !report.reporter_name.trim()) {
    errors.push('Reporter name is required');
  }

  // 2. Species Validation
  if (!Array.isArray(report.species) || report.species.length === 0) {
    errors.push('At least one animal species must be specified');
  }

  // 3. Epidemiological Mathematical Invariant: 0 <= Deaths <= Cases <= At Risk
  const atRisk = Number(report.at_risk ?? 0);
  const cases = Number(report.cases ?? 0);
  const deaths = Number(report.deaths ?? 0);

  if (isNaN(atRisk) || isNaN(cases) || isNaN(deaths)) {
    errors.push('Epidemiological counts (at_risk, cases, deaths) must be valid numbers');
  } else {
    if (atRisk < 0) errors.push('Population at risk cannot be negative');
    if (cases < 0) errors.push('Reported cases cannot be negative');
    if (deaths < 0) errors.push('Reported deaths cannot be negative');

    if (cases > atRisk) {
      errors.push(`Reported cases (${cases}) cannot exceed population at risk (${atRisk})`);
    }
    if (deaths > cases) {
      errors.push(`Reported deaths (${deaths}) cannot exceed reported cases (${cases})`);
    }
  }

  // 4. Report Type Specific Validation
  if (report.report_type === 'FIELD_REPORT') {
    if (cases < 1) {
      errors.push('A Field / Outbreak Report requires at least 1 reported case (use Zero Report for 0 cases)');
    }
    if (!Array.isArray(report.symptoms) || report.symptoms.length === 0) {
      errors.push('A Field / Outbreak Report requires at least one clinical sign / symptom to be selected');
    }
    if (!report.tentative_diagnosis || !report.tentative_diagnosis.trim()) {
      errors.push('A Field / Outbreak Report requires a tentative diagnosis');
    }
  } else if (report.report_type === 'ZERO_REPORT') {
    if (cases !== 0 || deaths !== 0) {
      errors.push('A Zero Surveillance Report must have exactly 0 cases and 0 deaths');
    }
  } else {
    errors.push(`Invalid report type: ${report.report_type}`);
  }

  // 5. Strict GPS Integrity Validation (No centroid fabrication)
  if (report.gps_status === 'GPS_ACQUIRED') {
    if (report.latitude === null || report.longitude === null || isNaN(Number(report.latitude)) || isNaN(Number(report.longitude))) {
      errors.push('Report marked as GPS_ACQUIRED must contain valid numeric latitude and longitude');
    } else {
      const lat = Number(report.latitude);
      const lng = Number(report.longitude);
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        errors.push(`GPS Coordinates (${lat}, ${lng}) are outside valid geographic range`);
      }
    }
  } else if (report.gps_status === 'GPS_UNAVAILABLE') {
    if (report.latitude !== null || report.longitude !== null) {
      errors.push('Report marked as GPS_UNAVAILABLE must have null coordinates to prevent coordinate fabrication');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get or initialize a unique device ID for collision-resistant offline reporting
 */
export function getOrCreateDeviceId(): string {
  try {
    let devId = localStorage.getItem(ADNIS_DEVICE_ID_KEY);
    if (!devId) {
      devId = `dev-rvl-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem(ADNIS_DEVICE_ID_KEY, devId);
    }
    return devId;
  } catch {
    return `dev-rvl-temp-${Date.now()}`;
  }
}

/**
 * Loads all ADNIS reports from local offline storage
 */
export function loadCachedAdnisReports(): AdnisReport[] {
  try {
    const raw = localStorage.getItem(ADNIS_REPORTS_STORAGE_KEY);
    if (!raw) {
      // Seed with initial realistic demonstration reports if fresh
      saveCachedAdnisReports(INITIAL_DEMO_ADNIS_REPORTS);
      return INITIAL_DEMO_ADNIS_REPORTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DEMO_ADNIS_REPORTS;
  } catch {
    return INITIAL_DEMO_ADNIS_REPORTS;
  }
}

/**
 * Persists ADNIS reports into local offline cache
 */
export function saveCachedAdnisReports(reports: AdnisReport[]): void {
  try {
    localStorage.setItem(ADNIS_REPORTS_STORAGE_KEY, JSON.stringify(reports));
  } catch (err) {
    console.warn('Local storage quota warning for ADNIS reports:', err);
  }
}

/**
 * Saves or updates a draft report locally
 */
export function saveAdnisDraft(draft: AdnisReport): AdnisReport {
  const current = loadCachedAdnisReports();
  const index = current.findIndex(r => r.id === draft.id || r.client_report_id === draft.client_report_id);
  
  const updatedReport: AdnisReport = {
    ...draft,
    report_status: 'DRAFT',
    updated_at: Date.now()
  };

  let updatedList: AdnisReport[];
  if (index >= 0) {
    updatedList = [...current];
    updatedList[index] = updatedReport;
  } else {
    updatedList = [updatedReport, ...current];
  }

  saveCachedAdnisReports(updatedList);
  return updatedReport;
}

/**
 * Deletes a draft report
 */
export function deleteAdnisDraft(idOrClientId: string): boolean {
  const current = loadCachedAdnisReports();
  const filtered = current.filter(r => r.id !== idOrClientId && r.client_report_id !== idOrClientId);
  saveCachedAdnisReports(filtered);
  return true;
}

/**
 * Finalizes and queues an ADNIS report for synchronization.
 * If online, immediately triggers sync to Firestore.
 */
export async function finalizeAndSubmitAdnisReport(
  report: AdnisReport,
  isOnline: boolean = navigator.onLine
): Promise<{ report: AdnisReport; synced: boolean; surveillanceRecord?: SurveillanceRecord }> {
  // Service-layer epidemiological and GPS validation before any persistence or sync
  const validation = validateAdnisReport(report);
  if (!validation.isValid) {
    throw new EpidemiologicalValidationError(validation.errors);
  }

  // Dynamically resolve laboratory ID using report.laboratoryId or automatic classification
  let resolvedLabId = report.laboratoryId;
  if (!resolvedLabId) {
    const classification = classifyAdnisLocation(report.district, report.zone, report.region);
    resolvedLabId = classification.laboratoryId || 'hrvl';
  }

  const now = Date.now();
  const finalizedReport: AdnisReport = {
    ...report,
    laboratoryId: resolvedLabId,
    report_status: isOnline ? 'SYNCED' : 'SYNC_PENDING',
    finalized_at: now,
    submitted_at: now,
    updated_at: now,
    synced_at: isOnline ? now : null
  };

  // Convert to host SurveillanceRecord if Field Report so Dashboard/GIS gets it
  let mappedRecord: SurveillanceRecord | undefined = undefined;
  if (finalizedReport.report_type === 'FIELD_REPORT') {
    mappedRecord = mapAdnisReportToSurveillanceRecord(finalizedReport);
    finalizedReport.surveillance_record_id = mappedRecord.id;
  }

  // Save to local cache first
  const current = loadCachedAdnisReports();
  const index = current.findIndex(r => r.id === report.id || r.client_report_id === report.client_report_id);
  let updatedList: AdnisReport[];
  if (index >= 0) {
    updatedList = [...current];
    updatedList[index] = finalizedReport;
  } else {
    updatedList = [finalizedReport, ...current];
  }
  saveCachedAdnisReports(updatedList);

  // If online, sync to Firestore
  let syncSuccess = false;
  if (isOnline) {
    try {
      await syncSingleAdnisReportToFirestore(finalizedReport);
      syncSuccess = true;
    } catch (err) {
      console.warn('Firestore sync postponed to background queue:', err);
      finalizedReport.report_status = 'SYNC_PENDING';
      finalizedReport.sync_error_message = String(err);
      saveCachedAdnisReports(updatedList);
    }
  }

  // Audit trail
  await logAuditEvent({
    actorUserId: finalizedReport.reporter_id || 'anonymous',
    actorName: finalizedReport.reporter_name || 'Field Veterinarian',
    actorRole: finalizedReport.reporter_role || 'field_veterinarian',
    action: 'DATA_MODIFICATION',
    details: `Submitted native ADNIS ${finalizedReport.report_type} for ${finalizedReport.district} woreda (${finalizedReport.zone}) [Lab: ${finalizedReport.laboratoryId}]. Status: ${finalizedReport.report_status}`,
    organizationLevel: `${finalizedReport.zone} - ${finalizedReport.district}`,
    metadata: {
      reportId: finalizedReport.id,
      clientReportId: finalizedReport.client_report_id,
      reportType: finalizedReport.report_type,
      laboratoryId: finalizedReport.laboratoryId,
      species: finalizedReport.species,
      cases: finalizedReport.cases,
      deaths: finalizedReport.deaths,
      woreda: finalizedReport.district,
      zone: finalizedReport.zone,
      gpsAccuracy: finalizedReport.gps_accuracy,
      gpsStatus: finalizedReport.gps_status
    }
  });

  return { report: finalizedReport, synced: syncSuccess, surveillanceRecord: mappedRecord };
}

/**
 * Synchronizes a single ADNIS report to Firestore (idempotent write by ID)
 */
export async function syncSingleAdnisReportToFirestore(report: AdnisReport): Promise<void> {
  // Enforce service-layer validation before writing to Firestore
  const validation = validateAdnisReport(report);
  if (!validation.isValid) {
    throw new EpidemiologicalValidationError(validation.errors);
  }

  const collectionName = report.report_type === 'FIELD_REPORT' ? 'adnis_field_reports' : 'adnis_zero_reports';
  const docRef = doc(db, collectionName, report.id);
  
  await setDoc(docRef, {
    ...report,
    synced_at: Date.now(),
    server_received_at: Date.now()
  }, { merge: true });

  // If Field Report, also mirror to main surveillance stream
  if (report.report_type === 'FIELD_REPORT') {
    const survRec = mapAdnisReportToSurveillanceRecord(report);
    await saveRecordToFirestore(survRec);
  }
}

/**
 * Flushes all pending and errored reports to Firestore
 */
export async function syncAllPendingAdnisReports(): Promise<{
  syncedCount: number;
  failedCount: number;
  errors: string[];
}> {
  const allReports = loadCachedAdnisReports();
  const pending = allReports.filter(r => r.report_status === 'SYNC_PENDING' || r.report_status === 'SYNC_ERROR');
  
  if (pending.length === 0) {
    return { syncedCount: 0, failedCount: 0, errors: [] };
  }

  let syncedCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  const updatedReports = [...allReports];

  for (const rep of pending) {
    try {
      await syncSingleAdnisReportToFirestore(rep);
      const idx = updatedReports.findIndex(r => r.id === rep.id);
      if (idx >= 0) {
        updatedReports[idx] = {
          ...updatedReports[idx],
          report_status: 'SYNCED',
          synced_at: Date.now(),
          sync_error_message: undefined
        };
      }
      syncedCount++;
    } catch (err) {
      failedCount++;
      const errMsg = err instanceof Error ? err.message : String(err);
      errors.push(`${rep.district} (${rep.report_type}): ${errMsg}`);
      const idx = updatedReports.findIndex(r => r.id === rep.id);
      if (idx >= 0) {
        updatedReports[idx] = {
          ...updatedReports[idx],
          report_status: 'SYNC_ERROR',
          sync_error_message: errMsg
        };
      }
      handleFirestoreError(err, OperationType.WRITE, `adnis_reports/${rep.id}`);
    }
  }

  saveCachedAdnisReports(updatedReports);
  return { syncedCount, failedCount, errors };
}

/**
 * Transforms an ADNIS Field Report into the host application's SurveillanceRecord
 */
export function mapAdnisReportToSurveillanceRecord(report: AdnisReport): SurveillanceRecord {
  // Dynamically resolve laboratory ID using report.laboratoryId or automatic classification
  let labId = report.laboratoryId;
  if (!labId) {
    const classification = classifyAdnisLocation(report.district, report.zone, report.region);
    labId = classification.laboratoryId || 'hrvl';
  }

  const labInfo = getLaboratory(labId);
  const woredaValidation = validateWoreda(report.district, labId);
  const matchedWoredaObj = woredaValidation.matchedWoreda;
  const woredaName = woredaValidation.isValid ? woredaValidation.woredaName : (matchedWoredaObj?.name || report.district || 'UNMATCHED_WOREDA');
  
  const zoneFormatted: ZoneName = woredaValidation.isValid 
    ? woredaValidation.zone 
    : (matchedWoredaObj?.zone || (report.zone as ZoneName) || 'E/H');

  // Calculate risk level based on CFR and mortality
  let calculatedRisk: RiskLevel = 'Low';
  if (report.deaths > 10 || (report.cases > 30 && report.deaths > 3)) {
    calculatedRisk = 'Critical';
  } else if (report.deaths > 2 || report.cases > 15) {
    calculatedRisk = 'High';
  } else if (report.cases > 0) {
    calculatedRisk = 'Medium';
  }

  return {
    id: report.surveillance_record_id || `SR-ADNIS-${report.id.substring(report.id.length - 8)}`,
    laboratoryId: labId,
    laboratoryName: labInfo?.fullName || (labId === 'arvl' ? 'Asela Regional Veterinary Laboratory' : 'Hirna Regional Veterinary Laboratory'),
    region: report.region || 'Oromia',
    date: report.report_date,
    timestamp: new Date(report.report_date).getTime() || Date.now(),
    woreda: woredaName,
    zone: zoneFormatted,
    lat: report.latitude || matchedWoredaObj?.lat || labInfo?.lat || (labId === 'arvl' ? 7.95 : 9.2),
    lng: report.longitude || matchedWoredaObj?.lng || labInfo?.lng || (labId === 'arvl' ? 39.12 : 41.2),
    disease: report.tentative_diagnosis || 'Unspecified Disease',
    species: report.species.join(', ') || 'Mixed Livestock',
    cases: report.cases || 0,
    deaths: report.deaths || 0,
    risk: calculatedRisk,
    comment: `${report.symptom_notes ? report.symptom_notes + ' — ' : ''}${report.comments || ''} [ADNIS Native Field Report: ${report.reporting_unit || report.district}]`,
    phone: report.reporter_phone,
    reporter: `${report.reporter_name} (${report.organization || report.reporter_role || 'Field Vet'})`,
    isZeroReport: report.report_type === 'ZERO_REPORT',
    sourceFile: 'National ADNIS Field Submission',
    sourceYear: new Date(report.report_date).getFullYear(),
    dataQualityStatus: woredaValidation.status
  };
}

/**
 * Computes Reporting Completeness and Zero Report Monitoring across Catchment Woredas
 */
export function calculateReportingCompleteness(
  reports: AdnisReport[],
  currentPeriod: string = '2026-08',
  laboratoryId: string = 'all'
): WoredaReportingCompleteness[] {
  // Normalize current month
  const periodReports = reports.filter(r => {
    if (r.report_status === 'DRAFT') return false;
    const repPeriod = r.reporting_period_start ? r.reporting_period_start.substring(0, 7) : r.report_date.substring(0, 7);
    return repPeriod === currentPeriod || r.report_date.startsWith(currentPeriod);
  });

  const targetWoredas = getWoredasForLaboratory(laboratoryId);

  return targetWoredas.map(woreda => {
    const woredaSubmissions = periodReports.filter(r => 
      r.district.toLowerCase() === woreda.name.toLowerCase()
    );

    const receivedField = woredaSubmissions.filter(r => r.report_type === 'FIELD_REPORT').length;
    const receivedZero = woredaSubmissions.filter(r => r.report_type === 'ZERO_REPORT').length;
    const total = receivedField + receivedZero;
    const expected = 1; // 1 mandatory surveillance submission (Field or Zero) per period per woreda

    let status: 'COMPLETE' | 'MISSING' | 'LATE' = 'MISSING';
    if (total >= expected) {
      // If submitted after 25th of the month, mark as Late, otherwise Complete
      const latest = woredaSubmissions[0];
      const day = latest ? parseInt(latest.report_date.split('-')[2] || '1', 10) : 1;
      status = day > 25 ? 'LATE' : 'COMPLETE';
    }

    const latestReport = woredaSubmissions.sort((a, b) => b.updated_at - a.updated_at)[0];

    return {
      woredaId: woreda.id,
      woredaName: woreda.name,
      zone: woreda.zone,
      reportingPeriod: currentPeriod,
      expectedReports: expected,
      receivedFieldReports: receivedField,
      receivedZeroReports: receivedZero,
      totalReceived: total,
      missingReports: total >= expected ? 0 : (expected - total),
      status,
      lastSubmissionDate: latestReport?.report_date,
      lastReporterName: latestReport?.reporter_name,
      timelinessScore: status === 'COMPLETE' ? 100 : (status === 'LATE' ? 60 : 0)
    };
  });
}

/**
 * Generates National and Regional Excel / CSV Export dataset matching National Veterinary Epidemiology Unit specifications
 */
export function generateNationalAdnisCSV(reports: AdnisReport[]): string {
  const headers = [
    'Report_ID',
    'Laboratory_ID',
    'Client_GUID',
    'Report_Type',
    'Report_Status',
    'Report_Date',
    'Period_Start',
    'Period_End',
    'Region',
    'Zone',
    'Woreda',
    'Reporting_Unit_Kebele',
    'Village',
    'Reporter_Name',
    'Reporter_Phone',
    'Reporter_Role',
    'Organization',
    'Species_Monitored_Affected',
    'Population_At_Risk',
    'Cases_Reported',
    'Deaths_Reported',
    'Morbidity_Rate_Pct',
    'Mortality_Rate_Pct',
    'Case_Fatality_Rate_Pct',
    'Tentative_Diagnosis',
    'Diagnosis_Certainty',
    'Clinical_Symptoms',
    'GPS_Status',
    'Latitude',
    'Longitude',
    'Altitude_Meters',
    'GPS_Accuracy_Meters',
    'GPS_Source',
    'GPS_Offline_Captured',
    'Possible_Source',
    'Control_Measures',
    'Comments',
    'Finalized_At_ISO',
    'Synced_At_ISO',
    'Device_ID'
  ];

  const rows = reports.map(r => [
    r.id,
    r.laboratoryId || 'hrvl',
    r.client_report_id,
    r.report_type,
    r.report_status,
    r.report_date,
    r.reporting_period_start,
    r.reporting_period_end,
    r.region,
    r.zone,
    r.district,
    r.reporting_unit,
    r.village || '',
    r.reporter_name,
    r.reporter_phone,
    r.reporter_role,
    r.organization,
    r.species.join('; '),
    r.at_risk,
    r.cases,
    r.deaths,
    r.morbidity_rate || (r.at_risk > 0 ? ((r.cases / r.at_risk) * 100).toFixed(2) : '0.00'),
    r.mortality_rate || (r.at_risk > 0 ? ((r.deaths / r.at_risk) * 100).toFixed(2) : '0.00'),
    r.case_fatality_rate || (r.cases > 0 ? ((r.deaths / r.cases) * 100).toFixed(2) : '0.00'),
    r.tentative_diagnosis || (r.report_type === 'ZERO_REPORT' ? 'None (Zero Reporting)' : 'Unspecified'),
    r.diagnosis_certainty || '',
    r.symptoms.join('; '),
    r.gps_status,
    r.latitude ?? '',
    r.longitude ?? '',
    r.altitude ?? '',
    r.gps_accuracy ?? '',
    r.gps_source,
    r.gps_captured_offline ? 'YES' : 'NO',
    r.possible_source || '',
    r.control_measures_applied?.join('; ') || '',
    r.comments || '',
    r.finalized_at ? new Date(r.finalized_at).toISOString() : '',
    r.synced_at ? new Date(r.synced_at).toISOString() : '',
    r.device_id
  ]);

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvRows = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ];

  return csvRows.join('\n');
}

/**
 * Triggers browser download of National ADNIS Excel/CSV export
 */
export function downloadNationalAdnisExport(reports: AdnisReport[], filename?: string): void {
  const csvContent = generateNationalAdnisCSV(reports);
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', filename || `MULTI_RVL_ADNIS_v2_Export_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
