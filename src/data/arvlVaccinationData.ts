import { 
  ARVLVaccinationRecord, 
  VaccineDictionaryEntry, 
  EthiopianFiscalMonthKey, 
  EthiopianFiscalQuarter,
  MonthlyTargets,
  RawMonthlyTargets,
  DataQualityReport 
} from '../types/arvlVaccination';
import { ARSI_WOREDAS } from './woredas';

/**
 * 1. ETHIOPIAN FISCAL CALENDAR PLANNING DEFINITIONS (July - June)
 * Preserves the national veterinary public health and fiscal planning cycle.
 */
export const FISCAL_QUARTERS: Record<EthiopianFiscalQuarter, { name: string; months: EthiopianFiscalMonthKey[]; label: string }> = {
  Q1: {
    name: '1st Quarter',
    months: ['july', 'august', 'september'],
    label: 'Q1 — July–September'
  },
  Q2: {
    name: '2nd Quarter',
    months: ['october', 'november', 'december'],
    label: 'Q2 — October–December'
  },
  Q3: {
    name: '3rd Quarter',
    months: ['january', 'february', 'march'],
    label: 'Q3 — January–March'
  },
  Q4: {
    name: '4th Quarter',
    months: ['april', 'may', 'june'],
    label: 'Q4 — April–June'
  }
};

export const MONTH_ORDER: EthiopianFiscalMonthKey[] = [
  'july', 'august', 'september',
  'october', 'november', 'december',
  'january', 'february', 'march',
  'april', 'may', 'june'
];

export const MONTH_LABELS: Record<EthiopianFiscalMonthKey, { full: string; short: string; quarter: EthiopianFiscalQuarter }> = {
  july: { full: 'July', short: 'Jul', quarter: 'Q1' },
  august: { full: 'August', short: 'Aug', quarter: 'Q1' },
  september: { full: 'September', short: 'Sep', quarter: 'Q1' },
  october: { full: 'October', short: 'Oct', quarter: 'Q2' },
  november: { full: 'November', short: 'Nov', quarter: 'Q2' },
  december: { full: 'December', short: 'Dec', quarter: 'Q2' },
  january: { full: 'January', short: 'Jan', quarter: 'Q3' },
  february: { full: 'February', short: 'Feb', quarter: 'Q3' },
  march: { full: 'March', short: 'Mar', quarter: 'Q3' },
  april: { full: 'April', short: 'Apr', quarter: 'Q4' },
  may: { full: 'May', short: 'May', quarter: 'Q4' },
  june: { full: 'June', short: 'Jun', quarter: 'Q4' }
};

/**
 * Returns current Ethiopian Fiscal Month & Quarter dynamically from system date.
 */
export function getCurrentFiscalPeriod(date: Date = new Date()): { monthKey: EthiopianFiscalMonthKey; quarter: EthiopianFiscalQuarter; monthName: string } {
  const gregorianMonthIndex = date.getMonth(); // 0 = Jan, 6 = Jul, 8 = Sep, 11 = Dec
  const monthMap: Record<number, EthiopianFiscalMonthKey> = {
    6: 'july',
    7: 'august',
    8: 'september',
    9: 'october',
    10: 'november',
    11: 'december',
    0: 'january',
    1: 'february',
    2: 'march',
    3: 'april',
    4: 'may',
    5: 'june'
  };
  const monthKey = monthMap[gregorianMonthIndex] || 'september';
  const quarter = MONTH_LABELS[monthKey].quarter;
  return {
    monthKey,
    quarter,
    monthName: MONTH_LABELS[monthKey].full
  };
}

/**
 * 2. CONFIGURABLE VACCINE / DISEASE TARGET DICTIONARY
 * Supported codes: LSD, AHS, SGP, FMD, Rab, BQ, BP, OP, Ant, NCD, IBD, PPR, CBPP, CCPP, CPox, LCD
 */
