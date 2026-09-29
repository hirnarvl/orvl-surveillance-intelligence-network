import { 
  AdnisSpeciesOption, 
  AdnisSymptomDefinition, 
  AdnisTentativeDiagnosisOption, 
  AdnisReport 
} from '../types/adnisReporting';

export const ADNIS_SPECIES_OPTIONS: AdnisSpeciesOption[] = [
  {
    id: 'Bovine',
    label: 'Bovine (Cattle / Oxen / Calves)',
    scientificGroup: 'Bos taurus / Bos indicus (Zebu / Boran / Harar)',
    commonExamples: 'Boran bulls, local Zebu cows, crossbred dairy cattle'
  },
  {
    id: 'Ovine',
    label: 'Ovine (Sheep / Ewes / Lambs)',
    scientificGroup: 'Ovis aries (Blackhead Somali / Menz / Hararghe highland)',
    commonExamples: 'Fat-tailed sheep, highland grazing flocks'
  },
  {
    id: 'Caprine',
    label: 'Caprine (Goats / Bucks / Kids)',
    scientificGroup: 'Capra hircus (Hararghe Highland / Somali goats)',
    commonExamples: 'Agro-pastoral browse herds, local meat goats'
  },
  {
    id: 'Avian',
    label: 'Avian (Poultry / Chickens / Turkeys)',
    scientificGroup: 'Gallus gallus domesticus (Indigenous / Improved SASSO / Bovans)',
    commonExamples: 'Village scavenging poultry, peri-urban layer flocks'
  },
  {
    id: 'Camel',
    label: 'Camel (Dromedary / One-Humped)',
    scientificGroup: 'Camelus dromedarius (Somali / Oromo camel breeds)',
    commonExamples: 'Lowland pastoral transport and milk herds'
  },
  {
    id: 'Equine',
    label: 'Equine (Donkeys / Horses / Mules)',
    scientificGroup: 'Equus asinus / Equus caballus',
    commonExamples: 'Pack donkeys, draft horses, transport mules'
  },
  {
    id: 'Swine',
    label: 'Swine (Pigs / Hogs)',
    scientificGroup: 'Sus domesticus',
    commonExamples: 'Peri-urban intensive or backyard swine'
  },
  {
    id: 'Canine',
    label: 'Canine (Domestic & Feral Dogs)',
    scientificGroup: 'Canis lupus familiaris',
    commonExamples: 'Pastoral herd guardian dogs, community dogs'
  },
  {
    id: 'Feline',
    label: 'Feline (Domestic Cats)',
    scientificGroup: 'Felis catus',
    commonExamples: 'Homestead and warehouse pest control cats'
  }
];

