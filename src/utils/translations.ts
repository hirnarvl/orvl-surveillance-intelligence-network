import { Locale } from '../types';

export interface Translations {
  // Header / Branding
  title: string;
  badge: string;
  subtitle: string;
  importedDataRange: string;
  offlineCacheActive: string;
  cachedLocally: string;

  // Tabs
  dashboard: string;
  map: string;
  tables: string;
  vaccineCalendar: string;
  fastToolbox: string;
  fastDiseases: string;
  resourceLibrary: string;
  fieldInvestigation: string;
  fieldToolkit: string;
  labDiagnostics: string;
  oneHealth: string;
  trainingHub: string;

  // Quick Filters
  allZones: string;
  eastHararghe: string;
  westHararghe: string;

  // Action Buttons
  logArrival: string;
  profileSimulator: string;
  simulatorActive: string;
  multiExcelImport: string;
  yoyAnalysis: string;
  csvExport: string;
  aiSitrepReport: string;
  googleDrive: string;
  openAccessPortal: string;
  supportTemplate: string;
  resetCache: string;
  portraitView: string;
  portraitActive: string;
  fieldPrintSnapshot: string;
  exitPrintView: string;
  signIn: string;
  signOut: string;
  installApp: string;
  appInstalled: string;
  installHRVLDashboard: string;
  installPwaDescription: string;
  installOnIos: string;
  iosShareStep: string;
  iosAddHomeStep: string;
  notNow: string;
  installNow: string;

  // Theme
  dayMode: string;
  nightMode: string;

  // Language selector
  language: string;
  selectLanguage: string;
  
  // AI Report Modal
  generatingReport: string;
  synthesizingData: string;
  outbreakEvaluation: string;
  recommendations: string;
  close: string;
  printOfficial: string;
  
  // Tables
  tblSearch: string;
  tblExportCSV: string;
  tblShowingRecords: string;
  tblRows: string;
  tblPage: string;
  tblOf: string;
  tblAnomalyDetection: string;
  tblHistoricalBenchmark: string;
  
  // Columns
  colDiseaseName: string;
  colOutbreaks: string;
  colTotalCases: string;
  colDeaths: string;
  colMorbidity: string;
  colCFR: string;
  colPrimarySpecies: string;
  colRiskLevel: string;

  colWoreda: string;
  colZone: string;
  colStatus: string;
  colStartDate: string;
  colDuration: string;

  colDate: string;
  colSpecies: string;
  colCases: string;
  colReporter: string;

  colComplianceRate: string;
  colTimeliness: string;
  colZeroReports: string;
  colExpected: string;
  colSubmitted: string;
  
  // Table Titles
  titleDiseaseSummary: string;
  titleActiveOutbreaks: string;
  titleSurveillanceLog: string;
  titleCompliance: string;

  // Species Donut
  speciesDistributionTitle: string;
  speciesTotal: string;
  speciesCasesLabel: string;
  speciesTotalCases: string;

  // CFR
  cfrCaseFatality: string;
  cfrWAHOBenchmark: string;
  cfrYoYComparative: string;
  cfrAllDiseases: string;
  cfrSelectFocus: string;
  cfrTargetKeep: string;
  cfrTargetThreshold: string;

  // MEL Scorecard
  melPerformance: string;
  wahoRegionalScorecard: string;
  melAllZones: string;
  melComplianceRate: string;
  melZeroReports: string;
  melTimeliness: string;
  melScore: string;
  melNeedsImprovement: string;
  melModerate: string;
  melExcellent: string;
  melGenerateSitrep: string;
  melCompileData: string;

  // Trends
  chartEpidemiologicalCurves: string;
  chartHistoricalOverlay: string;
  chartYoYComparison: string;
  chartTimeline: string;
  chartDaily: string;
  chartWeekly: string;
  chartMonthly: string;
  chartLegendCases: string;
  chartLegendCases2025: string;
  chartLegendCases2024: string;
  chartLegendDeaths: string;
  chartLegendZero: string;

  kpiSurveillance: string;
  kpiZeroDisease: string;
  kpiLabConfirmed: string;
  kpiVerified: string;
  kpiHrvlDiagnostic: string;
  kpiLabVerifiedCases: string;
  kpiActiveOutbreaks: string;
  kpiQuarantined: string;
  kpiEmergencyAlert: string;
  kpiFmdPprLsd: string;
  kpiOverallCfr: string;
  kpiAboveLimit: string;
  kpiWithinThreshold: string;
  kpiDeaths: string;
  kpiTotalAnimalCases: string;
  kpiMelReporting: string;
  kpiTarget80: string;
  kpiWoredas36: string;
  kpiWeeklySubmission: string;
  kpiAffectedWoredas: string;
  kpiSpread: string;
  kpiSpatialIndex: string;
  kpiEastWestHararghe: string;
  kpiNetworkCoverage: string;
  kpiMelCompliance: string;
  kpiWahoBenchmark: string;
  kpiEastZone: string;
  kpiReportingCompleteness: string;
  kpiHighDensityEast: string;
  kpiWestZone: string;
  kpiHighDensityWest: string;

  // Tour UI controls
  tourPurposeLabel: string;
  tourCapabilitiesLabel: string;
  tourTranscriptLabel: string;
  tourNarratingStatus: string;
  tourSpeakingStatus: string;
  tourDontShowAgainLabel: string;
  tourSkipButton: string;
  tourBackButton: string;
  tourNextButton: string;
  tourFinishButton: string;
  tourVoiceOn: string;
  tourVoiceOff: string;
  tourAdminNotice: string;

  // Footer & Disclaimer Transcripts
  footerAboutTitle: string;
  footerExpandedView: string;
  footerClose: string;
  footerPlatformDescription: string;
  footerCombinedSectionTitle: string;
  footerLegalDisclaimer: string;
  footerNetworkSyncLabel: string;
  footerNetworkSyncText: string;
  footerPrivacyComplianceLabel: string;
  footerPrivacyComplianceText: string;
  footerDeveloperContactTitle: string;
  footerDeveloperQrLabel: string;
  footerTelegramAsellaLabel: string;
  footerTelegramAdnisLabel: string;
}

