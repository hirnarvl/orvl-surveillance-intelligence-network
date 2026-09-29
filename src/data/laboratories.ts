export type LaboratoryId = 'all' | 'hrvl' | 'arvl' | string;

export interface LaboratoryInfo {
  id: string;
  code: string;
  shortCode: string;
  name: string;
  fullName: string;
  shortName: string;
  location: string;
  region: string;
  zones: string[];
  totalOperationalWoredas: number;
  coverageWoredas: number;
  lat: number;
  lng: number;
  plusCode: string;
  fullPlusCode?: string;
  googleMapsCid: string;
  googleMapsUrl?: string;
  googleMapsEmbedUrl?: string;
  logoUrl?: string;
  status: 'active' | 'maintenance' | 'onboarding';
  email: string;
  phone: string;
  director: string;
  directorTitle: string;
  diagnosticServices: string[];
  establishedYear: number;
  description: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

export const LABORATORIES_REGISTRY: Record<string, LaboratoryInfo> = {
  hrvl: {
    id: 'hrvl',
    code: 'HRVL-ET',
    shortCode: 'HRVL',
    name: 'Hirna Regional Veterinary Laboratory',
    fullName: 'Hirna Regional Veterinary Diagnostic Laboratory',
    shortName: 'HRVL (Hirna)',
    location: 'Hirna, West Hararghe Zone, Oromia Regional State, Ethiopia',
    region: 'Oromia',
    zones: ['East Hararghe (E/H)', 'West Hararghe (W/H)'],
    totalOperationalWoredas: 36,
    coverageWoredas: 36,
    lat: 9.221312,
    lng: 41.104313,
    plusCode: '64C3+GP',
    fullPlusCode: '6HX364C3+GP',
    googleMapsCid: '15875862256016053253',
    googleMapsUrl: 'https://maps.google.com/?cid=15875862256016053253',
    googleMapsEmbedUrl: 'https://maps.google.com/maps?cid=15875862256016053253&output=embed',
    logoUrl: 'https://lh3.googleusercontent.com/d/1LzxKTsj6b4TO1aIyI-tAddDsR5QMYYom',
    status: 'active',
    email: 'hirnarvl@oromiavet.gov.et',
    phone: '+251 25 551 0045',
    director: 'Dr. Henok Abebe T.',
    directorTitle: 'Lead Veterinary Epidemiologist & Data Systems Specialist',
    diagnosticServices: [
      'FAST Disease Surveillance & Serology (FMD NSP ELISA, PPR cELISA, CBPP CFT)',
      'Molecular Pathogen Confirmation (RT-qPCR for Transboundary Pathogens)',
      'Clinical Bacteriology & Parasitology (Hemoparasites, Anthrax smear)',
      'Rabies Diagnostic Fluorescent Antibody Test (FAT)',
      'Post-Mortem & Pathology Diagnostic Workstation',
      'One Health Field Investigation & Outbreak Response'
    ],
    establishedYear: 2010,
    description: 'Regional Epizootiological Surveillance, Diagnostic Reference Laboratory & Molecular Pathogen Testing Center for Eastern and Western Hararghe zones.',
    color: '#2563eb',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
    badgeBorder: 'border-blue-200 dark:border-blue-800',
    badgeText: 'text-blue-700 dark:text-blue-300'
  },
  arvl: {
    id: 'arvl',
    code: 'ARVL-ET',
    shortCode: 'ARVL',
    name: 'Asela Regional Veterinary Laboratory',
    fullName: 'Asela Regional Veterinary Laboratory',
    shortName: 'ARVL / Asela RVL',
    location: 'Asela (Assela), Arsi Zone, Oromia Regional State, Ethiopia',
    region: 'Oromia',
    zones: [
      'Arsi',
      'West Arsi',
      'Bale',
      'East Bale',
      'East Shewa',
      'North Shewa',
      'Sheger City',
      'Adama City',
      'Shashamane City',
      'Bishoftu City',
      'Town-level operational units'
    ],
    totalOperationalWoredas: 112,
    coverageWoredas: 112,
    lat: 7.9356,
    lng: 39.11467,
    plusCode: 'X44C+64',
    fullPlusCode: '6GX2X44C+64',
    googleMapsCid: '14839201948271049281',
    googleMapsUrl: 'https://maps.google.com/?cid=14839201948271049281',
    googleMapsEmbedUrl: 'https://maps.google.com/maps?cid=14839201948271049281&output=embed',
    logoUrl: 'https://lh3.googleusercontent.com/d/1ramCieRBgrY-MWZteIHalwv5vYbIy36R',
    status: 'active',
    email: 'aselarvl@oromiavet.gov.et',
    phone: '+251 22 331 1088',
    director: 'Dr. Kassa D.',
    directorTitle: 'Senior Veterinary Pathologist & Laboratory Director',
    diagnosticServices: [
      'High-Throughput Serology (Bovine Brucellosis RBT/C-ELISA, FMD, CBPP, PPR)',
      'Molecular Biology & Gene Sequencing (FAST Pathogens, LSD, Anthrax PCR)',
      'Dairy Cattle Health, Mastitis Screening & Antimicrobial Susceptibility Testing',
      'Helminthology, Tick-Borne Hemoparasitology & Trypanosomiasis Monitoring',
      'Rabies National Surveillance Reference & Brain Tissue FAT Examination',
      'Ruminant Disease Investigation & Highlands Outbreak Response Center (112 Units)'
    ],
    establishedYear: 2004,
    description: 'Premier Diagnostic Center and Regional Reference Laboratory serving the 112 operational units (82 rural woredas, 23 sub-cities, 7 towns) across Arsi, West Arsi, Bale, East Bale, East Shewa, North Shewa, Sheger City, and municipal districts.',
    color: '#059669',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeBorder: 'border-emerald-200 dark:border-emerald-800',
    badgeText: 'text-emerald-700 dark:text-emerald-300'
  }
};

export const PLATFORM_ALL_LABS_INFO: LaboratoryInfo = {
  id: 'all',
  code: 'ALL-RVL',
  shortCode: 'ORVL Network',
  name: 'ORVL Surveillance Intelligence Network',
  fullName: 'Oromia Regional Veterinary Laboratory Surveillance Intelligence Network',
  shortName: 'ORVL Surveillance Intelligence Network',
  location: 'Oromia Regional State & Participating Regional Veterinary Laboratories Network',
  region: 'Oromia & Regional Network',
  zones: [
    'East Hararghe', 
    'West Hararghe', 
    'Arsi', 
    'West Arsi', 
    'Bale', 
    'East Bale', 
    'East Shewa', 
    'North Shewa', 
    'Sheger City', 
    'Adama City', 
    'Shashamane City', 
    'Bishoftu City', 
    'Town-level operational units'
  ],
  totalOperationalWoredas: 148, // 36 HRVL + 112 ARVL
  coverageWoredas: 148,
  lat: 8.55,
  lng: 40.10,
  plusCode: 'NETWORK',
  googleMapsCid: '15875862256016053253',
  logoUrl: '/orvl-emblem.png',
  status: 'active' as const,
  email: 'surveillance@oromiavet.gov.et',
  phone: '+251 11 551 7700',
  director: 'Regional Veterinary Epidemiology & Diagnostics Network Command',
  directorTitle: 'Central Veterinary Epidemiological Network Command',
  diagnosticServices: [
    'Cross-Laboratory Surveillance Data Harmonization & Quality Assurance',
    'Epidemiological Comparative Intelligence & Disease Modeling',
    'National MoA & WOAH Disease Reporting Integration',
    'Zonal Outbreak Alerting & Transboundary Spread Tracking across 148 Woredas'
  ],
  establishedYear: 2026,
  description: 'Official Animal Disease Surveillance, Diagnostics & Field Epidemiology Portal for participating Regional Veterinary Laboratories in Oromia (HRVL, ARVL, and Regional Operational Catchment Units).',
  color: '#0f766e',
  badgeBg: 'bg-teal-50 dark:bg-teal-950/40',
  badgeBorder: 'border-teal-200 dark:border-teal-800',
  badgeText: 'text-teal-700 dark:text-teal-300'
};

export function getLaboratory(id: string): LaboratoryInfo {
  if (id === 'arvl') return LABORATORIES_REGISTRY.arvl;
  return LABORATORIES_REGISTRY.hrvl;
}

export function getAllLaboratoriesList(): LaboratoryInfo[] {
  return Object.values(LABORATORIES_REGISTRY);
}

export function isValidLaboratoryId(id: string): boolean {
  return id === 'all' || id === 'hrvl' || id === 'arvl';
}