export const ADNIS_SYMPTOMS_CATALOG: AdnisSymptomDefinition[] = [
  // Oral / Mucosal
  {
    id: 'sym-oral-blisters',
    code: 'SYM_ORAL_VESICLES',
    label: 'Vesicles / Blisters on Tongue, Dental Pad & Gums',
    category: 'Oral / Mucosal',
    description: 'Intact or ruptured fluid-filled vesicles on oral mucosa, dental pad, tongue, or lips.',
    associatedSyndromes: ['FMD', 'PPR']
  },
  {
    id: 'sym-salivation',
    code: 'SYM_PROFUSE_SALIVATION',
    label: 'Profuse / Ropy Salivation & Drooling (Frothing)',
    category: 'Oral / Mucosal',
    description: 'Stringy ropy saliva hanging from muzzle; smacking of lips or reluctance to feed.',
    associatedSyndromes: ['FMD', 'Rabies']
  },
  {
    id: 'sym-oral-necrosis',
    code: 'SYM_STOMATITIS_EROSIONS',
    label: 'Necrotic Stomatitis / Cheesy Oral Plaques & Foul Odor',
    category: 'Oral / Mucosal',
    description: 'Deep erosions, diphtheritic pseudo-membranes, foul breath in small ruminants.',
    associatedSyndromes: ['PPR']
  },

  // Locomotion / Foot
  {
    id: 'sym-coronary-lesions',
    code: 'SYM_CORONARY_INTERDIGITAL',
    label: 'Coronary Band / Interdigital Cleft Ulcers & Sloughing',
    category: 'Locomotion / Foot',
    description: 'Ulcerative erosions at hooves, interdigital space, or hoof separation.',
    associatedSyndromes: ['FMD']
  },
  {
    id: 'sym-severe-lameness',
    code: 'SYM_SEVERE_LAMENESS',
    label: 'Severe Lameness / Reluctance to Rise or Walk',
    category: 'Locomotion / Foot',
    description: 'Animals shifting weight, kicking feet, or recumbent due to extremity pain.',
    associatedSyndromes: ['FMD', 'Blackleg']
  },

  // Respiratory / Ocular
  {
    id: 'sym-nasal-ocular-discharge',
    code: 'SYM_MUCOPURULENT_DISCHARGE',
    label: 'Mucopurulent Nasal & Ocular Discharge / Crusts',
    category: 'Respiratory / Ocular',
    description: 'Thick yellow-green discharge encrusting nostrils and eyes; conjunctivitis.',
    associatedSyndromes: ['PPR', 'CBPP', 'CCPP']
  },
  {
    id: 'sym-coughing-dyspnea',
    code: 'SYM_COUGHING_DYSPNEA',
    label: 'Painful Coughing, Grunting & Extended Neck (Dyspnea)',
    category: 'Respiratory / Ocular',
    description: 'Forced breathing with open mouth, flared nostrils, arched back, and painful cough.',
    associatedSyndromes: ['CBPP', 'CCPP', 'PPR']
  },

  // Skin / External
  {
    id: 'sym-skin-nodules',
    code: 'SYM_CIRCUMSCRIBED_NODULES',
    label: 'Circumscribed Firm Skin Nodules (0.5 – 5 cm) / "Sit-Fast"',
    category: 'Skin / External',
    description: 'Round, raised cutaneous lumps across neck, limbs, perineum, progressing to core necrosis.',
    associatedSyndromes: ['LSD', 'Sheep & Goat Pox']
  },
  {
    id: 'sym-teat-lesions',
    code: 'SYM_TEAT_UDDER_VESICLES',
    label: 'Vesicular / Pox Lesions on Teats & Udder (Mastitis)',
    category: 'Skin / External',
    description: 'Painful sores and ulcers on teats leading to acute drop in milk yield.',
    associatedSyndromes: ['FMD', 'LSD']
  },
  {
    id: 'sym-peripheral-edema',
    code: 'SYM_PERIPHERAL_EDEMA',
    label: 'Subcutaneous Edema of Brisket, Dewlap, Throat or Limbs',
    category: 'Skin / External',
    description: 'Pitting fluid accumulation in dependent ventral subcutaneous tissues.',
    associatedSyndromes: ['Anthrax', 'LSD', 'AHS']
  },

  // Systemic / Mortality
  {
    id: 'sym-sudden-death',
    code: 'SYM_PERACUTE_SUDDEN_DEATH',
    label: 'Sudden Peracute Death without Prior Illness (Carcass Bloat)',
    category: 'Systemic / Mortality',
    description: 'Animals found dead overnight; rapid decomposition; uncoagulated blood from orifices.',
    associatedSyndromes: ['Anthrax', 'Blackleg']
  },
  {
    id: 'sym-high-fever',
    code: 'SYM_PYREXIA_HIGH_FEVER',
    label: 'High Pyrexia / Rectal Temperature > 40.5°C (> 105°F)',
    category: 'Systemic / Mortality',
    description: 'Marked thermal elevation, shivering, depression, anorexia.',
    associatedSyndromes: ['FMD', 'PPR', 'LSD', 'Anthrax']
  },

  // Gastrointestinal
  {
    id: 'sym-profuse-diarrhea',
    code: 'SYM_WATERY_BLOODY_DIARRHEA',
    label: 'Profuse Watery or Fetid Bloody Diarrhea (Dysentery)',
    category: 'Gastrointestinal',
    description: 'Severe fluid loss, stained hindquarters, dehydration, tenesmus.',
    associatedSyndromes: ['PPR', 'Newcastle Disease']
  },

  // Neurological
  {
    id: 'sym-nervous-signs',
    code: 'SYM_NERVOUS_SIGNS_TORTICOLLIS',
    label: 'Nervous Signs, Aggression, Paralysis, Circling or Torticollis',
    category: 'Neurological',
    description: 'Twisting of neck, tremors, ataxia, behavioral changes, unprovoked biting, or pharyngeal paralysis.',
    associatedSyndromes: ['Rabies', 'Newcastle Disease']
  },

  // Reproductive
  {
    id: 'sym-abortion-storm',
    code: 'SYM_ABORTION_STORM',
    label: 'Abortion Storm in Late Gestation / Retained Placenta',
    category: 'Reproductive / Production',
    description: 'Multiple pregnant dams aborting within a short time window.',
    associatedSyndromes: ['Brucellosis', 'RVF']
  }
];

