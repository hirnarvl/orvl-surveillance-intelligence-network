export type EthiopianFiscalMonthKey = 
  | 'july'
  | 'august'
  | 'september'
  | 'october'
  | 'november'
  | 'december'
  | 'january'
  | 'february'
  | 'march'
  | 'april'
  | 'may'
  | 'june';

export type EthiopianFiscalQuarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface MonthlyTargets {
  july: string[];
  august: string[];
  september: string[];
  october: string[];
  november: string[];
  december: string[];
  january: string[];
  february: string[];
  march: string[];
  april: string[];
  may: string[];
  june: string[];
}

export interface RawMonthlyTargets {
  july: string;
  august: string;
  september: string;
  october: string;
  november: string;
  december: string;
  january: string;
  february: string;
  march: string;
  april: string;
  may: string;
  june: string;
}

export type ARVLQualityFlag = 
  | 'NO_SCHEDULE' 
  | 'MISSING_DISTRICT' 
  | 'UNKNOWN_TARGET_CODE' 
  | 'DUPLICATE_DISTRICT' 
  | 'INVALID_MONTH_MAPPING' 
  | 'NAME_VARIANT';

export interface ARVLVaccinationRecord {
  id: string;
  planningYear: string; // e.g. "2026/27"
  region: string;       // e.g. "Oromia ARVL"
  zone: string;         // e.g. "Arsi", "West Arsi", "Bale", etc.
  district: string;     // Original district name preserved e.g. "H/wabe", "Asakoo"
  normalizedDistrict?: string;
  months: MonthlyTargets;
  rawMonths: RawMonthlyTargets;
  remark: string;
  qualityFlags?: ARVLQualityFlag[];
  source: string;
  createdAt: number;
  updatedAt: number;
  createdBy?: string;
  updatedBy?: string;
  // Geolocation linkage for map integration
  lat?: number;
  lng?: number;
  districtCode?: string;
}

export type VaccineCategory = 'Viral' | 'Bacterial' | 'Parasitic' | 'Zoonotic' | 'Multivalent' | 'Diagnostic / Biological';

export interface VaccineDictionaryEntry {
  code: string;
  officialName: string;
  category: VaccineCategory;
  targetSpecies: string;
  description: string;
  active: boolean;
  notes: string;
  colorClass?: string;
}

export type ARVLAuditAction = 
  | 'ADD_DISTRICT'
  | 'EDIT_MONTH'
  | 'EDIT_TARGET'
  | 'DELETE_RECORD'
  | 'IMPORT_DATA'
  | 'EXPORT_DATA'
  | 'COPY_PLANNING_YEAR'
  | 'DICTIONARY_UPDATE';

export interface ARVLAuditLogEntry {
  id: string;
  action: ARVLAuditAction;
  recordId: string;
  recordName: string;
  actorUserId: string;
  actorName: string;
  timestamp: number;
  reason?: string;
  oldValue?: string;
  newValue?: string;
}

export interface DataQualityReport {
  totalSourceRows: number;
  totalValidDistricts: number;
  totalRegions: number;
  totalZones: number;
  totalDistricts: number;
  totalMonthlyEntries: number;
  totalUniqueTargets: number;
  unknownCodes: { code: string; occurrences: number; districts: string[] }[];
  potentialDuplicates: string[];
  emptyDistricts: string[];
  malformedEntries: string[];
  nameVariants: { original: string; canonical: string }[];
}

export interface ARVLFilterState {
  region: string;
  zone: string;
  district: string;
  planningYear: string;
  quarter: 'All' | EthiopianFiscalQuarter;
  month: 'All' | EthiopianFiscalMonthKey;
  selectedTargets: string[];
  searchQuery: string;
}