export const INITIAL_VACCINE_DICTIONARY: VaccineDictionaryEntry[] = [
  {
    code: 'LSD',
    officialName: 'Lumpy Skin Disease Vaccine',
    category: 'Viral',
    targetSpecies: 'Cattle (Bovine)',
    description: 'Live attenuated homologous or heterologous capripoxvirus vaccine for cattle against Lumpy Skin Disease (Neethling strain).',
    active: true,
    notes: 'Administered annually prior to peak biting-fly seasonal proliferation (post-rainy period).',
    colorClass: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800'
  },
  {
    code: 'AHS',
    officialName: 'African Horse Sickness Vaccine',
    category: 'Viral',
    targetSpecies: 'Equines (Horses, Mules, Donkeys)',
    description: 'Polyvalent live attenuated neurotropic orbivirus vaccine protecting horses, mules, and donkeys.',
    active: true,
    notes: 'Prioritized along highland-lowland transition corridors and vector breeding valleys.',
    colorClass: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
  },
  {
    code: 'SGP',
    officialName: 'Sheep and Goat Pox Vaccine',
    category: 'Viral',
    targetSpecies: 'Small Ruminants (Sheep & Goats)',
    description: 'Live attenuated Capripoxvirus (Bakirkoy / Romanian strain) protective against sheep pox and goat pox.',
    active: true,
    notes: 'Crucial for pastoral trade flocks and high-density communal browsing herds.',
    colorClass: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
  },
  {
    code: 'FMD',
    officialName: 'Foot and Mouth Disease Vaccine',
    category: 'Viral',
    targetSpecies: 'Cattle, Sheep, Goats, Swine',
    description: 'Inactivated polyvalent oil/alum-adjuvanted vaccine protecting against circulating serotypes (O, A, SAT-2).',
    active: true,
    notes: 'Essential for livestock trade corridors, commercial dairy belts, and feedlot zones.',
    colorClass: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
  },
  {
    code: 'Rab',
    officialName: 'Rabies Veterinary Vaccine',
    category: 'Zoonotic',
    targetSpecies: 'Canines, Felines, Cattle, Equines',
    description: 'Inactivated cell-culture derived rabies virus vaccine for animal rabies immunization & One Health bite prevention.',
    active: true,
    notes: 'Mass canine vaccination campaigns coordinated with urban municipal health administrations.',
    colorClass: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800'
  },
  {
    code: 'BQ',
    officialName: 'Blackleg (Black Quarter) Vaccine',
    category: 'Bacterial',
    targetSpecies: 'Cattle, Sheep',
    description: 'Formalin-inactivated whole culture vaccine containing Clostridium chauvoei anaculture.',
    active: true,
    notes: 'Administered before onset of wet grazing seasons in known spore-endemic pastures.',
    colorClass: 'bg-stone-100 text-stone-800 border-stone-200 dark:bg-stone-900 dark:text-stone-300 dark:border-stone-700'
  },
  {
    code: 'BP',
    officialName: 'Bovine Pasteurellosis Vaccine',
    category: 'Bacterial',
    targetSpecies: 'Cattle',
    description: 'Inactivated alum-precipitated Pasteurella multocida (serotype B:2) vaccine preventing shipping fever.',
    active: true,
    notes: 'Commonly co-administered or scheduled with Ovine Pasteurellosis during trek movements.',
    colorClass: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800'
  },
  {
    code: 'OP',
    officialName: 'Ovine Pasteurellosis Vaccine',
    category: 'Bacterial',
    targetSpecies: 'Sheep, Goats',
    description: 'Inactivated Bibersteinia trehalosi and P. multocida bacterin for small ruminant respiratory protection.',
    active: true,
    notes: 'Targeted in high-altitude chilling rain periods and sheep fattening woredas.',
    colorClass: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800'
  },
  {
    code: 'Ant',
    officialName: 'Anthrax Spore Vaccine',
    category: 'Bacterial',
    targetSpecies: 'Cattle, Sheep, Goats, Camels, Horses',
    description: 'Live non-encapsulated Bacillus anthracis Sterne strain 34F2 spore suspension.',
    active: true,
    notes: 'Strict annual preventive buffer in known anthrax focus areas and historical burial grounds.',
    colorClass: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800'
  },
  {
    code: 'NCD',
    officialName: 'Newcastle Disease Vaccine (HB1 / LaSota / I-2)',
    category: 'Viral',
    targetSpecies: 'Poultry (Chickens)',
    description: 'Thermostable I-2 or Hitchner B1 / LaSota lentogenic strain vaccine for village and commercial poultry.',
    active: true,
    notes: 'Administered 3–4 times annually via ocular, drinking water, or feed drops.',
    colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
  },
  {
    code: 'IBD',
    officialName: 'Infectious Bursal Disease (Gumboro) Vaccine',
    category: 'Viral',
    targetSpecies: 'Poultry',
    description: 'Live intermediate or intermediate-plus strain vaccine protecting young chicks from bursal necrosis.',
    active: true,
    notes: 'Administered to young flocks in intensive and semi-commercial poultry hubs.',
    colorClass: 'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-950/50 dark:text-lime-300 dark:border-lime-800'
  },
  {
    code: 'PPR',
    officialName: 'Peste des Petits Ruminants Vaccine',
    category: 'Viral',
    targetSpecies: 'Goats, Sheep',
    description: 'Live attenuated Nigeria 75/1 homologous morbillivirus vaccine conferring prolonged 3-year immunity.',
    active: true,
    notes: 'Flagship eradication target aligned with WOAH/FAO Global PPR Eradication Strategy.',
    colorClass: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800'
  },
  {
    code: 'CBPP',
    officialName: 'Contagious Bovine Pleuropneumonia Vaccine',
    category: 'Bacterial',
    targetSpecies: 'Cattle',
    description: 'Live attenuated Mycoplasma mycoides subsp. mycoides SC (T1/44 or T1-SR) broth vaccine.',
    active: true,
    notes: 'Mandatory surveillance and vaccination barrier across pastoral lowlands and border corridors.',
    colorClass: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800'
  },
  {
    code: 'CCPP',
    officialName: 'Contagious Caprine Pleuropneumonia Vaccine',
    category: 'Bacterial',
    targetSpecies: 'Goats',
    description: 'Inactivated Mycoplasma capricolum subsp. capripneumoniae with saponin adjuvant.',
    active: true,
    notes: 'Crucial in arid and semi-arid goat production systems in Rift Valley and Bale lowlands.',
    colorClass: 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-950/50 dark:text-pink-300 dark:border-pink-800'
  },
  {
    code: 'CPox',
    officialName: 'Camel Pox Vaccine',
    category: 'Viral',
    targetSpecies: 'Camels (Dromedary)',
    description: 'Attenuated orthopoxvirus vaccine protecting dromedaries from pustular dermatitis and high mortality.',
    active: true,
    notes: 'Administered in pastoral rangelands (East Bale, Borena and low-altitude zones).',
    colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800'
  },
  {
    code: 'LCD',
    officialName: 'Lumpy Cutaneous Disease / Dermatophilosis Program',
    category: 'Bacterial',
    targetSpecies: 'Cattle, Sheep',
    description: 'Veterinary control regimen and targeted vaccination protocol for cutaneous exudative dermatitis.',
    active: true,
    notes: 'Recorded in seasonal rainfall zones with high tick and mechanical vector infestation.',
    colorClass: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-950/50 dark:text-fuchsia-300 dark:border-fuchsia-800'
  }
];

/**
 * 3. TARGET PARSER & NORMALIZATION UTILITY
 * Splits comma/period separated codes (e.g. "LSD,AHS,SGP,FMD,Rab", "BP,OP.BQ")
 * while strictly preserving original source values.
 */