export const ADNIS_DIAGNOSES_CATALOG: AdnisTentativeDiagnosisOption[] = [
  {
    id: 'diag-fmd',
    code: 'FMD',
    name: 'Foot-and-Mouth Disease (FMD)',
    shortName: 'FMD',
    primarySpecies: ['Bovine', 'Ovine', 'Caprine', 'Swine'],
    description: 'Aphthovirus disease causing vesicular eruptions on mouth, feet, and teats.',
    isPriorityFAST: true
  },
  {
    id: 'diag-ppr',
    code: 'PPR',
    name: 'Peste des Petits Ruminants (PPR)',
    shortName: 'PPR',
    primarySpecies: ['Ovine', 'Caprine'],
    description: 'Morbillivirus infection with high fever, stomatitis, diarrhea, and pneumonia.',
    isPriorityFAST: true
  },
  {
    id: 'diag-lsd',
    code: 'LSD',
    name: 'Lumpy Skin Disease (LSD)',
    shortName: 'LSD',
    primarySpecies: ['Bovine'],
    description: 'Capripoxvirus causing firm nodular eruptions across skin and mucous membranes.',
    isPriorityFAST: true
  },
  {
    id: 'diag-cbpp',
    code: 'CBPP',
    name: 'Contagious Bovine Pleuropneumonia (CBPP)',
    shortName: 'CBPP',
    primarySpecies: ['Bovine'],
    description: 'Mycoplasma mycoides subsp. mycoides causing severe fibrinous pleuropneumonia.',
    isPriorityFAST: true
  },
  {
    id: 'diag-ccpp',
    code: 'CCPP',
    name: 'Contagious Caprine Pleuropneumonia (CCPP)',
    shortName: 'CCPP',
    primarySpecies: ['Caprine'],
    description: 'Mycoplasma capricolum subsp. capripneumoniae in goats.',
    isPriorityFAST: true
  },
  {
    id: 'diag-anthrax',
    code: 'ANTHRAX',
    name: 'Anthrax (Bacillus anthracis)',
    shortName: 'Anthrax',
    primarySpecies: ['Bovine', 'Ovine', 'Caprine', 'Camel', 'Equine'],
    description: 'Peracute zoonotic bacterial disease causing sudden death and incomplete rigor mortis.',
    isPriorityFAST: true
  },
  {
    id: 'diag-rabies',
    code: 'RABIES',
    name: 'Rabies (Lyssavirus)',
    shortName: 'Rabies',
    primarySpecies: ['Canine', 'Bovine', 'Equine', 'Feline'],
    description: 'Fatal viral encephalomyelitis transmitted via saliva and bites.',
    isPriorityFAST: true
  },
  {
    id: 'diag-blackleg',
    code: 'BLACKLEG',
    name: 'Blackleg (Clostridium chauvoei)',
    shortName: 'Blackleg',
    primarySpecies: ['Bovine', 'Ovine'],
    description: 'Acute emphysematous necrotizing myositis in young, well-nourished stock.',
    isPriorityFAST: false
  },
  {
    id: 'diag-nd',
    code: 'ND',
    name: 'Newcastle Disease (ND)',
    shortName: 'Newcastle',
    primarySpecies: ['Avian'],
    description: 'Avian paramyxovirus-1 causing high flock mortality, respiratory, and nervous signs.',
    isPriorityFAST: true
  },
  {
    id: 'diag-ahs',
    code: 'AHS',
    name: 'African Horse Sickness (AHS)',
    shortName: 'AHS',
    primarySpecies: ['Equine'],
    description: 'Orbivirus disease transmitted by Culicoides midges causing severe pulmonary and cardiac edema.',
    isPriorityFAST: false
  },
  {
    id: 'diag-brucellosis',
    code: 'BRUCELLOSIS',
    name: 'Brucellosis (Brucella abortus / melitensis)',
    shortName: 'Brucellosis',
    primarySpecies: ['Bovine', 'Caprine', 'Ovine', 'Camel'],
    description: 'Zoonotic reproductive infection leading to late-term abortions and hygromas.',
    isPriorityFAST: false
  },
  {
    id: 'diag-pox',
    code: 'POX',
    name: 'Sheep Pox & Goat Pox',
    shortName: 'Pox',
    primarySpecies: ['Ovine', 'Caprine'],
    description: 'Capripoxvirus causing generalized papules and nodules in small ruminants.',
    isPriorityFAST: false
  },
  {
    id: 'diag-tryp',
    code: 'TRYPANOSOMIASIS',
    name: 'Trypanosomiasis (Gandi)',
    shortName: 'Tryp',
    primarySpecies: ['Bovine', 'Camel', 'Equine'],
    description: 'Protozoan blood parasite transmitted by tsetse and biting flies causing progressive anemia.',
    isPriorityFAST: false
  },
  {
    id: 'diag-undiff',
    code: 'UNDIFFERENTIATED',
    name: 'Undifferentiated Syndrome / Unknown Etiology',
    shortName: 'Unknown',
    primarySpecies: ['Bovine', 'Ovine', 'Caprine', 'Camel', 'Avian', 'Equine'],
    description: 'Emerging or unclassified disease event requiring rapid diagnostic sampling and lab investigation.',
    isPriorityFAST: false
  }
];