export const translations: Record<Locale, Translations> = {
  en: {
    title: 'ORVL Surveillance Intelligence Network',
    badge: 'ORVL Intelligence Network',
    subtitle: 'Oromia Regional Veterinary Laboratory Surveillance Intelligence Network',
    importedDataRange: 'Imported Data Range:',
    offlineCacheActive: 'Offline Cache Active',
    cachedLocally: 'Cached Locally',

    dashboard: 'Dashboard',
    map: 'Map',
    tables: 'Tables',
    vaccineCalendar: 'Vaccine Calendar',
    fastToolbox: 'FAST & One Health',
    fastDiseases: 'FAST Diseases',
    resourceLibrary: 'Resource Library',
    fieldInvestigation: 'Field Investigation',
    fieldToolkit: 'ORVL Module & Field Tools',
    labDiagnostics: 'Lab Diagnostics',
    oneHealth: 'One Health',
    trainingHub: 'Training Hub',

    allZones: 'All Zones (36 Woredas)',
    eastHararghe: 'E/H (21)',
    westHararghe: 'W/H (15)',

    logArrival: 'Log Arrival',
    profileSimulator: 'Simulator',
    simulatorActive: 'Simulator Active',
    multiExcelImport: 'Excel Import',
    yoyAnalysis: 'YoY Trends',
    csvExport: 'CSV',
    aiSitrepReport: 'AI Report',
    googleDrive: 'Drive',
    openAccessPortal: 'Resources',
    supportTemplate: 'Support',
    resetCache: 'Reset',
    portraitView: '📱 Portrait',
    portraitActive: '📱 Portrait Active',
    fieldPrintSnapshot: '🖨️ Field Print',
    exitPrintView: '🖨️ Exit Print',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    installApp: 'Install App',
    appInstalled: 'App Installed',
    installHRVLDashboard: 'Install ORVL Intelligence Network',
    installPwaDescription: 'Install the ORVL Surveillance Intelligence Network App for instant offline-first field surveillance, GIS mapping, and rapid outbreak analytics.',
    installOnIos: 'Install on iPhone / iPad',
    iosShareStep: 'Tap the Share button in Safari toolbar',
    iosAddHomeStep: 'Scroll down and tap "Add to Home Screen"',
    notNow: 'Not Now',
    installNow: 'Install Now',
    dayMode: 'Day',
    nightMode: 'Night',

    language: 'Language',
    selectLanguage: 'Select Language',
    generatingReport: 'Generating Epidemiological Narrative...',
    synthesizingData: 'Synthesizing E/H & W/H disease dynamics with Gemini AI',
    outbreakEvaluation: 'Outbreak Evaluation & Transboundary Risks:',
    recommendations: 'Actionable Epidemiological Recommendations:',
    close: 'Close',
    printOfficial: 'Print Official Field Report',
    tblSearch: 'Search...',
    tblExportCSV: 'CSV',
    tblShowingRecords: 'Showing',
    tblRows: 'Rows:',
    tblPage: 'Page',
    tblOf: 'of',
    tblAnomalyDetection: 'Anomaly Detection',
    tblHistoricalBenchmark: '36-Woreda Baseline',
    
    colDiseaseName: 'Disease Name',
    colOutbreaks: 'Outbreaks',
    colTotalCases: 'Total Cases',
    colDeaths: 'Deaths',
    colMorbidity: 'Morbidity %',
    colCFR: 'CFR %',
    colPrimarySpecies: 'Primary Species',
    colRiskLevel: 'Risk Level',

    colWoreda: 'Woreda',
    colZone: 'Zone',
    colStatus: 'Status',
    colStartDate: 'Start Date',
    colDuration: 'Duration',

    colDate: 'Date',
    colSpecies: 'Species',
    colCases: 'Cases',
    colReporter: 'Reporter',

    colComplianceRate: 'Compliance Rate',
    colTimeliness: 'Timeliness',
    colZeroReports: 'Zero Reports',
    colExpected: 'Expected',
    colSubmitted: 'Submitted',

    titleDiseaseSummary: 'Disease Summary',
    titleActiveOutbreaks: 'Active Outbreaks',
    titleSurveillanceLog: 'Surveillance Log',
    titleCompliance: 'Compliance',

    speciesDistributionTitle: 'Livestock Species Distribution (7 Species)',
    speciesTotal: 'Total:',
    speciesCasesLabel: 'cases',
    speciesTotalCases: 'Total Cases',

    cfrCaseFatality: 'Case Fatality Rate (CFR) Trajectory',
    cfrWAHOBenchmark: 'WAHO Benchmarked Timeline',
    cfrYoYComparative: 'YoY Comparative',
    cfrAllDiseases: 'All Diseases (2026)',
    cfrSelectFocus: 'Select Focus Disease:',
    cfrTargetKeep: 'Target: Keep non-Anthrax CFR < 10%',
    cfrTargetThreshold: 'Target Threshold (10%)',

    melPerformance: 'MEL Performance & Data Quality',
    wahoRegionalScorecard: 'WAHO Regional Compliance Scorecard',
    melAllZones: 'All Zones',
    melComplianceRate: 'Compliance Rate',
    melZeroReports: 'Zero Reports',
    melTimeliness: 'Timeliness',
    melScore: 'Score',
    melNeedsImprovement: 'Needs Improvement',
    melModerate: 'Moderate',
    melExcellent: 'Excellent',
    melGenerateSitrep: 'Generate Official SitRep',
    melCompileData: 'Compile data into WAHO standard report',

    chartEpidemiologicalCurves: 'Epidemiological Curves (WAHO)',
    chartHistoricalOverlay: 'Historical Overlay:',
    chartYoYComparison: 'YoY Comparison',
    chartTimeline: 'Timeline:',
    chartDaily: 'Daily',
    chartWeekly: 'Weekly',
    chartMonthly: 'Monthly',
    chartLegendCases: 'Cases (Current)',
    chartLegendCases2025: 'Cases 2025',
    chartLegendCases2024: 'Cases 2024',
    chartLegendDeaths: 'Deaths',
    chartLegendZero: 'Zero Reports',

    kpiSurveillance: 'Surveillance Field Submissions',
    kpiZeroDisease: 'zero-disease validations',
    kpiLabConfirmed: 'Lab Confirmed vs Suspected',
    kpiVerified: 'Verified',
    kpiHrvlDiagnostic: 'Laboratory Diagnostic',
    kpiLabVerifiedCases: 'Laboratory verified cases',
    kpiActiveOutbreaks: 'Active Outbreaks (Critical)',
    kpiQuarantined: 'Quarantined',
    kpiEmergencyAlert: 'EMERGENCY ALERT',
    kpiFmdPprLsd: 'FMD, PPR, LSD, Newcastle, CBPP',
    kpiOverallCfr: 'Overall Case Fatality Rate',
    kpiAboveLimit: 'Above WOAH Limit',
    kpiWithinThreshold: 'Within Threshold',
    kpiDeaths: 'Deaths',
    kpiTotalAnimalCases: 'Total animal cases:',
    kpiMelReporting: 'MEL Reporting Compliance',
    kpiTarget80: 'Target >= 80%',
    kpiWoredas36: '36 Woredas',
    kpiWeeklySubmission: 'Weekly submission completeness',
    kpiAffectedWoredas: 'Affected Woredas Ratio',
    kpiSpread: 'Spread',
    kpiSpatialIndex: 'Spatial Index',
    kpiEastWestHararghe: 'East (21) & West (15) Hararghe',
    kpiNetworkCoverage: 'Surveillance Network Coverage',
    kpiMelCompliance: 'MEL Compliance',
    kpiWahoBenchmark: 'WAHO Benchmark: ≥80% weekly reporting completeness',
    kpiEastZone: 'East Hararghe Zone',
    kpiReportingCompleteness: 'Reporting Completeness',
    kpiHighDensityEast: 'High Density: Haramaya, Babile, Dadar, Girawa',
    kpiWestZone: 'West Hararghe Zone',
    kpiHighDensityWest: 'High Density: Chiro, Daro Lebu, Habro, Mieso',

    tourPurposeLabel: 'Purpose',
    tourCapabilitiesLabel: 'Key Capabilities',
    tourTranscriptLabel: 'Voice Narration Transcript (EN)',
    tourNarratingStatus: 'Narrating...',
    tourSpeakingStatus: 'Speaking',
    tourDontShowAgainLabel: 'Don\'t show this tour automatically again',
    tourSkipButton: 'Skip Tour',
    tourBackButton: 'Back',
    tourNextButton: 'Next',
    tourFinishButton: 'Finish Tour',
    tourVoiceOn: 'Voice On',
    tourVoiceOff: 'Voice Off',
    tourAdminNotice: 'Note: System administrative settings and user permissions are accessible exclusively to authorized accounts.',

    // Footer & Disclaimer Transcripts
    footerAboutTitle: 'About this platform',
    footerExpandedView: 'Expanded view',
    footerClose: 'Close',
    footerPlatformDescription: 'This portal provides an integrated digital environment for animal disease surveillance, veterinary laboratory diagnostics, field epidemiology, reporting, analytics and evidence-based animal health decision support across regional veterinary laboratories in Oromia.',
    footerCombinedSectionTitle: 'Data Confidentiality, Legal Disclaimer & Developer Contact',
    footerLegalDisclaimer: 'All epidemiological, laboratory, and outbreak data presented here is collected, processed, and stored under the data governance and confidentiality protocols of the Oromia Regional Veterinary Laboratory Surveillance Intelligence Network, consistent with national veterinary public health regulations and WOAH/WAHO reporting standards. Access to disaggregated, case-level surveillance records is restricted to authorized personnel only, and no content on this platform may be reproduced or redistributed without prior institutional authorization.',
    footerNetworkSyncLabel: 'Network Synchronization:',
    footerNetworkSyncText: 'Participating regional veterinary laboratories automatically synchronize with each other to maintain unified surveillance intelligence across all operational catchment areas.',
    footerPrivacyComplianceLabel: 'Privacy & Compliance:',
    footerPrivacyComplianceText: 'Zero exposure of personal contact details. Robust role-based access control and secure offline-first surveillance intelligence.',
    footerDeveloperContactTitle: 'Developer contact',
    footerDeveloperQrLabel: 'Developer Profile QR Code',
    footerTelegramAsellaLabel: 'Telegram channel: Asella RVL',
    footerTelegramAdnisLabel: 'Telegram channel: ADNIS'
  },
  om: {
    title: 'ORVL Surveillance Intelligence Network',
    badge: 'Netwoorkii ORVL',
    subtitle: 'Netwoorkii Qorannoo fi Odeeffannoo Dhibee Beeyladaa Naannoo Oromiyaa',
    importedDataRange: 'Daangaa Yeroo Daataa:',
    offlineCacheActive: 'Kuusaa Toora-Malee (Active)',
    cachedLocally: 'Mootora Lokaaliitti Kuusameera',

    dashboard: 'Daashboordii',
    map: 'Kaartaa GIS',
    tables: 'Gabateewwan',
    vaccineCalendar: 'Kaalaandarii Talaallii',
    fastToolbox: 'Meeshaalee FAST & Fayyaa Tokko',
    fastDiseases: 'Dhibeewwan FAST',
    resourceLibrary: 'Kuusaa Qabeenyaa fi Qajeelfamaa',
    fieldInvestigation: 'Qorannoo Dhibee Dirree',
    fieldToolkit: 'Meeshaalee Dirree',
    labDiagnostics: 'Qorannoo Laaboraatoorii',
    oneHealth: 'Fayyaa Tokko (One Health)',
    trainingHub: 'Giddugala Leenjii fi Barumsaa',

    allZones: 'Aanoolee Hunda (Aanaa 36)',
    eastHararghe: 'Harargee Bahaa (21)',
    westHararghe: 'Harargee Dhihaa (15)',

    logArrival: 'Gabaasa Dirree Galchi',
    profileSimulator: 'Fakkoomsaa Hojii (Simulator)',
    simulatorActive: 'Fakkoomsaan Hojiirra Jira',
    multiExcelImport: 'Daataa Excel Fidi',
    yoyAnalysis: 'Xiinxala Waggaa (YoY)',
    csvExport: 'CSV Baasi',
    aiSitrepReport: 'Gabaasa AI SitRep',
    googleDrive: 'Google Drive',
    openAccessPortal: 'Waltajjii Qabeenyaa',
    supportTemplate: 'Deeggarsa fi Unkaalee',
    resetCache: 'Kuusaa Qulqulleessi',
    portraitView: '📱 Mul\'ata Dhabaa',
    portraitActive: '📱 Mul\'ata Dhabaa Hojiirra',
    fieldPrintSnapshot: '🖨️ Maxxansa Dirree',
    exitPrintView: '🖨️ Maxxansa Dhiisi',
    signIn: 'Seeni',
    signOut: 'Ba\'i',
    installApp: 'App Fe\'adhu',
    appInstalled: 'Appichi Fe\'ameera',
    installHRVLDashboard: 'Netwoorkii ORVL Fe\'adhaa',
    installPwaDescription: 'Hordoffii dirree toora interneetii malee, kaartaa GIS fi xiinxala weerara dhibee saffisaa argachuuf ORVL Surveillance Intelligence Network fe\'adhaa.',
    installOnIos: 'iPhone / iPad irratti Fe\'i',
    iosShareStep: 'Safari keessatti mallattoo Share tuqi',
    iosAddHomeStep: 'Gadi bu\'ii "Add to Home Screen" filadhu',
    notNow: 'Amma Miti',
    installNow: 'Amma Fe\'i',
    dayMode: 'Guyyaa',
    nightMode: 'Halkan',

    language: 'Afaan',
    selectLanguage: 'Afaan Filadhaa',
    generatingReport: 'Gabaasa haala dhibee AI dhaan qindeessuutti...',
    synthesizingData: 'Haala dhibee Harargee Bahaa fi Dhihaa Gemini AI dhaan xiinxalaatti jira',
    outbreakEvaluation: 'Madaallii Weerara Dhibee fi Balaa Daangaa Ce\'uu:',
    recommendations: 'Tarkaanfiiwwan Yaala Fayyaa Beeyladaa Fudhatamuu Qaban:',
    close: 'Cufi',
    printOfficial: 'Gabaasa Dirree Seera Qabeessa Maxxansi',
    tblSearch: 'Barbaadi...',
    tblExportCSV: 'CSV Baasi',
    tblShowingRecords: 'Kan mul\'atu',
    tblRows: 'Sarara:',
    tblPage: 'Fuula',
    tblOf: 'keessaa',
    tblAnomalyDetection: 'Qorannoo Addaa',
    tblHistoricalBenchmark: 'Giddu-galeessa Aanoolee 36',
    
    colDiseaseName: 'Maqaa Dhibee',
    colOutbreaks: 'Weerara Dhibee',
    colTotalCases: 'Waliigala Dhimmoota',
    colDeaths: 'Du\'a Beeyladaa',
    colMorbidity: 'Reeshoo Dhukkubsachuu %',
    colCFR: 'Reeshoo Du\'aa (CFR %)',
    colPrimarySpecies: 'Sanyii Beeyladaa Ijoo',
    colRiskLevel: 'Sadarkaa Balaa',

    colWoreda: 'Aanaa',
    colZone: 'Godina',
    colStatus: 'Haala Dhibee',
    colStartDate: 'Guyyaa Eegale',
    colDuration: 'Turtii (Guyyoota)',

    colDate: 'Guyyaa',
    colSpecies: 'Sanyii Beeyladaa',
    colCases: 'Dhukkubsatan',
    colReporter: 'Ogeessa Gabaase',

    colComplianceRate: 'Reetii Raawwii',
    colTimeliness: 'Yeroon Gabaasuu',
    colZeroReports: 'Gabaasa Dhibee-Malee (Zero-reporting)',
    colExpected: 'Kan Eegame',
    colSubmitted: 'Kan Dhiyaate',

    titleDiseaseSummary: 'Cuunfaa Dhibeewwan Beeyladaa',
    titleActiveOutbreaks: 'Weerara Dhibee Yeroo Ammaa Jiran',
    titleSurveillanceLog: 'Galmee Hordoffii Dirree',
    titleCompliance: 'Raawwii fi Qulqullina Gabaasaa',

    speciesDistributionTitle: 'Qoodiinsa Sanyii Beeyladaa (Sanyiiwwan 7)',
    speciesTotal: 'Waliigala:',
    speciesCasesLabel: 'dhimmoota',
    speciesTotalCases: 'Waliigala Dhimmoota Beeyladaa',

    cfrCaseFatality: 'Adeemsa Reeshoo Du\'a Dhimmaa (CFR)',
    cfrWAHOBenchmark: 'Safaroo Sadarkaa WAHO',
    cfrYoYComparative: 'Xiinxala Walbira Qabaa Waggaa (YoY)',
    cfrAllDiseases: 'Dhibeewwan Hunda (2026)',
    cfrSelectFocus: 'Dhibee Xiyyeeffannoo Filadhaa:',
    cfrTargetKeep: 'Galma: CFR dhibee Abbaa Saangaa ala jiran < 10% eeguu',
    cfrTargetThreshold: 'Daangaa Galmaa (10%)',

    melPerformance: 'Raawwii MEL fi Qulqullina Daataa',
    wahoRegionalScorecard: 'Kaardii Qabxii Raawwii Naannoo WAHO',
    melAllZones: 'Godinaalee Hunda',
    melComplianceRate: 'Reetii Raawwii',
    melZeroReports: 'Gabaasa Dhibee-Malee',
    melTimeliness: 'Yeroon Gabaasuu',
    melScore: 'Qabxii',
    melNeedsImprovement: 'Fooyya\'uu Qaba',
    melModerate: 'Giddu-galeessa',
    melExcellent: 'Baay\'ee Gaarii',
    melGenerateSitrep: 'Gabaasa SitRep Seeraa Qopheessi',
    melCompileData: 'Daataa ulaagaa WAHO tiin walitti qabi',

    chartEpidemiologicalCurves: 'Sarara Jijjiirama Tamsa\'ina Dhibee (WAHO)',
    chartHistoricalOverlay: 'Daataa Seenaa:',
    chartYoYComparison: 'Xiinxala Waggaa (YoY)',
    chartTimeline: 'Yeroo:',
    chartDaily: 'Guyyaa',
    chartWeekly: 'Torban',
    chartMonthly: 'Ji\'a',
    chartLegendCases: 'Dhimmoota Ammaa',
    chartLegendCases2025: 'Dhimmoota 2025',
    chartLegendCases2024: 'Dhimmoota 2024',
    chartLegendDeaths: 'Du\'a Beeyladaa',
    chartLegendZero: 'Gabaasa Dhibee-Malee',

    kpiSurveillance: 'Gabaasaalee Hordoffii Dhibee Dirree',
    kpiZeroDisease: 'mirkaneessa dhibee-malee',
    kpiLabConfirmed: 'Laaboraatooriin Kan Mirkanaa\'ee fi Shakkame',
    kpiVerified: 'Mirkanaa\'eera',
    kpiHrvlDiagnostic: 'Qorannoo Laaboraatoorii',
    kpiLabVerifiedCases: 'Dhimmoota laaboraatooriin mirkanaa\'an',
    kpiActiveOutbreaks: 'Weerara Dhibee Yeroo Ammaa (Hatattama)',
    kpiQuarantined: 'Adda Baafamee To\'atame',
    kpiEmergencyAlert: 'AKEAKKACHIISA HATATTAMAA',
    kpiFmdPprLsd: 'FMD, PPR, LSD, Newcastle, CBPP',
    kpiOverallCfr: 'Reeshoo Du\'a Dhimma Waliigalaa',
    kpiAboveLimit: 'Daangaa WOAH Ol',
    kpiWithinThreshold: 'Daangaa Eegame Keessatti',
    kpiDeaths: 'Du\'a',
    kpiTotalAnimalCases: 'Waliigala dhimmoota beeyladaa:',
    kpiMelReporting: 'Raawwii Gabaasa MEL',
    kpiTarget80: 'Galma >= 80%',
    kpiWoredas36: 'Aanoolee 36 Harargee',
    kpiWeeklySubmission: 'Guutummaa gabaasa torbanii',
    kpiAffectedWoredas: 'Reeshoo Aanoolee Dhibeen Hubamanii',
    kpiSpread: 'Baballina',
    kpiSpatialIndex: 'Indeksii Iddoo',
    kpiEastWestHararghe: 'Harargee Bahaa (21) & Dhihaa (15)',
    kpiNetworkCoverage: 'Uwwisa Neetwoorkii Hordoffii',
    kpiMelCompliance: 'Raawwii MEL',
    kpiWahoBenchmark: 'Ulaagaa WAHO: Guutummaa gabaasa torbanii ≥80%',
    kpiEastZone: 'Godina Harargee Bahaa',
    kpiReportingCompleteness: 'Guutummaa Gabaasaa',
    kpiHighDensityEast: 'Tuuta Guddaa: Haramaya, Baabbilee, Dadar, Giraawaa',
    kpiWestZone: 'Godina Harargee Dhihaa',
    kpiHighDensityWest: 'Tuuta Guddaa: Ciroo, Daroo Labuu, Habroo, Mi\'eessoo',

    tourPurposeLabel: 'Kaayyoo',
    tourCapabilitiesLabel: 'Dandeettiiwwan Ijoo fi Hojiilee',
    tourTranscriptLabel: 'Barreeffama Sagalee Qajeelchaa (OM)',
    tourNarratingStatus: 'Dubbisaa jira...',
    tourSpeakingStatus: 'Dubbachaa jira',
    tourDontShowAgainLabel: 'Qajeelfama kana lammata ofumaan hin agarsiisin',
    tourSkipButton: 'Imala Dhiisi',
    tourBackButton: 'Duubatti',
    tourNextButton: 'Itti Aani',
    tourFinishButton: 'Imala Xumuri',
    tourVoiceOn: 'Sagaleen Banaadha',
    tourVoiceOff: 'Sagaleen Cufaadha',
    tourAdminNotice: 'Hubachiisa: Qindaa\'inni bulchiinsa sirnichaa fi hayyamni fayyadamtootaa ogeeyyii hayyama qabaniif qofa kan dhiyaatedha.',

    // Footer & Disclaimer Transcripts
    footerAboutTitle: "Waa'ee Waltajjii Kanaa",
    footerExpandedView: "Bal'inaan Ilaali",
    footerClose: 'Cufi',
    footerPlatformDescription: "Waltajjiin kun qorannoo dhibee beeyladootaa, qorannoo laabraatoorii beeyladootaa, ekispartiizii falaasamaa, gabaasa, qaaccessa fi murtee fayyaa beeyladootaa ragaa irratti hundaa'eef naannoo dijitaalaa walitti qindaa'e dhiyeessa.",
    footerCombinedSectionTitle: 'Ittisa Ragaa, Qajeelfama Seeraa & Qunnamtii Hojjetaa',
    footerLegalDisclaimer: "Daataan dhibee beeyladootaa, qorannoo laaboraatoorii fi weerara dhibee asitti dhiyaatan hundi seera bulchiinsa daataa fi qajeelfama iccitii eeguu Sarara Hordoffii Qorannoo Laaboraatoorii Fayyaa Beeyladaa Oromiyaa jalatti walitti qabama, qindaa'a, akkasumas ni olkaayama; kunis qajeelfama eegumsa fayyaa beeyladootaa biyyaalessaa fi ulaagaalee gabaasa WOAH/WAHO waliin kan walsimuudha. Ragaalee dhibee sadarkaa dhuunfaatti jiran fayyadamuun kan heyyamame hojjettoota heeyyama qabaniif qofa yoo ta'u, qabiyyee waltajjii kanaa irraa heeyyama dhaabbatichaa malee waraabuun ykn dabarsanii kennuun dhorkaadha.",
    footerNetworkSyncLabel: 'Walsimsiisa Sararaa:',
    footerNetworkSyncText: "Laaboraatooriiwwan fayyaa beeyladaa naannoo hirmaatan hundi naannolee tajaajilaa isaanii keessatti odeeffannoo hordoffii qindaa'aa ta'e qabaachuuf ofumaan walitti hidhamanii walsimu.",
    footerPrivacyComplianceLabel: 'Iccitii & Seera Eeguu:',
    footerPrivacyComplianceText: "Odeeffannoon qunnamtii dhuunfaa gonkumaa hin mul'atu. To'annoo heeyyama hojjettootaa cimaa fi sirna qorannoo hordoffii sarara irraa ala (offline) hojjatu kan amansiisaa ta'e qaba.",
    footerDeveloperContactTitle: 'Qunnamtii Hojjetaa',
    footerDeveloperQrLabel: 'Koodii QR Profaayilii Hojjetaa',
    footerTelegramAsellaLabel: 'Sarara Teelegiraamii: Asella RVL',
    footerTelegramAdnisLabel: 'Sarara Teelegiraamii: ADNIS'
  },
  am: {
    title: 'ORVL Surveillance Intelligence Network',
    badge: 'የORVL ኔትወርክ',
    subtitle: 'የኦሮሚያ ቀጠናዊ የእንስሳት ላቦራቶሪ የበሽታዎች ቅኝትና የመረጃ መረብ',
    importedDataRange: 'የመረጃ ክልል:',
    offlineCacheActive: 'ኢንተርኔት በማይኖርበት ጊዜ ይሰራል (Offline)',
    cachedLocally: 'በመሳሪያው ላይ ተቀምጧል',

    dashboard: 'ዳሽቦርድ',
    map: 'የጂአይኤስ ካርታ',
    tables: 'ሰንጠረዦች',
    vaccineCalendar: 'የእንስሳት ክትባት መርሃ-ግብር',
    fastToolbox: 'የFAST እና አንድ ጤና መሣሪያዎች',
    fastDiseases: 'የFAST በሽታዎች',
    resourceLibrary: 'የመመሪያዎችና ማጣቀሻዎች ማዕከል',
    fieldInvestigation: 'የመስክ ወረርሽኝ ምርመራ',
    fieldToolkit: 'የመስክ መሣሪያዎች',
    labDiagnostics: 'የላቦራቶሪ ምርመራ',
    oneHealth: 'አንድ ጤና (One Health)',
    trainingHub: 'የስልጠና እና እውቀት ማዕከል',

    allZones: 'ሁሉንም ወረዳዎች (36 ወረዳዎች)',
    eastHararghe: 'ምስራቅ ሐረርጌ (21)',
    westHararghe: 'ምዕራብ ሐረርጌ (15)',

    logArrival: 'የመስክ ሪፖርት አስገባ',
    profileSimulator: 'የስርዓት አስመሳይ (Simulator)',
    simulatorActive: 'አስመሳይ ሞዴል እየሰራ ነው',
    multiExcelImport: 'የኤክሴል መረጃ አስገባ',
    yoyAnalysis: 'የዓመት ንጽጽር (YoY)',
    csvExport: 'CSV ላክ',
    aiSitrepReport: 'የAI የወረርሽኝ ሪፖርት',
    googleDrive: 'ጉግል ድራይቭ',
    openAccessPortal: 'ክፍት የመረጃ ማዕከል',
    supportTemplate: 'የድጋፍ እና አብነቶች ቅጽ',
    resetCache: 'ካች አጽዳ',
    portraitView: '📱 የቁመት እይታ',
    portraitActive: '📱 የቁመት እይታ በርቷል',
    fieldPrintSnapshot: '🖨️ የመስክ ህትመት',
    exitPrintView: '🖨️ ከህትመት እይታ ውጣ',
    signIn: 'ግባ',
    signOut: 'ውጣ',
    installApp: 'መተግበሪያውን ጫን',
    appInstalled: 'መተግበሪያው ተጭኗል',
    installHRVLDashboard: 'የORVL ኔትወርክ መተግበሪያን ጫን',
    installPwaDescription: 'ያለ ኢንተርኔት ፈጣን የመስክ ክትትል፣ የጂአይኤስ ካርታ እና የወረርሽኝ ትንተና ለማከናወን ORVL Surveillance Intelligence Networkን ይጫኑ።',
    installOnIos: 'በiPhone / iPad ላይ ጫን',
    iosShareStep: 'በSafari መሣሪያ አሞሌ ውስጥ የShare ምልክትን ይጫኑ',
    iosAddHomeStep: 'ወደ ታች ወርደው "Add to Home Screen" የሚለውን ይምረጡ',
    notNow: 'አሁን አይደለም',
    installNow: 'አሁን ጫን',
    dayMode: 'ቀን',
    nightMode: 'ሌሊት',

    language: 'ቋንቋ',
    selectLanguage: 'ቋንቋ ይምረጡ',
    generatingReport: 'በAI የታገዘ የኤፒዲሚዮሎጂ ሪፖርት በማዘጋጀት ላይ...',
    synthesizingData: 'የምስራቅ እና ምዕራብ ሐረርጌ የበሽታ ሁኔታዎችን በGemini AI በማቀናጀት ላይ',
    outbreakEvaluation: 'የወረርሽኝ ሁኔታ ግምገማ እና የድንበር ተሻጋሪ አደጋዎች:',
    recommendations: 'መወሰድ ያለባቸው ተግባራዊ የህክምና እና ቁጥጥር እርምጃዎች:',
    close: 'ዝጋ',
    printOfficial: 'ይፋዊ የመስክ ሪፖርት አትም',
    tblSearch: 'ፈልግ...',
    tblExportCSV: 'CSV ላክ',
    tblShowingRecords: 'የሚታየው',
    tblRows: 'ረድፎች:',
    tblPage: 'ገጽ',
    tblOf: 'ከ',
    tblAnomalyDetection: 'ያልተለመደ ክስተት ማጣሪያ',
    tblHistoricalBenchmark: 'የ36ቱ ወረዳዎች መነሻ',
    
    colDiseaseName: 'የበሽታው ስም',
    colOutbreaks: 'የወረርሽኝ ክስተቶች',
    colTotalCases: 'አጠቃላይ ታማሚ እንስሳት',
    colDeaths: 'የሞቱ እንስሳት',
    colMorbidity: 'የመታመም ምጣኔ %',
    colCFR: 'የሞት ምጣኔ (CFR %)',
    colPrimarySpecies: 'ዋና የተጠቃ ዝርያ',
    colRiskLevel: 'የአደጋ ደረጃ',

    colWoreda: 'ወረዳ',
    colZone: 'ዞን',
    colStatus: 'የበሽታው ሁኔታ',
    colStartDate: 'የተጀመረበት ቀን',
    colDuration: 'የቆይታ ጊዜ',

    colDate: 'ቀን',
    colSpecies: 'የእንስሳት ዝርያ',
    colCases: 'የታመሙ',
    colReporter: 'መረጃውን ያቀረበው ባለሙያ',

    colComplianceRate: 'የተገዢነት ምጣኔ',
    colTimeliness: 'በወቅቱ የማቅረብ ምጣኔ',
    colZeroReports: 'የዜሮ-በሽታ ክትትል ሪፖርት (Zero-reporting)',
    colExpected: 'የሚጠበቅ',
    colSubmitted: 'የቀረበ',

    titleDiseaseSummary: 'የእንስሳት በሽታዎች ማጠቃለያ',
    titleActiveOutbreaks: 'አስቸኳይ ትኩረት የሚሹ ንቁ ወረርሽኞች',
    titleSurveillanceLog: 'የመስክ ክትትል መዝገብ',
    titleCompliance: 'የሪፖርት አቀራረብ ተገዢነት እና ጥራት',

    speciesDistributionTitle: 'የእንስሳት ዝርያዎች ስርጭት (7 ዝርያዎች)',
    speciesTotal: 'አጠቃላይ:',
    speciesCasesLabel: 'የህመም ጉዳዮች',
    speciesTotalCases: 'አጠቃላይ የታመሙ እንስሳት',

    cfrCaseFatality: 'የታማሚ እንስሳት የሞት ምጣኔ (CFR) አቅጣጫ',
    cfrWAHOBenchmark: 'የWAHO ክልላዊ የደረጃ መለኪያ',
    cfrYoYComparative: 'የዓመታት ንጽጽር (YoY)',
    cfrAllDiseases: 'ሁሉም በሽታዎች (2026)',
    cfrSelectFocus: 'የትኩረት በሽታ ይምረጡ:',
    cfrTargetKeep: 'ዒላማ፡ ከአንትራክስ ውጭ የሆኑ በሽታዎች CFR < 10% ማቆየት',
    cfrTargetThreshold: 'የዒላማ ገደብ (10%)',

    melPerformance: 'የክትትል፣ ግምገማ እና ትምህርት (MEL) አፈጻጸም እና የመረጃ ጥራት',
    wahoRegionalScorecard: 'የWAHO ክልላዊ ተገዢነት የውጤት ካርድ',
    melAllZones: 'ሁሉንም ዞኖች',
    melComplianceRate: 'የተገዢነት ምጣኔ',
    melZeroReports: 'የዜሮ-በሽታ ሪፖርቶች',
    melTimeliness: 'በወቅቱ ማቅረብ',
    melScore: 'ውጤት',
    melNeedsImprovement: 'መሻሻል ያስፈልገዋል',
    melModerate: 'መካከለኛ',
    melExcellent: 'በጣም ጥሩ',
    melGenerateSitrep: 'ይፋዊ SitRep አዘጋጅ',
    melCompileData: 'መረጃዎችን በWAHO መስፈርት አጠናቅር',

    chartEpidemiologicalCurves: 'የወረርሽኝ ስርጭት አዝማሚያ ሰንጠረዥ (WAHO)',
    chartHistoricalOverlay: 'የቀደመ ዓመት ንጽጽር:',
    chartYoYComparison: 'የዓመት ንጽጽር',
    chartTimeline: 'የጊዜ ሰሌዳ:',
    chartDaily: 'በቀን',
    chartWeekly: 'በሳምንት',
    chartMonthly: 'በወር',
    chartLegendCases: 'የአሁኑ ታማሚዎች',
    chartLegendCases2025: 'የ2025 ታማሚዎች',
    chartLegendCases2024: 'የ2024 ታማሚዎች',
    chartLegendDeaths: 'የሞቱ እንስሳት',
    chartLegendZero: 'የዜሮ-በሽታ ሪፖርቶች',

    kpiSurveillance: 'የመስክ የበሽታ ክትትል መረጃዎች',
    kpiZeroDisease: 'ከወረርሽኝ ነጻ መሆንን ማረጋገጫዎች',
    kpiLabConfirmed: 'በላቦራቶሪ የተረጋገጡ እና የተጠረጠሩ',
    kpiVerified: 'ተረጋግጧል',
    kpiHrvlDiagnostic: 'የላቦራቶሪ ምርመራ',
    kpiLabVerifiedCases: 'በላቦራቶሪ የተረጋገጡ ታማሚ እንስሳት',
    kpiActiveOutbreaks: 'ንቁ ወረርሽኞች (አስቸኳይ ትኩረት የሚሹ)',
    kpiQuarantined: 'ተለይቶ ቁጥጥር የተደረገበት',
    kpiEmergencyAlert: 'የአስቸኳይ ጊዜ ማስጠንቀቂያ',
    kpiFmdPprLsd: 'FMD, PPR, LSD, Newcastle, CBPP',
    kpiOverallCfr: 'አጠቃላይ የታማሚዎች የሞት ምጣኔ',
    kpiAboveLimit: 'ከWOAH ገደብ በላይ',
    kpiWithinThreshold: 'በተፈቀደው ገደብ ውስጥ',
    kpiDeaths: 'የሞቱ',
    kpiTotalAnimalCases: 'አጠቃላይ የታመሙ እንስሳት:',
    kpiMelReporting: 'የMEL ሪፖርት አቀራረብ ተገዢነት',
    kpiTarget80: 'ዒላማ >= 80%',
    kpiWoredas36: '36ቱ የሐረርጌ ወረዳዎች',
    kpiWeeklySubmission: 'ሳምንታዊ የሪፖርት ሙሉነት',
    kpiAffectedWoredas: 'በበሽታው የተጠቁ ወረዳዎች ምጣኔ',
    kpiSpread: 'የስርጭት አድማስ',
    kpiSpatialIndex: 'የቦታ መረጃ ጠቋሚ',
    kpiEastWestHararghe: 'ምስራቅ (21) እና ምዕራብ (15) ሐረርጌ',
    kpiNetworkCoverage: 'የክትትል አውታረ መረብ ሽፋን',
    kpiMelCompliance: 'የMEL ተገዢነት',
    kpiWahoBenchmark: 'የWAHO መስፈርት፡ ሳምንታዊ ሪፖርት ሙሉነት ≥80%',
    kpiEastZone: 'የምስራቅ ሐረርጌ ዞን',
    kpiReportingCompleteness: 'የሪፖርት ሙሉነት',
    kpiHighDensityEast: 'ከፍተኛ ጥግግት፡ ሀረማያ፣ ባቢሌ፣ ዳዳር፣ ግራዋ',
    kpiWestZone: 'የምዕራብ ሐረርጌ ዞን',
    kpiHighDensityWest: 'ከፍተኛ ጥግግት፡ ጭሮ፣ ዳሮ ለቡ፣ ሀብሮ፣ ሚኤሶ',

    tourPurposeLabel: 'ዓላማ',
    tourCapabilitiesLabel: 'ዋና ዋና አቅሞች እና ተግባራት',
    tourTranscriptLabel: 'የድምፅ መመሪያ ጽሑፍ (AM)',
    tourNarratingStatus: 'ድምፁ እየተነበበ ነው...',
    tourSpeakingStatus: 'እየተናገረ ነው',
    tourDontShowAgainLabel: 'ይህንን መመሪያ በድጋሚ በራሱ አታሳይ',
    tourSkipButton: 'ጉብኝቱን እለፍ',
    tourBackButton: 'ተመለስ',
    tourNextButton: 'ቀጣይ',
    tourFinishButton: 'ጉብኝቱን ጨርስ',
    tourVoiceOn: 'ድምፅ በርቷል',
    tourVoiceOff: 'ድምፅ ጠፍቷል',
    tourAdminNotice: 'ማስታወሻ፡ የስርዓት አስተዳደር ቅንብሮች እና የተጠቃሚ ፈቃዶች ለተፈቀደላቸው አካላት ብቻ የተገደቡ ናቸው።',

    // Footer & Disclaimer Transcripts
    footerAboutTitle: 'ስለዚህ መድረክ',
    footerExpandedView: 'ሰፊ እይታ',
    footerClose: 'ዝጋ',
    footerPlatformDescription: 'ይህ መድረክ በእንስሳት በሽታ ክትትል፣ በእንስሳት ህክምና ላቦራቶሪ ምርመራ፣ በመስክ ኤፒዲሚዮሎጂ፣ በሪፖርት አቀራረብ እና በመረጃ ላይ በተመሰረተ የእንስሳት ጤና ውሳኔ አሰጣጥ ላይ የተቀናጀ ዲጂታል አሰራርን ያቀርባል።',
    footerCombinedSectionTitle: 'የመረጃ ሚስጥራዊነት፣ የህግ ማስተባበያ እና የገንቢ አድራሻ',
    footerLegalDisclaimer: 'እዚህ የቀረቡት ሁሉም የኤፒዲሚዮሎጂ፣ የላቦራቶሪ እና የበሽታ ወረርሽኝ መረጃዎች በኦሮሚያ ክልላዊ የእንስሳት ላቦራቶሪ የበሽታ ክትትል ኢንተለጀንስ አውታር የመረጃ አስተዳደር እና ሚስጥራዊነት ፕሮቶኮሎች መሰረት የተሰበሰቡ፣ የተተነተኑ እና የተከማቹ ናቸው፤ ይህም ከብሔራዊ የእንስሳት ህዝብ ጤና ደንቦች እና ከWOAH/WAHO የሪፖርት አቀራረብ ደረጃዎች ጋር የተጣጣመ ነው። ዝርዝር የጉዳይ ደረጃ መረጃዎችን ማግኘት ለተፈቀደላቸው ባለሙያዎች ብቻ የተገደበ ሲሆን፣ ያለ ተቋማዊ ፈቃድ ከመድረኩ ማንኛውንም ይዘት ማባዛት ወይም ማሰራጨት በጥብቅ የተከለከለ ነው።',
    footerNetworkSyncLabel: 'የአውታረ መረብ ቅንጅት:',
    footerNetworkSyncText: 'ተሳታፊ የሆኑ የክልል የእንስሳት ላቦራቶሪዎች በሁሉም የሥራ ክልሎች ወጥ የሆነ የክትትል መረጃ ለመጠበቅ በራስ-ሰር እርስ በእርስ ይገናኛሉ እንዲሁም ይቀናጃሉ።',
    footerPrivacyComplianceLabel: 'ግላዊነት እና ተገዢነት:',
    footerPrivacyComplianceText: 'የግል አድራሻ መረጃዎች ሙሉ በሙሉ የተጠበቁ ናቸው። አስተማማኝ ሚና-ተኮር የተጠቃሚ ፈቃድ እና ደህንነቱ የተጠበቀ የበይነመረብ አልባ (offline) የስለላ ኢንተለጀንስ ስርዓት።',
    footerDeveloperContactTitle: 'የገንቢ አድራሻ',
    footerDeveloperQrLabel: 'የገንቢ መገለጫ QR ኮድ',
    footerTelegramAsellaLabel: 'የቴሌግራም ቻናል: Asella RVL',
    footerTelegramAdnisLabel: 'የቴሌግራም ቻናል: ADNIS'
  },
};

export const LANGUAGE_OPTIONS: { id: Locale; name: string; flag: string; nativeName: string }[] = [
  { id: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
  { id: 'om', name: 'Afaan Oromoo', flag: '🌳', nativeName: 'Afaan Oromoo' },
  { id: 'am', name: 'Amharic', flag: '🇪🇹', nativeName: 'አማርኛ' },
];