export function parseTargetCodes(raw: string | undefined | null): string[] {
  if (!raw || typeof raw !== 'string') return [];
  const cleaned = raw.trim();
  if (cleaned === '' || cleaned === '-' || cleaned.toLowerCase() === 'none' || cleaned.toLowerCase() === 'nil') {
    return [];
  }

  // Handle separators: commas, slashes, pluses, semicolons, or mixed dots like "BP,OP.BQ"
  const tokens = cleaned
    .replace(/\s*&\s*/g, ',')
    .replace(/\s*\+\s*/g, ',')
    .replace(/;/g, ',')
    .replace(/\//g, ',')
    .split(/[,.]/)
    .map(t => t.trim())
    .filter(t => t.length > 0);

  // Normalize casing for well-known acronyms while returning list
  return tokens.map(token => {
    const upper = token.toUpperCase();
    if (upper === 'LSD') return 'LSD';
    if (upper === 'AHS') return 'AHS';
    if (upper === 'SGP') return 'SGP';
    if (upper === 'FMD') return 'FMD';
    if (upper === 'RAB' || token.toLowerCase() === 'rab') return 'Rab';
    if (upper === 'BQ') return 'BQ';
    if (upper === 'BP') return 'BP';
    if (upper === 'OP') return 'OP';
    if (upper === 'ANT' || token.toLowerCase() === 'ant') return 'Ant';
    if (upper === 'NCD') return 'NCD';
    if (upper === 'IBD') return 'IBD';
    if (upper === 'PPR') return 'PPR';
    if (upper === 'CBPP') return 'CBPP';
    if (upper === 'CCPP') return 'CCPP';
    if (upper === 'CPOX') return 'CPox';
    if (upper === 'LCD') return 'LCD';
    return token; // preserve unknown code
  });
}

/**
 * Build Normalized Record from Raw District Entry
 */
function createCalendarRecord(
  id: string,
  region: string,
  zone: string,
  district: string,
  rawMonths: RawMonthlyTargets,
  remark: string = '',
  planningYear: string = '2026/27',
  source: string = 'ARVL Official Master Vaccination Calendar'
): ARVLVaccinationRecord {
  const months: MonthlyTargets = {
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
  };

  // Find linked spatial coords if available
  const matchWoreda = ARSI_WOREDAS.find(w => 
    w.name.toLowerCase() === district.toLowerCase() ||
    w.districtCode?.toLowerCase() === district.toLowerCase()
  );

  // Quality check
  const allTargets = Object.values(months).flat();
  const qualityFlags: ARVLVaccinationRecord['qualityFlags'] = [];
  if (allTargets.length === 0) {
    qualityFlags.push('NO_SCHEDULE');
  }

  return {
    id,
    planningYear,
    region,
    zone,
    district,
    normalizedDistrict: matchWoreda ? matchWoreda.name : district,
    months,
    rawMonths,
    remark,
    qualityFlags: qualityFlags.length > 0 ? qualityFlags : undefined,
    source,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lat: matchWoreda?.lat,
    lng: matchWoreda?.lng,
    districtCode: matchWoreda?.districtCode
  };
}

/**
 * 4. DIGITIZED MASTER CALENDAR FOR ARVL (Annual Livestock Vaccination Planning & Monitoring)
 * Preserving authentic district names, zones, regions, and multi-target schedules.
 */
export const INITIAL_ARVL_VACCINATION_CALENDAR: ARVLVaccinationRecord[] = [
  // 1. Arsi Zone Woredas
  createCalendarRecord(
    'arvl-cal-001',
    'Oromia ARVL',
    'Arsi',
    'H/wabe',
    {
      july: 'LSD,AHS,SGP,FMD,Rab',
      august: 'LSD,AHS,SGP,FMD,Rab',
      september: 'BQ',
      october: '',
      november: '',
      december: '',
      january: 'BP,OP,Ant',
      february: 'BP,OP,Ant',
      march: '',
      april: 'NCD,IBD',
      may: 'NCD,IBD',
      june: ''
    },
    'Highland agro-pastoral corridor with intensive small ruminant & cattle movement.'
  ),
  createCalendarRecord(
    'arvl-cal-002',
    'Oromia ARVL',
    'Arsi',
    'Asakoo',
    {
      july: '',
      august: '',
      september: '',
      october: 'LSD,AHS',
      november: 'SGP',
      december: 'FMD',
      january: '',
      february: '',
      march: 'BQ',
      april: '',
      may: 'BP,OP,Ant,NCD,IBD',
      june: 'Rab'
    },
    'Targeted pastoral transition schedule.'
  ),
  createCalendarRecord(
    'arvl-cal-003',
    'Oromia ARVL',
    'Arsi',
    'Aminya',
    {
      july: 'BQ,Ant',
      august: 'BQ,Ant',
      september: 'FMD',
      october: '',
      november: 'LSD,AHS',
      december: 'LSD,AHS',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'SGP',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    },
    'Arsi-East Shewa border grazing corridor.'
  ),
  createCalendarRecord(
    'arvl-cal-004',
    'Oromia ARVL',
    'Arsi',
    'Bale Gasegar',
    {
      july: 'LSD,FMD',
      august: 'LSD,FMD',
      september: 'AHS',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP,BQ',
      february: 'BP,OP,BQ',
      march: 'Ant',
      april: 'NCD',
      may: 'IBD,Rab',
      june: ''
    },
    'High valley pasture with seasonal biting fly pressure.'
  ),
  createCalendarRecord(
    'arvl-cal-005',
    'Oromia ARVL',
    'Arsi',
    'Batu Dugda',
    {
      july: 'FMD,LSD',
      august: 'FMD,LSD',
      september: 'BQ',
      october: 'AHS,Rab',
      november: '',
      december: 'SGP',
      january: 'BP,OP',
      february: 'Ant',
      march: '',
      april: 'NCD,IBD',
      may: '',
      june: 'FMD'
    },
    'Rift Valley lakeshore zone; intense cattle trade route.'
  ),
  createCalendarRecord(
    'arvl-cal-006',
    'Oromia ARVL',
    'Arsi',
    'Chole',
    {
      july: 'AHS,LSD',
      august: 'AHS,LSD',
      september: 'SGP',
      october: 'BQ,Ant',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    },
    'High altitude mixed farming belt.'
  ),
  createCalendarRecord(
    'arvl-cal-007',
    'Oromia ARVL',
    'Arsi',
    'Digelu & Tijo',
    {
      july: 'LSD,SGP,AHS',
      august: 'LSD,SGP,AHS',
      september: 'BQ,Ant',
      october: 'FMD',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    },
    'Commercial dairy production and wheat belt.'
  ),
  createCalendarRecord(
    'arvl-cal-008',
    'Oromia ARVL',
    'Arsi',
    'Diksis',
    {
      july: 'BQ,Ant',
      august: 'BQ,Ant',
      september: 'LSD',
      october: 'SGP,AHS',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'FMD',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-009',
    'Oromia ARVL',
    'Arsi',
    'Dodota',
    {
      july: 'FMD,LSD',
      august: 'FMD,LSD',
      september: 'BQ',
      october: 'AHS,SGP',
      november: '',
      december: 'BP,OP',
      january: 'BP,OP,Ant',
      february: '',
      march: 'Rab',
      april: 'NCD,IBD',
      may: '',
      june: 'FMD'
    },
    'Awash river valley border; high livestock trade movement.'
  ),
  createCalendarRecord(
    'arvl-cal-010',
    'Oromia ARVL',
    'Arsi',
    'Enkelo Wabe',
    {
      july: 'LSD,AHS',
      august: 'LSD,AHS',
      september: 'SGP',
      october: 'BQ,Ant',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-011',
    'Oromia ARVL',
    'Arsi',
    'Gololcha (Arsi)',
    {
      july: 'BQ,Ant,LSD',
      august: 'BQ,Ant,LSD',
      september: 'SGP',
      october: 'AHS',
      november: '',
      december: 'FMD',
      january: 'BP,OP',
      february: 'BP,OP',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-012',
    'Oromia ARVL',
    'Arsi',
    'Guna',
    {
      july: 'LSD,AHS',
      august: 'LSD,AHS',
      september: 'SGP,BQ',
      october: 'Ant',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'FMD',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-013',
    'Oromia ARVL',
    'Arsi',
    'Hetosa',
    {
      july: 'FMD,LSD',
      august: 'FMD,LSD',
      september: 'AHS,SGP',
      october: 'BQ,Ant',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    },
    'Directly adjacent to Asella Regional Diagnostic Hub.'
  ),
  createCalendarRecord(
    'arvl-cal-014',
    'Oromia ARVL',
    'Arsi',
    'Jeju',
    {
      july: 'BQ,Ant',
      august: 'BQ,Ant',
      september: 'LSD',
      october: 'AHS,SGP',
      november: '',
      december: 'FMD',
      january: 'BP,OP',
      february: 'BP,OP',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-015',
    'Oromia ARVL',
    'Arsi',
    'Limuna Bilbilo',
    {
      july: 'LSD,SGP',
      august: 'LSD,SGP',
      september: 'AHS,BQ',
      october: 'Ant',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    },
    'Highland sheep production & cross-bred dairy zone.'
  ),
  createCalendarRecord(
    'arvl-cal-016',
    'Oromia ARVL',
    'Arsi',
    'Lude Hitosa',
    {
      july: 'LSD,AHS',
      august: 'LSD,AHS',
      september: 'BQ,Ant',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'FMD',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-017',
    'Oromia ARVL',
    'Arsi',
    'Merti',
    {
      july: 'FMD,LSD',
      august: 'FMD,LSD',
      september: 'BQ,Ant',
      october: 'AHS',
      november: 'SGP',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: 'FMD'
    },
    'Commercial sugarcane/agro-industrial valley.'
  ),
  createCalendarRecord(
    'arvl-cal-018',
    'Oromia ARVL',
    'Arsi',
    'Munesa',
    {
      july: 'LSD,AHS',
      august: 'LSD,AHS',
      september: 'SGP',
      october: 'BQ,Ant',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-019',
    'Oromia ARVL',
    'Arsi',
    'Robe (Arsi)',
    {
      july: 'BQ,Ant,LSD',
      august: 'BQ,Ant,LSD',
      september: 'AHS',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-020',
    'Oromia ARVL',
    'Arsi',
    'Seru',
    {
      july: 'LSD,AHS,SGP',
      august: 'LSD,AHS,SGP',
      september: 'BQ,Ant',
      october: '',
      november: '',
      december: 'FMD',
      january: 'BP,OP',
      february: 'BP,OP',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-021',
    'Oromia ARVL',
    'Arsi',
    'Sire',
    {
      july: 'FMD,LSD',
      august: 'FMD,LSD',
      september: 'BQ',
      october: 'AHS,SGP',
      november: '',
      december: '',
      january: 'BP,OP,Ant',
      february: 'BP,OP,Ant',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-022',
    'Oromia ARVL',
    'Arsi',
    'Shirka',
    {
      july: 'LSD,AHS',
      august: 'LSD,AHS',
      september: 'SGP,BQ',
      october: 'Ant',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-023',
    'Oromia ARVL',
    'Arsi',
    'Sude',
    {
      july: 'BQ,Ant',
      august: 'BQ,Ant',
      september: 'LSD,AHS',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'FMD',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-024',
    'Oromia ARVL',
    'Arsi',
    'Tena',
    {
      july: 'LSD,AHS',
      august: 'LSD,AHS',
      september: 'BQ,Ant',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-025',
    'Oromia ARVL',
    'Arsi',
    'Tiyo',
    {
      july: 'FMD,LSD,AHS',
      august: 'FMD,LSD,AHS',
      september: 'SGP,BQ',
      october: 'Ant,Rab',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    },
    'Surrounds Asella town hub; prioritized high-yield dairy cows.'
  ),
  createCalendarRecord(
    'arvl-cal-026',
    'Oromia ARVL',
    'Arsi',
    'Ziway Dugda',
    {
      july: 'FMD,LSD',
      august: 'FMD,LSD',
      september: 'BQ',
      october: 'AHS,SGP',
      november: '',
      december: '',
      january: 'BP,OP,Ant',
      february: 'BP,OP,Ant',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: 'FMD'
    }
  ),

  // 2. West Arsi Zone Woredas
  createCalendarRecord(
    'arvl-cal-027',
    'Oromia ARVL',
    'West Arsi',
    'Adaba',
    {
      july: 'LSD,AHS,SGP',
      august: 'LSD,AHS,SGP',
      september: 'BQ,Ant',
      october: 'FMD',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    },
    'Key pastoral route into Bale mountains.'
  ),
  createCalendarRecord(
    'arvl-cal-028',
    'Oromia ARVL',
    'West Arsi',
    'Negele Arsi',
    {
      july: 'FMD,LSD',
      august: 'FMD,LSD',
      september: 'BQ,Ant',
      october: 'AHS,SGP',
      november: '',
      december: 'BP,OP',
      january: 'BP,OP',
      february: '',
      march: 'Rab',
      april: 'NCD,IBD',
      may: '',
      june: 'FMD'
    }
  ),
  createCalendarRecord(
    'arvl-cal-029',
    'Oromia ARVL',
    'West Arsi',
    'Dodola',
    {
      july: 'LSD,AHS',
      august: 'LSD,AHS',
      september: 'SGP,BQ',
      october: 'Ant',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-030',
    'Oromia ARVL',
    'West Arsi',
    'Gedeb Hasasa',
    {
      july: 'BQ,Ant,LSD',
      august: 'BQ,Ant,LSD',
      september: 'AHS,SGP',
      october: 'FMD',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-031',
    'Oromia ARVL',
    'West Arsi',
    'Kofele',
    {
      july: 'LSD,AHS',
      august: 'LSD,AHS',
      september: 'BQ,Ant',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    },
    'Cold highland potato-dairy belt.'
  ),
  createCalendarRecord(
    'arvl-cal-032',
    'Oromia ARVL',
    'West Arsi',
    'Kokosa',
    {
      july: 'LSD,CBPP',
      august: 'LSD,CBPP',
      september: 'BQ,Ant',
      october: 'PPR,SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'FMD',
      march: 'FMD',
      april: 'NCD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-033',
    'Oromia ARVL',
    'West Arsi',
    'Qore',
    {
      july: 'FMD,LSD',
      august: 'FMD,LSD',
      september: 'BQ',
      october: 'AHS,SGP',
      november: '',
      december: '',
      january: 'BP,OP,Ant',
      february: 'BP,OP,Ant',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-034',
    'Oromia ARVL',
    'West Arsi',
    'Nannawa Shashamene',
    {
      july: 'FMD,LSD,Rab',
      august: 'FMD,LSD,Rab',
      september: 'BQ,Ant',
      october: 'AHS,SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    },
    'Critical regional livestock trade crossroads.'
  ),
  createCalendarRecord(
    'arvl-cal-035',
    'Oromia ARVL',
    'West Arsi',
    'Nensebo',
    {
      july: 'LSD,AHS',
      august: 'LSD,AHS',
      september: 'BQ,Ant',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-036',
    'Oromia ARVL',
    'West Arsi',
    'Seraro',
    {
      july: 'BQ,Ant,FMD',
      august: 'BQ,Ant,FMD',
      september: 'LSD',
      october: 'AHS,SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-037',
    'Oromia ARVL',
    'West Arsi',
    'Shala',
    {
      july: 'FMD,LSD',
      august: 'FMD,LSD',
      september: 'BQ,Ant',
      october: 'AHS,SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-038',
    'Oromia ARVL',
    'West Arsi',
    'Heban Arsi',
    {
      july: 'LSD,AHS',
      august: 'LSD,AHS',
      september: 'BQ,Ant',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'FMD',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-039',
    'Oromia ARVL',
    'West Arsi',
    'Wondo',
    {
      july: 'LSD,AHS,Rab',
      august: 'LSD,AHS,Rab',
      september: 'BQ,Ant',
      october: 'SGP,FMD',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),

  // 3. Bale Zone Woredas
  createCalendarRecord(
    'arvl-cal-040',
    'Oromia ARVL',
    'Bale',
    'Agarfa',
    {
      july: 'LSD,AHS',
      august: 'LSD,AHS',
      september: 'BQ,Ant',
      october: 'SGP,FMD',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-041',
    'Oromia ARVL',
    'Bale',
    'Berbere',
    {
      july: 'BQ,Ant,PPR',
      august: 'BQ,Ant,PPR',
      september: 'LSD',
      october: 'CCPP,SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'FMD',
      march: 'FMD',
      april: 'NCD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-042',
    'Oromia ARVL',
    'Bale',
    'Dinsho',
    {
      july: 'AHS,Rab',
      august: 'AHS,Rab',
      september: 'LSD,BQ',
      october: 'Ant',
      november: '',
      december: 'SGP',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: '',
      june: ''
    },
    'Bale Mountains National Park boundary; crucial wildlife-livestock rabies interface.'
  ),
  createCalendarRecord(
    'arvl-cal-043',
    'Oromia ARVL',
    'Bale',
    'Gasera',
    {
      july: 'LSD,AHS',
      august: 'LSD,AHS',
      september: 'BQ,Ant',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-044',
    'Oromia ARVL',
    'Bale',
    'Goba',
    {
      july: 'LSD,AHS,Rab',
      august: 'LSD,AHS,Rab',
      september: 'BQ,Ant',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-045',
    'Oromia ARVL',
    'Bale',
    'Goro (Bale)',
    {
      july: 'BQ,Ant',
      august: 'BQ,Ant',
      september: 'LSD,PPR',
      october: 'SGP,AHS',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'FMD',
      march: '',
      april: 'NCD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-046',
    'Oromia ARVL',
    'Bale',
    'Guradamole',
    {
      july: 'PPR,CCPP,CBPP',
      august: 'PPR,CCPP,CBPP',
      september: 'BQ,Ant',
      october: 'LSD',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'FMD',
      march: '',
      april: 'NCD',
      may: 'Rab',
      june: ''
    },
    'Pastoral lowland camel & goat production zone.'
  ),
  createCalendarRecord(
    'arvl-cal-047',
    'Oromia ARVL',
    'Bale',
    'Harena Buluk',
    {
      july: 'LSD,AHS',
      august: 'LSD,AHS',
      september: 'BQ,Ant',
      october: 'SGP',
      november: '',
      december: 'FMD',
      january: 'BP,OP',
      february: 'BP,OP',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-048',
    'Oromia ARVL',
    'Bale',
    'Meda Welabu',
    {
      july: 'CBPP,PPR,CCPP',
      august: 'CBPP,PPR,CCPP',
      september: 'BQ,Ant',
      october: 'LSD',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'FMD',
      march: 'FMD',
      april: 'NCD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-049',
    'Oromia ARVL',
    'Bale',
    'Sinana',
    {
      july: 'LSD,AHS',
      august: 'LSD,AHS',
      september: 'BQ,Ant',
      october: 'SGP,FMD',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    },
    'Highland agricultural research & seed production center.'
  ),

  // 4. East Bale Zone Woredas
  createCalendarRecord(
    'arvl-cal-050',
    'Oromia ARVL',
    'East Bale',
    'Sawena',
    {
      july: 'PPR,CCPP,CPox',
      august: 'PPR,CCPP,CPox',
      september: 'BQ,Ant',
      october: 'LSD',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'FMD',
      march: '',
      april: 'NCD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-051',
    'Oromia ARVL',
    'East Bale',
    'Rayitu',
    {
      july: 'CBPP,PPR,CPox',
      august: 'CBPP,PPR,CPox',
      september: 'BQ,Ant',
      october: 'CCPP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'FMD',
      march: '',
      april: 'NCD',
      may: 'Rab',
      june: ''
    },
    'Pastoral rangeland with large camel herds.'
  ),
  createCalendarRecord(
    'arvl-cal-052',
    'Oromia ARVL',
    'East Bale',
    'Lega Hida',
    {
      july: 'BQ,Ant,PPR',
      august: 'BQ,Ant,PPR',
      september: 'LSD',
      october: 'SGP,CCPP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'FMD',
      march: '',
      april: 'NCD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-053',
    'Oromia ARVL',
    'East Bale',
    'Gindhir',
    {
      july: 'LSD,AHS,FMD',
      august: 'LSD,AHS,FMD',
      september: 'BQ,Ant',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    },
    'Key trading and livestock distribution hub in East Bale.'
  ),
  createCalendarRecord(
    'arvl-cal-054',
    'Oromia ARVL',
    'East Bale',
    'Dawe Qachan',
    {
      july: 'PPR,CCPP,CPox',
      august: 'PPR,CCPP,CPox',
      september: 'BQ,Ant',
      october: 'LSD',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'FMD',
      march: '',
      april: 'NCD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-055',
    'Oromia ARVL',
    'East Bale',
    'Dawe Serar',
    {
      july: 'BQ,Ant,PPR',
      august: 'BQ,Ant,PPR',
      september: 'CCPP',
      october: 'LSD',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'FMD',
      march: '',
      april: 'NCD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-056',
    'Oromia ARVL',
    'East Bale',
    'Gololcha (East Bale)',
    {
      july: 'LSD,AHS',
      august: 'LSD,AHS',
      september: 'BQ,Ant',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'FMD',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),

  // 5. East Shewa Zone Woredas
  createCalendarRecord(
    'arvl-cal-057',
    'Oromia ARVL',
    'East Shewa',
    'Ada’a',
    {
      july: 'FMD,LSD',
      august: 'FMD,LSD',
      september: 'BQ,Ant',
      october: 'AHS,SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    },
    'Intensive peri-urban dairy and poultry belt surrounding Bishoftu.'
  ),
  createCalendarRecord(
    'arvl-cal-058',
    'Oromia ARVL',
    'East Shewa',
    'Adama Zuria',
    {
      july: 'FMD,LSD',
      august: 'FMD,LSD',
      september: 'BQ,Ant',
      october: 'AHS,Rab',
      november: '',
      december: 'BP,OP',
      january: 'BP,OP',
      february: '',
      march: 'FMD',
      april: 'NCD,IBD',
      may: '',
      june: 'FMD'
    }
  ),
  createCalendarRecord(
    'arvl-cal-059',
    'Oromia ARVL',
    'East Shewa',
    'Adami Tullu & Jido Kombolcha',
    {
      july: 'FMD,LSD',
      august: 'FMD,LSD',
      september: 'BQ',
      october: 'AHS,SGP',
      november: '',
      december: '',
      january: 'BP,OP,Ant',
      february: 'BP,OP,Ant',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: 'FMD'
    }
  ),
  createCalendarRecord(
    'arvl-cal-060',
    'Oromia ARVL',
    'East Shewa',
    'Bora',
    {
      july: 'LSD,AHS',
      august: 'LSD,AHS',
      september: 'BQ,Ant',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'FMD',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-061',
    'Oromia ARVL',
    'East Shewa',
    'Boset',
    {
      july: 'BQ,Ant,FMD',
      august: 'BQ,Ant,FMD',
      september: 'LSD',
      october: 'AHS,SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-062',
    'Oromia ARVL',
    'East Shewa',
    'Dugda',
    {
      july: 'FMD,LSD',
      august: 'FMD,LSD',
      september: 'BQ',
      october: 'AHS,SGP',
      november: '',
      december: '',
      january: 'BP,OP,Ant',
      february: 'BP,OP,Ant',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: 'FMD'
    }
  ),
  createCalendarRecord(
    'arvl-cal-063',
    'Oromia ARVL',
    'East Shewa',
    'Fentale',
    {
      july: 'PPR,CCPP,CBPP',
      august: 'PPR,CCPP,CBPP',
      september: 'BQ,Ant',
      october: 'LSD',
      november: '',
      december: 'FMD',
      january: 'BP,OP',
      february: 'BP,OP',
      march: '',
      april: 'NCD',
      may: 'Rab',
      june: ''
    },
    'Awash national park and pastoral Karayu community grazing system.'
  ),
  createCalendarRecord(
    'arvl-cal-064',
    'Oromia ARVL',
    'East Shewa',
    'Gimbichu',
    {
      july: 'LSD,AHS',
      august: 'LSD,AHS',
      september: 'BQ,Ant',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-065',
    'Oromia ARVL',
    'East Shewa',
    'Liben',
    {
      july: 'FMD,LSD',
      august: 'FMD,LSD',
      september: 'BQ,Ant',
      october: 'AHS,SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-066',
    'Oromia ARVL',
    'East Shewa',
    'Lume',
    {
      july: 'FMD,LSD',
      august: 'FMD,LSD',
      september: 'BQ,Ant',
      october: 'AHS,SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    },
    'Modjo export abattoir holding corridor.'
  ),
  createCalendarRecord(
    'arvl-cal-067',
    'Oromia ARVL',
    'East Shewa',
    'Ziway/Batu Rural',
    {
      july: 'FMD,LSD',
      august: 'FMD,LSD',
      september: 'BQ',
      october: 'AHS,SGP',
      november: '',
      december: '',
      january: 'BP,OP,Ant',
      february: '',
      march: 'Rab',
      april: 'NCD,IBD',
      may: '',
      june: 'FMD'
    }
  ),

  // 6. North Shewa Zone Woredas
  createCalendarRecord(
    'arvl-cal-068',
    'Oromia ARVL',
    'North Shewa',
    'Abichu & Gnaa',
    {
      july: 'AHS,LSD',
      august: 'AHS,LSD',
      september: 'BQ,Ant',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-069',
    'Oromia ARVL',
    'North Shewa',
    'Aleltu',
    {
      july: 'LSD,AHS',
      august: 'LSD,AHS',
      september: 'BQ,Ant',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'FMD',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-070',
    'Oromia ARVL',
    'North Shewa',
    'Bereh',
    {
      july: 'LSD,AHS',
      august: 'LSD,AHS',
      september: 'BQ,Ant',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-071',
    'Oromia ARVL',
    'North Shewa',
    'Degem',
    {
      july: 'AHS,LSD,Rab',
      august: 'AHS,LSD,Rab',
      september: 'BQ,Ant',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: '',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-072',
    'Oromia ARVL',
    'North Shewa',
    'Dera',
    {
      july: 'BQ,Ant,LSD',
      august: 'BQ,Ant,LSD',
      september: 'AHS,SGP',
      october: 'FMD',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-073',
    'Oromia ARVL',
    'North Shewa',
    'Debre Libanos',
    {
      july: 'AHS,Rab',
      august: 'AHS,Rab',
      september: 'LSD,BQ',
      october: 'Ant,SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: '',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-074',
    'Oromia ARVL',
    'North Shewa',
    'Gerar Jarso',
    {
      july: 'LSD,AHS',
      august: 'LSD,AHS',
      september: 'BQ,Ant',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-075',
    'Oromia ARVL',
    'North Shewa',
    'Hidabu Abote',
    {
      july: 'BQ,Ant',
      august: 'BQ,Ant',
      september: 'LSD,AHS',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'FMD',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-076',
    'Oromia ARVL',
    'North Shewa',
    'Jida',
    {
      july: 'LSD,AHS',
      august: 'LSD,AHS',
      september: 'BQ,Ant',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-077',
    'Oromia ARVL',
    'North Shewa',
    'Kembibit',
    {
      july: 'AHS,LSD',
      august: 'AHS,LSD',
      september: 'BQ,Ant',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'FMD',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-078',
    'Oromia ARVL',
    'North Shewa',
    'Kuyu',
    {
      july: 'BQ,Ant,LSD',
      august: 'BQ,Ant,LSD',
      september: 'AHS,SGP',
      october: 'FMD',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-079',
    'Oromia ARVL',
    'North Shewa',
    'Mulo',
    {
      july: 'LSD,AHS',
      august: 'LSD,AHS',
      september: 'BQ,Ant',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-080',
    'Oromia ARVL',
    'North Shewa',
    'Sululta (North Shewa)',
    {
      july: 'FMD,LSD,AHS',
      august: 'FMD,LSD,AHS',
      september: 'BQ,Ant',
      october: 'SGP,Rab',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-081',
    'Oromia ARVL',
    'North Shewa',
    'Wara Jarso',
    {
      july: 'BQ,Ant',
      august: 'BQ,Ant',
      september: 'LSD,AHS',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'FMD',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-082',
    'Oromia ARVL',
    'North Shewa',
    'Wuchale',
    {
      july: 'AHS,LSD',
      august: 'AHS,LSD',
      september: 'BQ,Ant',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-083',
    'Oromia ARVL',
    'North Shewa',
    'Yaya Gulele',
    {
      july: 'LSD,AHS',
      august: 'LSD,AHS',
      september: 'BQ,Ant',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'FMD',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),

  // 7. Sheger City Sub-cities & Administrative Units
  createCalendarRecord(
    'arvl-cal-084',
    'Oromia ARVL',
    'Sheger City',
    'Burayu',
    {
      july: 'Rab,FMD',
      august: 'Rab,FMD',
      september: 'LSD,AHS',
      october: 'BQ,Ant',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    },
    'Urban/peri-urban dairy & intensive commercial poultry.'
  ),
  createCalendarRecord(
    'arvl-cal-085',
    'Oromia ARVL',
    'Sheger City',
    'Eka Tafo',
    {
      july: 'Rab,FMD',
      august: 'Rab,FMD',
      september: 'LSD,AHS',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-086',
    'Oromia ARVL',
    'Sheger City',
    'Furi',
    {
      july: 'FMD,LSD',
      august: 'FMD,LSD',
      september: 'BQ,Ant',
      october: 'Rab,AHS',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-087',
    'Oromia ARVL',
    'Sheger City',
    'Gefersa Guji',
    {
      july: 'Rab,AHS',
      august: 'Rab,AHS',
      september: 'LSD,BQ',
      october: 'Ant,SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-088',
    'Oromia ARVL',
    'Sheger City',
    'Gelan',
    {
      july: 'FMD,LSD',
      august: 'FMD,LSD',
      september: 'BQ,Ant',
      october: 'Rab,AHS',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: 'FMD'
    },
    'Major livestock freight, holding & dry port interchange.'
  ),
  createCalendarRecord(
    'arvl-cal-089',
    'Oromia ARVL',
    'Sheger City',
    'Gelan Guda',
    {
      july: 'FMD,Rab',
      august: 'FMD,Rab',
      september: 'LSD,AHS',
      october: 'BQ,Ant',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-090',
    'Oromia ARVL',
    'Sheger City',
    'Koye',
    {
      july: 'Rab,AHS',
      august: 'Rab,AHS',
      september: 'LSD,FMD',
      october: 'SGP,BQ',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-091',
    'Oromia ARVL',
    'Sheger City',
    'Kara Gida',
    {
      july: 'LSD,AHS',
      august: 'LSD,AHS',
      september: 'BQ,Ant',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-092',
    'Oromia ARVL',
    'Sheger City',
    'Mana Abichu',
    {
      july: 'AHS,LSD',
      august: 'AHS,LSD',
      september: 'BQ,Ant',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-093',
    'Oromia ARVL',
    'Sheger City',
    'Melka Nono',
    {
      july: 'BQ,Ant',
      august: 'BQ,Ant',
      september: 'LSD,AHS',
      october: 'SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'FMD',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-094',
    'Oromia ARVL',
    'Sheger City',
    'Sebeta',
    {
      july: 'FMD,LSD,Rab',
      august: 'FMD,LSD,Rab',
      september: 'BQ,Ant',
      october: 'AHS,SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    },
    'Major commercial feedlot, agro-processing and dairy belt.'
  ),
  createCalendarRecord(
    'arvl-cal-095',
    'Oromia ARVL',
    'Sheger City',
    'Sululta (Sheger City)',
    {
      july: 'FMD,LSD,Rab',
      august: 'FMD,LSD,Rab',
      september: 'AHS,SGP',
      october: 'BQ,Ant',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),

  // 8. Cities & Municipal Units (Adama, Shashamane, Bishoftu)
  createCalendarRecord(
    'arvl-cal-096',
    'Oromia ARVL',
    'Adama City',
    'Adama City (All Sub-cities)',
    {
      july: 'Rab,FMD',
      august: 'Rab,FMD',
      september: 'LSD,AHS',
      october: 'BQ,Ant',
      november: '',
      december: 'BP,OP',
      january: 'BP,OP',
      february: '',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: 'FMD'
    },
    'Central livestock transit market & feedlot quarantine area.'
  ),
  createCalendarRecord(
    'arvl-cal-097',
    'Oromia ARVL',
    'Shashamane City',
    'Shashamane City (All Sub-cities)',
    {
      july: 'Rab,FMD',
      august: 'Rab,FMD',
      september: 'LSD,AHS',
      october: 'BQ,Ant',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    },
    'Southern Oromia trade crossroads with intensive canine rabies focus.'
  ),
  createCalendarRecord(
    'arvl-cal-098',
    'Oromia ARVL',
    'Bishoftu City',
    'Bishoftu City (All Sub-cities)',
    {
      july: 'Rab,FMD,NCD',
      august: 'Rab,FMD,NCD',
      september: 'IBD,LSD',
      october: 'AHS,SGP',
      november: '',
      december: '',
      january: 'BP,OP,BQ',
      february: 'BP,OP,BQ',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    },
    'National veterinary vaccine manufacturing (NVI) and poultry nucleus.'
  ),

  // 9. Official Town-Level Operational Units
  createCalendarRecord(
    'arvl-cal-099',
    'Oromia ARVL',
    'Town-level operational units',
    'Shano Town',
    {
      july: 'AHS,Rab',
      august: 'AHS,Rab',
      september: 'LSD,BQ',
      october: 'Ant,SGP',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-100',
    'Oromia ARVL',
    'Town-level operational units',
    'Sandefa Bake Town',
    {
      july: 'Rab,FMD',
      august: 'Rab,FMD',
      september: 'LSD,AHS',
      october: 'BQ,Ant',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'FMD',
      march: '',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-101',
    'Oromia ARVL',
    'Town-level operational units',
    'Modjo Town',
    {
      july: 'FMD,Rab',
      august: 'FMD,Rab',
      september: 'LSD,BQ',
      october: 'Ant,AHS',
      november: '',
      december: 'BP,OP',
      january: 'BP,OP',
      february: '',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: 'FMD'
    },
    'Key export abattoir quarantine and holding center.'
  ),
  createCalendarRecord(
    'arvl-cal-102',
    'Oromia ARVL',
    'Town-level operational units',
    'Batu Town',
    {
      july: 'FMD,LSD',
      august: 'FMD,LSD',
      september: 'BQ',
      october: 'AHS,Rab',
      november: '',
      december: '',
      january: 'BP,OP,Ant',
      february: '',
      march: 'Rab',
      april: 'NCD,IBD',
      may: '',
      june: 'FMD'
    }
  ),
  createCalendarRecord(
    'arvl-cal-103',
    'Oromia ARVL',
    'Town-level operational units',
    'Asella Town',
    {
      july: 'FMD,LSD,Rab',
      august: 'FMD,LSD,Rab',
      september: 'AHS,SGP',
      october: 'BQ,Ant',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    },
    'Host municipality of the Asela Regional Veterinary Laboratory (ARVL).'
  ),
  createCalendarRecord(
    'arvl-cal-104',
    'Oromia ARVL',
    'Town-level operational units',
    'Dodola Town',
    {
      july: 'Rab,AHS',
      august: 'Rab,AHS',
      september: 'LSD,BQ',
      october: 'SGP,Ant',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  ),
  createCalendarRecord(
    'arvl-cal-105',
    'Oromia ARVL',
    'Town-level operational units',
    'Robe Town',
    {
      july: 'Rab,AHS',
      august: 'Rab,AHS',
      september: 'LSD,FMD',
      october: 'BQ,Ant',
      november: '',
      december: '',
      january: 'BP,OP',
      february: 'BP,OP',
      march: 'FMD',
      april: 'NCD,IBD',
      may: 'Rab',
      june: ''
    }
  )
];

/**
 * 5. COMPREHENSIVE DATA QUALITY VALIDATOR & AUDIT REPORT GENERATOR
 */
export function generateDataQualityReport(
  records: ARVLVaccinationRecord[],
  dictionary: VaccineDictionaryEntry[]
): DataQualityReport {
  const validDictCodes = new Set(dictionary.map(d => d.code.toUpperCase()));
  const uniqueRegions = new Set<string>();
  const uniqueZones = new Set<string>();
  const uniqueDistricts = new Set<string>();
  const districtSeen = new Map<string, number>();
  const unknownCodeCounts = new Map<string, { occurrences: number; districts: Set<string> }>();
  const potentialDuplicates: string[] = [];
  const emptyDistricts: string[] = [];
  const malformedEntries: string[] = [];
  const nameVariants: { original: string; canonical: string }[] = [];
  let totalMonthlyEntries = 0;
  const uniqueTargets = new Set<string>();

  records.forEach(rec => {
    uniqueRegions.add(rec.region);
    uniqueZones.add(rec.zone);
    uniqueDistricts.add(rec.district);

    // Duplicate check
    const normKey = `${rec.zone.toLowerCase()}::${rec.district.toLowerCase()}`;
    const count = (districtSeen.get(normKey) || 0) + 1;
    districtSeen.set(normKey, count);
    if (count === 2) {
      potentialDuplicates.push(`${rec.district} (${rec.zone})`);
    }

    // Empty district check
    let hasTarget = false;
    MONTH_ORDER.forEach(month => {
      const targets = rec.months[month] || [];
      if (targets.length > 0) {
        hasTarget = true;
        totalMonthlyEntries += targets.length;
        targets.forEach(t => {
          uniqueTargets.add(t);
          if (!validDictCodes.has(t.toUpperCase())) {
            const entry = unknownCodeCounts.get(t) || { occurrences: 0, districts: new Set() };
            entry.occurrences += 1;
            entry.districts.add(rec.district);
            unknownCodeCounts.set(t, entry);
          }
        });
      }
    });

    if (!hasTarget) {
      emptyDistricts.push(`${rec.district} (${rec.zone})`);
    }

    // Name variant check
    if (rec.normalizedDistrict && rec.normalizedDistrict !== rec.district) {
      nameVariants.push({ original: rec.district, canonical: rec.normalizedDistrict });
    }
  });

  const unknownCodes = Array.from(unknownCodeCounts.entries()).map(([code, info]) => ({
    code,
    occurrences: info.occurrences,
    districts: Array.from(info.districts)
  }));

  return {
    totalSourceRows: records.length,
    totalValidDistricts: uniqueDistricts.size,
    totalRegions: uniqueRegions.size,
    totalZones: uniqueZones.size,
    totalDistricts: uniqueDistricts.size,
    totalMonthlyEntries,
    totalUniqueTargets: uniqueTargets.size,
    unknownCodes,
    potentialDuplicates,
    emptyDistricts,
    malformedEntries,
    nameVariants
  };
}
