export type ZoneName = 
  | 'E/H' 
  | 'W/H' 
  | 'Arsi' 
  | 'West Arsi'
  | 'Bale'
  | 'East Bale'
  | 'East Shewa' 
  | 'North Shewa'
  | 'Sheger City'
  | 'Adama City'
  | 'Shashamane City'
  | 'Bishoftu City'
  | 'Town-level operational units'
  | string;

export type LaboratoryId = 'all' | 'hrvl' | 'arvl' | string;

export type Locale = 'en' | 'om' | 'am';

export type LivestockSpecies = 
  | 'Cattle' 
  | 'Sheep' 
  | 'Goats' 
  | 'Camels' 
  | 'Equines' 
  | 'Poultry' 
  | 'Swine / Others';

export type DiseaseName = 
  | 'Foot-and-Mouth Disease (FMD)'
  | 'Lumpy Skin Disease (LSD)'
  | 'Peste des Petits Ruminants (PPR)'
  | 'Contagious Bovine Pleuropneumonia (CBPP)'
  | 'African Horse Sickness (AHS)'
  | 'Anthrax'
  | 'Rabies'
  | 'Blackleg'
  | 'Newcastle Disease (ND)'
  | 'Bovine Brucellosis'
  | 'Bovine Trypanosomiasis';

export type OutbreakStatus = 'Active' | 'Contained' | 'Under Investigation' | 'Resolved';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface WoredaInfo {
  id: string;
  name: string;
  zone: ZoneName;
  region?: string;
  laboratoryId?: string;
  lat: number;
  lng: number;
  populationEstimate: number;
  districtCode?: string;
  pcode?: string;
  admType?: string;
  urbanRural?: 'Rural' | 'Urban';
  hasDuplicateName?: boolean;
  isExpansionUnit?: boolean;
  isBufferZone?: boolean;
  livestockUnitsEstimate?: number;
  areaSqKm?: number;
}

export interface SurveillanceRecord {
  id: string;
  laboratoryId?: string; // 'hrvl' | 'arvl'
  laboratoryName?: string;
  date: string; // YYYY-MM-DD or ISO timestamp
  timestamp: number;
  woreda: string;
  zone: ZoneName;
  region?: string;
  lat: number;
  lng: number;
  disease: DiseaseName | string;
  species: LivestockSpecies | string;
  cases: number;
  deaths: number;
  risk: RiskLevel;
  comment?: string;
  phone?: string;
  reporter?: string;
  isZeroReport?: boolean;
  sourceFile?: string;
  sourceYear?: number;
  isBaseline?: boolean;
  dataQualityStatus?: string;
  sourceBatchId?: string;
  diagnosticMethod?: string;
  diagnosticResult?: 'Positive' | 'Negative' | 'Suspected' | 'Inconclusive';
}

export interface Outbreak {
  id: string;
  laboratoryId?: string;
  outbreakCode: string;
  disease: string;
  zone: ZoneName;
  woreda: string;
  startDate: string;
  status: OutbreakStatus;
  cases: number;
  deaths: number;
  susceptible: number;
  morbidityRate: number; // percentage
  mortalityRate: number; // percentage
  cfr: number; // Case Fatality Rate percentage
  lat: number;
  lng: number;
  speciesAffected: string[];
  quarantineApplied: boolean;
  vaccinationActive: boolean;
}

export interface WoredaCompliance {
  woreda: string;
  zone: ZoneName;
  laboratoryId?: string;
  expectedReports: number;
  actualReports: number;
  complianceRate: number; // 0 - 100%
  lastReportDate: string;
  status: 'Compliant' | 'Needs Attention' | 'Non-Compliant';
}

export interface DiseaseSummary {
  disease: string;
  laboratoryId?: string;
  totalOutbreaks: number;
  totalCases: number;
  totalDeaths: number;
  morbidityPercent: number;
  cfrPercent: number;
  activeWoredasCount: number;
  primarySpecies: string;
  riskLevel: RiskLevel;
}

export interface FilterState {
  laboratory: LaboratoryId;
  zone: 'All' | ZoneName;
  woreda: 'All' | string;
  disease: 'All' | string;
  species: 'All' | string;
  dateFrom: string;
  dateTo: string;
  searchTerm: string;
}

export interface DataProvenanceMetadata {
  dataSource: string;
  reportingPeriod: string;
  lastUpdated: string;
  recordsAnalyzed: number;
  outbreaksCount: number;
  missionsCount: number;
  activeFilters?: {
    zone?: string;
    woreda?: string;
    disease?: string;
    species?: string;
    dateRange?: string;
  };
  geographicCoverage: string;
  dataRefreshStatus: string;
  isFilteredView?: boolean;
}

export interface NarrativeReport {
  title: string;
  dateGenerated: string;
  laboratoryId?: 'hrvl' | 'arvl' | string;
  reportRef?: string;
  dataProvenance?: DataProvenanceMetadata;
  executiveSummary: string;
  outbreakStatusAnalysis: string;
  speciesVulnerability: string;
  zonalComplianceSummary: string;
  epidemiologicalRecommendations: string[];
  highRiskWoredas: string[];
}

export type ActiveTab = 'Dashboard' | 'Map' | 'Tables' | 'VaccineCalendar' | 'FieldToolkit' | 'FAST' | 'Personnel' | 'Archive' | 'AdminConsole';

export type StandardRole = 
  | 'SUPER_ADMIN'
  | 'LAB_ADMIN'
  | 'EPIDEMIOLOGIST'
  | 'LABORATORY_USER'
  | 'PARTNER_USER';

export type LegacyUserRole = 
  | 'platform_admin'
  | 'national_admin'
  | 'lab_manager'
  | 'lab_staff'
  | 'epidemiologist'
  | 'field_veterinarian'
  | 'viewer'
  | 'admin_regional'
  | 'admin_zonal'
  | 'admin_hrvl'
  | 'district_focal_person';