export const INITIAL_DEMO_ADNIS_REPORTS: AdnisReport[] = [
  {
    id: 'adnis-rep-2026-001',
    laboratoryId: 'hrvl',
    client_report_id: 'guid-fmd-haramaya-20260814',
    device_id: 'dev-field-android-01',
    report_type: 'FIELD_REPORT',
    report_status: 'SYNCED',
    reporter_id: 'user-tadesse-01',
    reporter_name: 'Dr. Tadesse Bekele',
    reporter_phone: '+251911458892',
    reporter_email: 'tadesse.bekele@oromiavet.gov.et',
    reporter_role: 'district_focal_person',
    organization: 'Haramaya District Veterinary Clinic',
    region: 'Oromia',
    zone: 'East Hararghe',
    district: 'Haramaya',
    reporting_unit: 'Bate Kebele Animal Health Post',
    village: 'Ganda Gafarsa',
    reporting_period_start: '2026-08-01',
    reporting_period_end: '2026-08-31',
    report_date: '2026-08-15',
    species: ['Bovine'],
    gps_status: 'GPS_ACQUIRED',
    latitude: 9.3985,
    longitude: 42.0125,
    altitude: 2010,
    gps_accuracy: 4.2,
    gps_source: 'device_gps',
    gps_captured_offline: true,
    at_risk: 350,
    cases: 42,
    deaths: 2,
    morbidity_rate: 12.0,
    mortality_rate: 0.57,
    case_fatality_rate: 4.76,
    symptoms: [
      'Vesicles / Blisters on Tongue, Dental Pad & Gums',
      'Profuse / Ropy Salivation & Drooling (Frothing)',
      'Coronary Band / Interdigital Cleft Ulcers & Sloughing',
      'Severe Lameness / Reluctance to Rise or Walk'
    ],
    symptom_notes: 'Oral and interdigital ruptured vesicles with profound salivation following introduction of market stock.',
    tentative_diagnosis: 'Foot-and-Mouth Disease (FMD)',
    diagnosis_code: 'FMD',
    diagnosis_certainty: 'Laboratory Confirmed',
    possible_source: 'Livestock purchased from Harar livestock transit route without isolation.',
    control_measures_applied: ['Ring Quarantine', 'Epithelium Sampling for HRVL PCR', 'Milk boiling advisories'],
    comments: 'Active outbreak investigation conducted jointly with Hirna Regional Lab rapid response team.',
    created_at: Date.now() - 86400000 * 12,
    updated_at: Date.now() - 86400000 * 12,
    finalized_at: Date.now() - 86400000 * 12,
    submitted_at: Date.now() - 86400000 * 12,
    synced_at: Date.now() - 86400000 * 12,
    surveillance_record_id: 'SR-2026-901'
  },
  {
    id: 'adnis-rep-2026-002',
    laboratoryId: 'hrvl',
    client_report_id: 'guid-zero-chiro-20260815',
    device_id: 'dev-field-android-02',
    report_type: 'ZERO_REPORT',
    report_status: 'SYNCED',
    reporter_id: 'user-chiro-01',
    reporter_name: 'Dr. Mohammed Ahmed (WVO)',
    reporter_phone: '+251915443322',
    reporter_email: 'mohammed.ahmed@whararghe.gov.et',
    reporter_role: 'district_focal_person',
    organization: 'Chiro District Animal Health Bureau',
    region: 'Oromia',
    zone: 'West Hararghe',
    district: 'Chiro',
    reporting_unit: 'Chiro Central Veterinary Clinic',
    reporting_period_start: '2026-08-01',
    reporting_period_end: '2026-08-31',
    report_date: '2026-08-16',
    species: ['Bovine', 'Ovine', 'Caprine', 'Equine', 'Avian'],
    gps_status: 'GPS_UNAVAILABLE',
    latitude: null,
    longitude: null,
    altitude: null,
    gps_accuracy: null,
    gps_source: 'none',
    gps_captured_offline: false,
    at_risk: 0,
    cases: 0,
    deaths: 0,
    morbidity_rate: 0,
    mortality_rate: 0,
    case_fatality_rate: 0,
    symptoms: [],
    tentative_diagnosis: 'None (Zero Reporting)',
    diagnosis_code: 'ZERO_REPORT',
    comments: 'Routine monthly surveillance completed across 12 kebeles. No reportable disease events or unusual mortalities detected.',
    created_at: Date.now() - 86400000 * 10,
    updated_at: Date.now() - 86400000 * 10,
    finalized_at: Date.now() - 86400000 * 10,
    submitted_at: Date.now() - 86400000 * 10,
    synced_at: Date.now() - 86400000 * 10
  },
  {
    id: 'adnis-rep-2026-003',
    laboratoryId: 'hrvl',
    client_report_id: 'guid-ppr-badeno-20260818',
    device_id: 'dev-field-android-03',
    report_type: 'FIELD_REPORT',
    report_status: 'SYNCED',
    reporter_id: 'user-fatuma-01',
    reporter_name: 'Dr. Fatuma Mohammed',
    reporter_phone: '+251922334455',
    reporter_email: 'fatuma.m@ehararghe.gov.et',
    reporter_role: 'field_veterinarian',
    organization: 'Badeno Woreda Veterinary Extension',
    region: 'Oromia',
    zone: 'East Hararghe',
    district: 'Badeno',
    reporting_unit: 'Ramis River Valley Post',
    village: 'Oda Bulto',
    reporting_period_start: '2026-08-01',
    reporting_period_end: '2026-08-31',
    report_date: '2026-08-18',
    species: ['Caprine', 'Ovine'],
    gps_status: 'GPS_ACQUIRED',
    latitude: 8.9045,
    longitude: 41.6312,
    altitude: 1650,
    gps_accuracy: 3.5,
    gps_source: 'device_gps',
    gps_captured_offline: true,
    at_risk: 180,
    cases: 28,
    deaths: 6,
    morbidity_rate: 15.55,
    mortality_rate: 3.33,
    case_fatality_rate: 21.43,
    symptoms: [
      'Necrotic Stomatitis / Cheesy Oral Plaques & Foul Odor',
      'Mucopurulent Nasal & Ocular Discharge / Crusts',
      'Profuse Watery or Fetid Bloody Diarrhea (Dysentery)',
      'High Pyrexia / Rectal Temperature > 40.5°C (> 105°F)'
    ],
    symptom_notes: 'Acute PPR outbreak in goat herd with high mortality in kids under 1 year.',
    tentative_diagnosis: 'Peste des Petits Ruminants (PPR)',
    diagnosis_code: 'PPR',
    diagnosis_certainty: 'Probable',
    possible_source: 'Introduction of breeding bucks from lowland market.',
    control_measures_applied: ['Herd Isolation', 'Targeted Antibiotic Supportive Therapy', 'Ring Vaccination Requested'],
    comments: 'Serum and ocular swabs dispatched in cold-chain transport to HRVL for RT-PCR confirmation.',
    created_at: Date.now() - 86400000 * 7,
    updated_at: Date.now() - 86400000 * 7,
    finalized_at: Date.now() - 86400000 * 7,
    submitted_at: Date.now() - 86400000 * 7,
    synced_at: Date.now() - 86400000 * 7,
    surveillance_record_id: 'SR-2026-902'
  },
  {
    id: 'adnis-rep-2026-004',
    laboratoryId: 'hrvl',
    client_report_id: 'guid-zero-habro-20260820',
    device_id: 'dev-field-android-04',
    report_type: 'ZERO_REPORT',
    report_status: 'SYNCED',
    reporter_id: 'user-habro-01',
    reporter_name: 'Dr. Gemechu Desta',
    reporter_phone: '+251933445566',
    reporter_email: 'gemechu.desta@whararghe.gov.et',
    reporter_role: 'district_focal_person',
    organization: 'Habro Woreda Vet Clinic (Gelemso)',
    region: 'Oromia',
    zone: 'West Hararghe',
    district: 'Habro',
    reporting_unit: 'Gelemso Veterinary Clinic',
    reporting_period_start: '2026-08-01',
    reporting_period_end: '2026-08-31',
    report_date: '2026-08-20',
    species: ['Bovine', 'Ovine', 'Caprine', 'Avian'],
    gps_status: 'GPS_ACQUIRED',
    latitude: 8.8212,
    longitude: 40.5312,
    altitude: 1740,
    gps_accuracy: 4.0,
    gps_source: 'device_gps',
    gps_captured_offline: true,
    at_risk: 0,
    cases: 0,
    deaths: 0,
    morbidity_rate: 0,
    mortality_rate: 0,
    case_fatality_rate: 0,
    symptoms: [],
    tentative_diagnosis: 'None (Zero Reporting)',
    diagnosis_code: 'ZERO_REPORT',
    comments: 'Active surveillance across Gelemso surrounding kebeles. Zero reportable diseases.',
    created_at: Date.now() - 86400000 * 5,
    updated_at: Date.now() - 86400000 * 5,
    finalized_at: Date.now() - 86400000 * 5,
    submitted_at: Date.now() - 86400000 * 5,
    synced_at: Date.now() - 86400000 * 5
  },
  {
    id: 'adnis-rep-2026-arvl-001',
    laboratoryId: 'arvl',
    client_report_id: 'guid-cbpp-tiyo-20260812',
    device_id: 'dev-field-asela-01',
    report_type: 'FIELD_REPORT',
    report_status: 'SYNCED',
    reporter_id: 'user-arvl-focal-01',
    reporter_name: 'Dr. Chala Hundesa',
    reporter_phone: '+251912667788',
    reporter_email: 'chala.hundesa@oromiavet.gov.et',
    reporter_role: 'district_focal_person',
    organization: 'Tiyo Woreda Animal Health Bureau',
    region: 'Oromia',
    zone: 'Arsi',
    district: 'Tiyo',
    reporting_unit: 'Asela Peri-Urban Dairy Cluster Post',
    village: 'Dosha',
    reporting_period_start: '2026-08-01',
    reporting_period_end: '2026-08-31',
    report_date: '2026-08-12',
    species: ['Bovine'],
    gps_status: 'GPS_ACQUIRED',
    latitude: 7.95,
    longitude: 39.12,
    altitude: 2430,
    gps_accuracy: 3.8,
    gps_source: 'device_gps',
    gps_captured_offline: true,
    at_risk: 210,
    cases: 19,
    deaths: 3,
    morbidity_rate: 9.05,
    mortality_rate: 1.43,
    case_fatality_rate: 15.79,
    symptoms: [
      'Severe Dyspnea / Polypnea & Grunting Respiration',
      'Extended Head & Neck with Elbows Abducted',
      'Mucopurulent Nasal Discharge & Persistent Painful Cough',
      'High Pyrexia / Rectal Temperature > 40.5°C (> 105°F)'
    ],
    symptom_notes: 'Typical thoracic marble lung presentation with painful grunting on percussion.',
    tentative_diagnosis: 'Contagious Bovine Pleuropneumonia (CBPP)',
    diagnosis_code: 'CBPP',
    diagnosis_certainty: 'Probable',
    possible_source: 'Cross-boundary pastoral herd movement through Robe corridor.',
    control_measures_applied: ['Herd Isolation', 'Movement Restriction', 'Emergency Ring Vaccination Request'],
    comments: 'Pleural fluid and serum specimens transported in cold chain to ARVL Pathology Laboratory.',
    created_at: Date.now() - 86400000 * 9,
    updated_at: Date.now() - 86400000 * 9,
    finalized_at: Date.now() - 86400000 * 9,
    submitted_at: Date.now() - 86400000 * 9,
    synced_at: Date.now() - 86400000 * 9,
    surveillance_record_id: 'SR-2026-ARVL-101'
  },
  {
    id: 'adnis-rep-2026-arvl-002',
    laboratoryId: 'arvl',
    client_report_id: 'guid-zero-adama-20260816',
    device_id: 'dev-field-asela-02',
    report_type: 'ZERO_REPORT',
    report_status: 'SYNCED',
    reporter_id: 'user-arvl-focal-02',
    reporter_name: 'Dr. Merga Tolera',
    reporter_phone: '+251911889900',
    reporter_email: 'merga.tolera@oromiavet.gov.et',
    reporter_role: 'district_focal_person',
    organization: 'Adama Zuria Veterinary Bureau',
    region: 'Oromia',
    zone: 'East Shewa',
    district: 'Adama Zuria',
    reporting_unit: 'Adama Central Animal Health Post',
    reporting_period_start: '2026-08-01',
    reporting_period_end: '2026-08-31',
    report_date: '2026-08-16',
    species: ['Bovine', 'Ovine', 'Caprine', 'Equine', 'Avian'],
    gps_status: 'GPS_ACQUIRED',
    latitude: 8.55,
    longitude: 39.27,
    altitude: 1710,
    gps_accuracy: 4.5,
    gps_source: 'device_gps',
    gps_captured_offline: true,
    at_risk: 0,
    cases: 0,
    deaths: 0,
    morbidity_rate: 0,
    mortality_rate: 0,
    case_fatality_rate: 0,
    symptoms: [],
    tentative_diagnosis: 'None (Zero Reporting)',
    diagnosis_code: 'ZERO_REPORT',
    comments: 'Routine surveillance conducted across 18 kebeles in Adama Zuria. Zero reportable disease outbreaks.',
    created_at: Date.now() - 86400000 * 6,
    updated_at: Date.now() - 86400000 * 6,
    finalized_at: Date.now() - 86400000 * 6,
    submitted_at: Date.now() - 86400000 * 6,
    synced_at: Date.now() - 86400000 * 6
  }
];
