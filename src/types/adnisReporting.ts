import { ZoneName } from '../types';

export type AdnisReportType = 'FIELD_REPORT' | 'ZERO_REPORT';

export type AdnisReportStatus = 
  | 'DRAFT' 
  | 'READY_FOR_SUBMISSION' 
  | 'SYNC_PENDING' 
  | 'SUBMITTED' 
  | 'SYNCED' 
  | 'SYNC_ERROR';

export type AdnisLivestockSpecies = 
  | 'Bovine' 
  | 'Ovine' 
  | 'Caprine' 
  | 'Avian' 
  | 'Camel' 
  | 'Equine' 
  | 'Swine' 
  | 'Canine' 
  | 'Feline';

export interface AdnisSpeciesOption {
  id: AdnisLivestockSpecies;
  label: string;
  scientificGroup: string;
  commonExamples: string;
  iconName?: string;
}

export interface AdnisSymptomDefinition {
  id: string;
  code: string;
  label: string;
  category: 'Oral / Mucosal' | 'Locomotion / Foot' | 'Respiratory / Ocular' | 'Skin / External' | 'Systemic / Mortality' | 'Gastrointestinal' | 'Reproductive / Production' | 'Neurological';
  description: string;
  associatedSyndromes?: string[];
}

export interface AdnisTentativeDiagnosisOption {
  id: string;
  code: string;
  name: string;
  shortName: string;
  primarySpecies: string[];
  description: string;
  isPriorityFAST: boolean;
}

export type AdnisGpsStatus = 'GPS_ACQUIRED' | 'GPS_UNAVAILABLE';
export type AdnisGpsSource = 'device_gps' | 'manual_point' | 'none';

export interface AdnisReport {
  id: string; // GUID / UUID (e.g. adnis-rep-2026-...)
  laboratoryId?: string; // 'hrvl' | 'arvl' | 'all'
  client_report_id: string; // Collision-resistant idempotent client ID
  device_id: string;
  report_type: AdnisReportType;
  report_status: AdnisReportStatus;

  // Reporter & Authentication Info
  reporter_id: string;
  reporter_name: string;
  reporter_phone: string;
  reporter_email: string;
  reporter_role: string;
  organization: string;

  // Administrative Location
  region: string; // 'Oromia'
  zone: ZoneName | 'East Hararghe' | 'West Hararghe';
  district: string; // Woreda name (e.g. 'Haramaya', 'Chiro')
  reporting_unit: string; // Kebele or Clinic name (e.g. 'Bate Kebele Clinic')
  village?: string;

  // Reporting Period & Date
  reporting_period_start: string; // YYYY-MM-DD
  reporting_period_end: string; // YYYY-MM-DD
  report_date: string; // YYYY-MM-DD

  // Monitored / Affected Species
  species: AdnisLivestockSpecies[];

  // GPS Coordinates & Status (Strict GPS Integrity - No fabricated centroid fallback)
  gps_status: AdnisGpsStatus;
  latitude: number | null;
  longitude: number | null;
  altitude?: number | null;
  gps_accuracy?: number | null; // meters
  gps_source: AdnisGpsSource;
  gps_captured_offline: boolean;

  // Epidemiological Counts (Zero Reports must have 0 for cases/deaths/at_risk)
  at_risk: number;
  cases: number;
  deaths: number;
  morbidity_rate?: number; // %
  mortality_rate?: number; // %
  case_fatality_rate?: number; // %

  // Symptoms / Clinical Signs
  symptoms: string[]; // List of symptom IDs/labels
  symptom_notes?: string;

  // Tentative Diagnosis & Evaluation
  tentative_diagnosis?: string;
  diagnosis_code?: string;
  diagnosis_certainty?: 'Suspected' | 'Probable' | 'Laboratory Confirmed';
  possible_source?: string;
  control_measures_applied?: string[];

  // Comments / Observations
  comments?: string;

  // Timestamps & Audit
  created_at: number;
  updated_at: number;
  finalized_at?: number | null;
  submitted_at?: number | null;
  synced_at?: number | null;
  sync_error_message?: string;

  // Linkage to Host System
  surveillance_record_id?: string;
  is_baseline?: boolean;
}

export interface WoredaReportingCompleteness {
  woredaId: string;
  woredaName: string;
  zone: ZoneName;
  reportingPeriod: string; // e.g. "2026-08" or "Week 34, 2026"
  expectedReports: number;
  receivedFieldReports: number;
  receivedZeroReports: number;
  totalReceived: number;
  missingReports: number;
  status: 'COMPLETE' | 'MISSING' | 'LATE';
  lastSubmissionDate?: string;
  lastReporterName?: string;
  timelinessScore: number; // 0 - 100%
}