export type UserRole = StandardRole | LegacyUserRole;

export type AppPermission = 
  | 'dashboard.view'
  | 'analytics.view'
  | 'surveillance.view'
  | 'laboratory.view'
  | 'reports.view'
  | 'reports.create'
  | 'reports.edit'
  | 'reports.delete'
  | 'data.import'
  | 'data.export'
  | 'data.manage'
  | 'users.view'
  | 'users.approve'
  | 'users.suspend'
  | 'users.manage'
  | 'settings.manage';

export type AccountStatus = 'pending' | 'approved' | 'active' | 'rejected' | 'suspended';

export type ProfessionalDesignation = 
  | 'Veterinarian'
  | 'Veterinary Epidemiologist'
  | 'Animal Health Professional'
  | 'District Veterinary Focal Person'
  | 'Laboratory Professional'
  | 'Laboratory Director'
  | 'Other';

export interface UserProfile {
  uid: string;
  displayName?: string;
  fullName: string;
  email: string;
  photoURL?: string | null;
  phone?: string;
  region?: string;
  zone?: string;
  district?: string;
  status: 'pending' | 'approved' | 'active' | 'rejected' | 'suspended';
  accountStatus: AccountStatus;
  roles: (UserRole | string)[];
  role: UserRole;
  requestedRole?: UserRole;
  laboratories: string[]; // e.g. ['HRVL'], ['ARVL'], or ['HRVL', 'ARVL']
  assignedLaboratory?: string; // 'hrvl' | 'arvl' | 'all'
  accessibleLaboratories?: string[]; // ['hrvl'], ['arvl'], or ['hrvl', 'arvl']
  permissions: (AppPermission | string)[];
  professionalDesignation?: ProfessionalDesignation | string;
  organization?: string;
  emailVerified: boolean;
  createdAt: number;
  updatedAt: number;
  approvedAt?: number | null;
  approvedBy?: string | null;
  approvedByName?: string | null;
  rejectionReason?: string | null;
  suspensionReason?: string | null;
  lastLoginAt: number;
}

export interface LaboratoryDocument {
  id: string; // 'HRVL' | 'ARVL'
  name: string;
  shortName: string;
  logo: string;
  region: string;
  status: 'active' | 'maintenance' | 'onboarding';
  description?: string;
  woredasCount?: number;
  updatedAt?: number;
}

export type AuditLogAction = 
  | 'USER_REGISTER'
  | 'USER_APPROVE'
  | 'USER_REJECT'
  | 'USER_SUSPEND'
  | 'USER_REACTIVATE'
  | 'ROLE_CHANGE'
  | 'ASSIGNMENT_CHANGE'
  | 'PROFILE_UPDATE'
  | 'ADMIN_ACTION'
  | 'DATA_MODIFICATION'
  | 'SYSTEM_CONFIG';

export interface AuditLogEntry {
  id: string;
  actorUserId: string;
  actorName: string;
  actorRole: UserRole | string;
  action: AuditLogAction;
  targetUserId?: string;
  targetUserName?: string;
  timestamp: number;
  organizationLevel?: string;
  details?: string;
  metadata?: Record<string, any>;
}

export interface PersonnelRecord {
  id: string;
  name: string;
  phone: string;
  assignedWoreda: string;
  assignedZone: ZoneName;
  laboratoryId?: string;
  role?: string;
  associatedRecordsCount: number;
  firstReportDate: string;
  lastReportDate: string;
  sourceReportIdentifiers: string[];
  updatedAt: number;
}

export interface DatasetMetadata {
  datasetVersion: string;
  laboratoryId?: string;
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  sourceArchiveUrl: string;
  lastImportBatchId: string;
  lastSyncTimestamp: number;
  totalBaselineRecords: number;
  totalCurrentRecords: number;
  totalPersonnelCount: number;
  geographicCoverage: {
    region: string;
    zones: string[];
    totalTargetWoredas: number;
    activeReportingWoredas: number;
  };
  laboratoryCoverage?: Record<string, {
    name: string;
    totalBaseline: number;
    totalCurrent: number;
    targetWoredas: number;
    activeReportingWoredas: number;
    zones: string[];
  }>;
  validationStatus: string;
}

export interface PersonnelExtractionAudit {
  totalProcessed: number;
  extractedPersonnelCount: number;
  withNameCount: number;
  withPhoneCount: number;
  recordsWithCompletePersonnel: number;
  recordsWithMissingPersonnel: number;
  uniquePersonnelIdentified: number;
}

export interface ImportBatchRecord {
  id: string;
  importDate: string;
  sourceDriveFolderId: string;
  sourceFileName: string;
  sourceFileId: string;
  totalRawRowsProcessed: number;
  recordsAcceptedHRVL: number;
  recordsAcceptedARVL?: number;
  recordsAcceptedTotal?: number;
  recordsQuarantinedNonHRVL: number;
  recordsQuarantinedUnmatched?: number;
  recordsRequiringReview: number;
  processingStatus: 'SUCCESS' | 'PARTIAL_WARNING' | 'FAILED';
  personnelAudit?: PersonnelExtractionAudit;
  checksum?: string;
  errorMessage?: string;
}

export interface DiagnosticHubInfo {
  id: string;
  type: 'diagnostic_hub';
  name: string;
  shortName: string;
  locationName: string;
  operationalArea: string;
  plusCode: string;
  fullPlusCode: string;
  lat: number;
  lng: number;
  zone: ZoneName;
  googleMapsCid: string;
  googleMapsQuery: string;
  googleMapsUrl: string;
  googleMapsEmbedUrl?: string;
  description: string;
}
