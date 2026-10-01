import { sync2025And2026Data } from './utils/syncDriveFolders';
import { VaccineCalendarContainer } from './components/VaccineCalendarContainer';
import { FastModuleContainer, FastSubTab } from './components/fast/FastModuleContainer';
import { FieldToolkitContainer } from './components/fieldToolkit/FieldToolkitContainer';
import { AdminConsole } from './components/admin/AdminConsole';
import { AccountStatusBanner } from './components/AccountStatusBanner';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Printer, X, ShieldCheck, FileText, Check, Activity, Building2, UserCircle2, Calendar, RotateCcw, Filter, AlertTriangle, AlertOctagon } from 'lucide-react';
import { isRecordInDateRange, formatDateRangeDisplay } from './utils/dateFilter';
import { Navbar } from './components/Navbar';
import { KPICards } from './components/KPICards';
import { MELScorecardPanel } from './components/MELScorecardPanel';
import { OutbreakMap } from './components/OutbreakMap';
import { TrendCharts } from './components/TrendCharts';
import { SpeciesDonutChart } from './components/SpeciesDonutChart';
import { CFRTrendChart } from './components/CFRTrendChart';
import { DiseaseSummaryTable } from './components/DiseaseSummaryTable';
import { OutbreakTable } from './components/OutbreakTable';
import { SurveillanceTable } from './components/SurveillanceTable';
import { ComplianceTable } from './components/ComplianceTable';
import { FooterBanner } from './components/FooterBanner';
import { NewArrivalModal } from './components/NewArrivalModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { YoYTrendAnalysisModal } from './components/YoYTrendAnalysisModal';
import { AIReportModal } from './components/AIReportModal';
import { PrintableReportView } from './components/PrintableReportView';
import { AuthModal } from './components/AuthModal';
import { SupportModal } from './components/SupportModal';
import { ExternalResourcesModal } from './components/ExternalResourcesModal';
import { ProfileModal } from './components/ProfileModal';
import { ExportConfirmModal } from './components/ExportConfirmModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { usePWAInstall } from './utils/usePWAInstall';
import { useOnboardingTour } from './utils/useOnboardingTour';
import { useLaboratory } from './contexts/LaboratoryContext';
import { 
  TourWelcome, 
  TourOverview, 
  OnboardingTour
} from './components/onboarding';

import { 
  FilterState, 
  SurveillanceRecord, 
  Outbreak, 
  WoredaCompliance, 
  DiseaseSummary,
  NarrativeReport,
  Locale,
  ActiveTab,
  PersonnelRecord,
  DatasetMetadata,
  ImportBatchRecord
} from './types';

import { 
  INITIAL_SURVEILLANCE_RECORDS, 
  INITIAL_OUTBREAKS, 
  ALL_OUTBREAKS,
  generateInitialCompliance, 
  DISEASE_SUMMARIES,
  getDiseaseSummariesForLab
} from './data/sampleData';
import { HARARGHE_WOREDAS } from './data/woredas';
import { exportToCSV } from './utils/export';
import { loadCachedRecords, saveCachedRecords, clearCachedRecords } from './utils/storage';
import { 
  subscribeToFirestoreRecords, 
  saveRecordToFirestore, 
  subscribeToPersonnel, 
  subscribeToDatasetMetadata, 
  subscribeToImportBatches,
  flushCachedRecordsToFirestore
} from './utils/firebaseStorage';
import { syncHistoricalAdnisArchiveFromDrive } from './utils/adnisImporter';
import { PersonnelDirectoryModal } from './components/PersonnelDirectoryModal';
import { AdnisArchiveModal } from './components/AdnisArchiveModal';
import { WelcomeLabPortal } from './components/auth/WelcomeLabPortal';
import { AccountStatusScreen } from './components/auth/AccountStatusScreen';
import { UnauthorizedLabScreen } from './components/auth/UnauthorizedLabScreen';
import { EmailVerificationScreen } from './components/auth/EmailVerificationScreen';
import { useAuth } from './contexts/AuthContext';
import { useI18n } from './contexts/I18nContext';
import { useTheme } from './contexts/ThemeContext';
import { soundEngine } from './utils/sound';

export default function App() {
  const { 
    user, 
    userProfile, 
    unverifiedEmail,
    setUnverifiedEmail,
    loading, 
    isApproved, 
    isPendingApproval, 
    isSuspended, 
    isRejected, 
    isApprovedForLab,
    accessToken, 
    connectGoogleDrive 
  } = useAuth();
  const { locale, setLocale, t } = useI18n();
  const { darkMode, setTheme } = useTheme();
  const setDarkMode = useCallback((val: boolean | ((prev: boolean) => boolean)) => {
    if (typeof val === 'function') {
      setTheme(val(darkMode) ? 'dark' : 'light');
    } else {
      setTheme(val ? 'dark' : 'light');
    }
  }, [darkMode, setTheme]);

  // Active Laboratory Tenant Context
  const { selectedLab, currentLabInfo } = useLaboratory();
  
  // Primary Dashboard State - Initialized from localStorage cache for field offline resilience
  const [records, setRecords] = useState<SurveillanceRecord[]>(() => loadCachedRecords('all'));
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>(ALL_OUTBREAKS);
  const [complianceList, setComplianceList] = useState<WoredaCompliance[]>(() => generateInitialCompliance(selectedLab));
  const [diseaseSummaries, setDiseaseSummaries] = useState<DiseaseSummary[]>(() => getDiseaseSummariesForLab(selectedLab));

  // Synchronize complianceList whenever selected laboratory changes
  useEffect(() => {
    setComplianceList(generateInitialCompliance(selectedLab));
  }, [selectedLab]);

  // Network Connectivity State (Field Offline Mode Tracking)
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Synchronize network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Automatic localStorage Sync Effect whenever surveillance records change
  useEffect(() => {
    saveCachedRecords(records);
  }, [records]);

  // Real-time Firestore sync effect scoped by active laboratory
  useEffect(() => {
    const unsubRecords = subscribeToFirestoreRecords((remoteRecords) => {
      if (remoteRecords && remoteRecords.length > 0) {
        setRecords(remoteRecords);
      }
    }, undefined, selectedLab);

    const unsubPersonnel = subscribeToPersonnel((list) => {
      setPersonnelList(list);
    }, undefined, selectedLab);

    const unsubMetadata = subscribeToDatasetMetadata((meta) => {
      setDatasetMetadata(meta);
    });

    const unsubBatches = subscribeToImportBatches((batches) => {
      setImportBatches(batches);
    }, selectedLab);

    return () => {
      unsubRecords();
      unsubPersonnel();
      unsubMetadata();
      unsubBatches();
    };
  }, [selectedLab]);

  // ADNIS Historical Data State
  const [personnelList, setPersonnelList] = useState<PersonnelRecord[]>([]);
  const [datasetMetadata, setDatasetMetadata] = useState<DatasetMetadata | null>(null);
  const [importBatches, setImportBatches] = useState<ImportBatchRecord[]>([]);
  const [isSyncingAdnis, setIsSyncingAdnis] = useState(false);

  const handleSyncAdnisArchive = async () => {
    let token = accessToken;
    if (!token) {
      setIsGoogleDriveOpen(true);
      return;
    }

    setIsSyncingAdnis(true);
    try {
      const res = await syncHistoricalAdnisArchiveFromDrive(token);
      alert(`Successfully synchronized ADNIS Historical Archive! Accepted ${res.totalAcceptedRecords} records classified and partitioned across HRVL & ARVL.`);
    } catch (err: any) {
      const errMsg = String(err);
      if (errMsg.includes('insufficient authentication scopes') || errMsg.includes('403')) {
        setIsGoogleDriveOpen(true);
      } else {
        alert("Failed to sync ADNIS historical archive: " + errMsg);
      }
    } finally {
      setIsSyncingAdnis(false);
    }
  };

  // Reset local storage cache to initial default data
  
  const [isSyncingData, setIsSyncingData] = useState(false);
  const handleSyncAnnualData = async () => {
    let token = accessToken;
    if (!token) {
      setIsGoogleDriveOpen(true);
      return;
    }
    
    setIsSyncingData(true);
    try {
      const syncedRecords = await sync2025And2026Data(token);
      if (syncedRecords.length > 0) {
        alert(`Successfully synchronized ${syncedRecords.length} records across ADNIS_2025 & ADNIS_2026! All records are durably committed to Cloud Firestore (baseline_data & current_data) and permanently visualized across all mapping and analytics modules.`);
      } else {
        alert("Sync completed. No new records found to import.");
      }
    } catch (err: any) {
      const errMsg = String(err);
      if (errMsg.includes('insufficient authentication scopes') || errMsg.includes('403')) {
        setIsGoogleDriveOpen(true);
      } else {
        alert("Failed to sync annual data: " + errMsg);
      }
    } finally {
      setIsSyncingData(false);
    }
  };

  const handleResetCache = () => {
    clearCachedRecords();
    setRecords(INITIAL_SURVEILLANCE_RECORDS);
  };

  const handleForceSyncToFirestore = async () => {
    setIsSyncingData(true);
    try {
      const result = await flushCachedRecordsToFirestore(records);
      if (result.success) {
        soundEngine.playSuccess();
        alert(`Successfully flushed ${result.count} cached surveillance records to Cloud Firestore.`);
      } else {
        alert(`Data flush notice: ${result.error || 'Cached records stored in Firestore offline persistence queue.'}`);
      }
    } catch (err) {
      alert(`Failed to flush cached records to Firestore: ${String(err)}`);
    } finally {
      setIsSyncingData(false);
    }
  };

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    laboratory: 'all',
    zone: 'All',
    woreda: 'All',
    disease: 'All',
    species: 'All',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  });

  // Simulator, Portrait Layout & Print Mode State
  const [isSimulatorRunning, setIsSimulatorRunning] = useState(false);
  const [isPrintFriendlyMode, setIsPrintFriendlyMode] = useState(false);
  const [isPortraitMode, setIsPortraitMode] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('Dashboard');
  const [fastSubTab, setFastSubTab] = useState<FastSubTab>('diseases');

  // Modals
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isYoYModalOpen, setIsYoYModalOpen] = useState(false);
  const [isAIReportModalOpen, setIsAIReportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isGoogleDriveOpen, setIsGoogleDriveOpen] = useState(false);
  const [isExternalResourcesOpen, setIsExternalResourcesOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPWAInstallModalOpen, setIsPWAInstallModalOpen] = useState(false);
  const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);
  const [isAdnisArchiveModalOpen, setIsAdnisArchiveModalOpen] = useState(false);
  const [isExportConfirmModalOpen, setIsExportConfirmModalOpen] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [printableReport, setPrintableReport] = useState<NarrativeReport | null>(null);

  // Enterprise Interactive Onboarding & Visual Navigation Hook (LocalStorage persistence & First-Visit detection)
  const {
    isWelcomeOpen,
    isTourOpen,
    isOverviewOpen,
    dontShowAgain: dontShowAgainWelcome,
    voiceEnabled,
    openWelcome: handleOpenWelcome,
    closeWelcome: handleCloseWelcome,
    startTour: handleStartTour,
    closeTour: handleCloseTour,
    watchOverview: handleWatchOverview,
    closeOverview: handleCloseOverview,
    exploreFreely: handleExploreFreely,
    toggleDontShowAgain: handleToggleDontShowWelcome,
    toggleVoice: handleToggleVoice,
  } = useOnboardingTour();

  const handleSelectFastSection = useCallback((sec: 'diseases' | 'resources' | 'field-tools' | 'laboratory' | 'one-health' | 'training') => {
    setFastSubTab(sec);
    setActiveTab('FAST');
  }, []);

  // PWA Installation Hook
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isDismissed,
    install: installPWA,
    dismissPrompt: dismissPWAPrompt
  } = usePWAInstall();

  // Real-time Field Profile Simulator Interval
  useEffect(() => {
    let interval: any = null;
    if (isSimulatorRunning) {
      interval = setInterval(() => {
        // Pick random woreda from 36 Hararghe woredas
        const randomWoreda = HARARGHE_WOREDAS[Math.floor(Math.random() * HARARGHE_WOREDAS.length)];
        const diseases = [
          'Foot-and-Mouth Disease (FMD)',
          'Peste des Petits Ruminants (PPR)',
          'Lumpy Skin Disease (LSD)',
          'Contagious Bovine Pleuropneumonia (CBPP)',
          'Newcastle Disease (ND)'
        ];
        const speciesList = ['Cattle', 'Goats', 'Sheep', 'Poultry', 'Equines'];
        
        const isZero = Math.random() < 0.25; // 25% chance of zero report
        const randomDisease = isZero ? 'None (Zero Reporting)' : diseases[Math.floor(Math.random() * diseases.length)];
        const randomSpecies = isZero ? 'Cattle' : speciesList[Math.floor(Math.random() * speciesList.length)];
        const cases = isZero ? 0 : Math.floor(Math.random() * 25) + 5;
        const deaths = isZero ? 0 : Math.floor(cases * (Math.random() * 0.2));

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];

        const simRecord: SurveillanceRecord = {
          id: `SIM-${Date.now()}`,
          date: dateStr,
          timestamp: now.getTime(),
          woreda: randomWoreda.name,
          zone: randomWoreda.zone,
          lat: randomWoreda.lat,
          lng: randomWoreda.lng,
          disease: randomDisease,
          species: randomSpecies,
          cases,
          deaths,
          risk: deaths > 3 ? 'Critical' : cases > 15 ? 'High' : 'Medium',
          comment: `Live simulated field telemetry stream arrival on ${now.toLocaleTimeString()}`,
          reporter: `Automated ${currentLabInfo.shortCode} Stream`,
          isZeroReport: isZero
        };

        setRecords(prev => [simRecord, ...prev]);
      }, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulatorRunning, currentLabInfo.shortCode]);

  // State for real-time surveillance record validation alerts
  const [validationAlert, setValidationAlert] = useState<{
    type: 'error' | 'warning' | 'flagged';
    title: string;
    message: string;
    details?: string[];
  } | null>(null);

  // Auto-dismiss validation toast after 9 seconds
  useEffect(() => {
    if (validationAlert) {
      const timer = setTimeout(() => {
        setValidationAlert(null);
      }, 9000);
      return () => clearTimeout(timer);
    }
  }, [validationAlert]);

  // Handle adding new arrival record manually or from quick simulator with robust epidemiological validation
  const handleAddLogArrival = (rec: Partial<SurveillanceRecord>): boolean => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // --- STEP 1: VALIDATE REQUIRED FIELDS & FORMATS ---
    const woredaStr = (rec.woreda || '').trim();
    if (!woredaStr) {
      errors.push('Woreda / Administrative district name is required.');
    }

    const zoneStr = (rec.zone || '').trim();
    if (!zoneStr) {
      errors.push('Epidemiological zone classification is required.');
    }

    const dateStr = (rec.date || '').trim();
    if (!dateStr) {
      errors.push('Observation / reporting date is required.');
    } else {
      const parsedDate = Date.parse(dateStr);
      if (isNaN(parsedDate)) {
        errors.push('Observation date is not a valid calendar date format.');
      } else {
        const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
        if (parsedDate > tomorrow) {
          errors.push('Observation date cannot be set in the future.');
        }
      }
    }

    const isZero = rec.isZeroReport === true;
    if (!isZero) {
      const diseaseStr = (rec.disease || '').trim();
      if (!diseaseStr || diseaseStr.toLowerCase() === 'none') {
        errors.push('Target disease classification is required for positive surveillance records.');
      }

      const speciesStr = (rec.species || '').trim();
      if (!speciesStr || speciesStr.toLowerCase() === 'none') {
        errors.push('Affected livestock species is required for positive surveillance records.');
      }
    }

    const rawCases = rec.cases;
    const cases = rawCases !== undefined && rawCases !== null ? Number(rawCases) : NaN;
    if (isNaN(cases) || cases < 0) {
      errors.push('Reported cases count must be a non-negative number.');
    }

    const rawDeaths = rec.deaths;
    const deaths = rawDeaths !== undefined && rawDeaths !== null ? Number(rawDeaths) : NaN;
    if (isNaN(deaths) || deaths < 0) {
      errors.push('Reported fatalities count must be a non-negative number.');
    }

    // Fundamental Epidemiological Rule: Fatalities cannot exceed reported cases
    if (!isNaN(cases) && !isNaN(deaths) && deaths > cases) {
      errors.push(`Epidemiological inconsistency: Fatalities count (${deaths}) cannot exceed reported cases (${cases}).`);
    }

    // --- STEP 2: CHECK VALIDATION OUTCOME FOR FATAL ERRORS ---
    if (errors.length > 0) {
      console.warn('[Surveillance Validation] Record rejected before saving to Firestore:', errors, rec);
      setValidationAlert({
        type: 'error',
        title: 'Surveillance Validation Failed — Record Not Saved',
        message: 'The record was rejected and NOT committed to Cloud Firestore due to missing required fields or logical discrepancies.',
        details: errors
      });
      return false;
    }

    // --- STEP 3: MORTALITY RATE (CFR) EVALUATION & FLAGGING ---
    const effectiveCases = isZero ? 0 : cases;
    const effectiveDeaths = isZero ? 0 : deaths;

    let isHighMortality = false;
    let cfr = 0;
    if (!isZero && effectiveCases > 0 && effectiveDeaths >= 0) {
      cfr = Number(((effectiveDeaths / effectiveCases) * 100).toFixed(1));
      // Flag unusually high mortality: CFR >= 40% OR (deaths >= 5 and CFR >= 25%)
      if (cfr >= 40 || (effectiveDeaths >= 5 && cfr >= 25)) {
        isHighMortality = true;
        warnings.push(`Unusually high Case Fatality Rate (CFR) detected: ${cfr}% (${effectiveDeaths} deaths / ${effectiveCases} cases).`);
      }
    }

    let effectiveRisk = rec.risk || 'High';
    let dataQualityStatus = rec.dataQualityStatus || 'VERIFIED_OFFICIAL';
    let comment = (rec.comment || 'Field record added manually').trim();

    if (isHighMortality) {
      effectiveRisk = 'Critical';
      dataQualityStatus = 'FLAGGED_HIGH_MORTALITY';
      const alertTag = `[EPIDEMIOLOGICAL ALERT: Unusually high mortality (CFR ${cfr}% - ${effectiveDeaths}/${effectiveCases} deaths). Prioritized for supervisory investigation.]`;
      comment = comment ? `${comment} ${alertTag}` : alertTag;

      setValidationAlert({
        type: 'flagged',
        title: '⚠️ Unusually High Mortality Rate Flagged',
        message: `High Case Fatality Rate (${cfr}%) detected. The record has been elevated to 'Critical' risk, flagged in Firestore, and queued for supervisory verification.`,
        details: warnings
      });
    } else {
      setValidationAlert(null);
    }

    // --- STEP 4: PERSIST VALIDATED & FLAGGED RECORD TO FIRESTORE ---
    const fullRec: SurveillanceRecord = {
      id: rec.id || `SR-${Date.now()}`,
      laboratoryId: rec.laboratoryId || (selectedLab === 'arvl' ? 'arvl' : 'hrvl'),
      laboratoryName: rec.laboratoryName || (selectedLab === 'arvl' ? 'Asela Regional Veterinary Laboratory' : 'Hirna Regional Veterinary Laboratory'),
      region: rec.region || 'Oromia',
      date: dateStr,
      timestamp: rec.timestamp || (dateStr ? new Date(dateStr).getTime() : Date.now()),
      woreda: woredaStr,
      zone: zoneStr,
      lat: rec.lat || 9.4123,
      lng: rec.lng || 42.0123,
      disease: isZero ? 'None (Zero Reporting)' : (rec.disease || 'Foot-and-Mouth Disease (FMD)'),
      species: isZero ? 'None' : (rec.species || 'Cattle'),
      cases: effectiveCases,
      deaths: effectiveDeaths,
      risk: isZero ? 'Low' : effectiveRisk,
      comment,
      reporter: (rec.reporter || 'Vet Officer').trim(),
      phone: rec.phone,
      isZeroReport: isZero,
      dataQualityStatus
    };

    setRecords(prev => [fullRec, ...prev]);
    saveRecordToFirestore(fullRec);

    // Recalculate disease summary counts
    setDiseaseSummaries(prev => prev.map(ds => {
      if (ds.disease === fullRec.disease) {
        return {
          ...ds,
          totalCases: ds.totalCases + fullRec.cases,
          totalDeaths: ds.totalDeaths + fullRec.deaths,
          cfrPercent: Number((((ds.totalDeaths + fullRec.deaths) / (ds.totalCases + fullRec.cases)) * 100).toFixed(1))
        };
      }
      return ds;
    }));

    return true;
  };

  // Handle Excel Batch Import
  const handleImportRecords = (newRecords: SurveillanceRecord[], minDate?: string, maxDate?: string) => {
    setRecords(prev => [...newRecords, ...prev]);
    newRecords.forEach(rec => saveRecordToFirestore(rec));
    if (minDate && maxDate) {
      setFilters(prev => ({ ...prev, dateFrom: minDate, dateTo: maxDate }));
    }
  };

  // Helper to determine if a record/item belongs to active laboratory context
  const isItemInSelectedLab = useCallback((zone: string, labId?: string) => {
    if (selectedLab === 'all') return true;
    if (labId) return labId.toLowerCase() === selectedLab.toLowerCase();
    if (selectedLab === 'hrvl') return zone === 'E/H' || zone === 'W/H';
    if (selectedLab === 'arvl') return zone !== 'E/H' && zone !== 'W/H';
    return true;
  }, [selectedLab]);

  // Filtered dataset according to Navbar selection, date range filter, and active Laboratory Tenant
  const filteredRecords = useMemo(() => records.filter(rec => {
    if (!isItemInSelectedLab(rec.zone, rec.laboratoryId)) return false;
    if (filters.zone !== 'All' && rec.zone !== filters.zone) return false;
    if (filters.dateFrom || filters.dateTo) {
      if (!isRecordInDateRange(rec.date || rec.timestamp, filters.dateFrom, filters.dateTo)) return false;
    }
    return true;
  }), [records, isItemInSelectedLab, filters.zone, filters.dateFrom, filters.dateTo]);

  const filteredOutbreaks = useMemo(() => outbreaks.filter(ob => {
    if (!isItemInSelectedLab(ob.zone, ob.laboratoryId)) return false;
    if (filters.zone !== 'All' && ob.zone !== filters.zone) return false;
    if (filters.dateFrom || filters.dateTo) {
      if (!isRecordInDateRange(ob.startDate, filters.dateFrom, filters.dateTo)) return false;
    }
    return true;
  }), [outbreaks, isItemInSelectedLab, filters.zone, filters.dateFrom, filters.dateTo]);

  const filteredComplianceList = useMemo(() => complianceList.filter(comp => {
    if (!isItemInSelectedLab(comp.zone, comp.laboratoryId)) return false;
    if (filters.zone !== 'All' && comp.zone !== filters.zone) return false;
    return true;
  }), [complianceList, isItemInSelectedLab, filters.zone]);

  // Disease summaries dynamically derived for the active laboratory context
  const filteredDiseaseSummaries = useMemo(() => {
    return getDiseaseSummariesForLab(selectedLab, filteredRecords);
  }, [selectedLab, filteredRecords]);

  // Export All 4 Tables as CSV Bundle - Opens Confirmation Dialog
  const handleExportAllCSV = () => {
    setIsExportConfirmModalOpen(true);
  };

  // Executes bulk CSV downloads after explicit user confirmation
  const handleConfirmExportAllCSV = () => {
    setIsExportingCSV(true);
    try {
      const labCode = currentLabInfo.shortCode;
      exportToCSV(`${labCode}_Surveillance_Records`, filteredRecords);
      exportToCSV(`${labCode}_Outbreaks`, filteredOutbreaks);
      exportToCSV(`${labCode}_Woreda_Compliance`, filteredComplianceList);
      exportToCSV(`${labCode}_Disease_Summary`, filteredDiseaseSummaries);
    } finally {
      setIsExportingCSV(false);
      setIsExportConfirmModalOpen(false);
    }
  };

  const validDates = records
    .map(r => r.date)
    .filter(d => Boolean(d) && !isNaN(new Date(d).getTime()))
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
  const dataMinDate = validDates.length > 0 ? validDates[0] : undefined;
  const dataMaxDate = validDates.length > 0 ? validDates[validDates.length - 1] : undefined;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Verifying Authorization & Laboratory Credentials...</p>
        </div>
      </div>
    );
  }

  // 1. Email Verification Blocking Screen (Firebase Auth only)
  if (unverifiedEmail) {
    return (
      <>
        <EmailVerificationScreen 
          email={unverifiedEmail}
          onLoginClick={() => {
            setUnverifiedEmail(null);
            setIsAuthModalOpen(true);
          }}
        />
        <AuthModal 
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </>
    );
  }

  // 2. Unauthenticated -> Dual-Laboratory Welcome & Access Portal
  if (!user) {
    return <WelcomeLabPortal />;
  }

  // 2. Authenticated but Pending Approval, Suspended, or Rejected
  if (!isApproved || isPendingApproval || isSuspended || isRejected) {
    return <AccountStatusScreen />;
  }

  // 3. Approved user attempting an unauthorized laboratory context
  if (!isApprovedForLab(selectedLab)) {
    return <UnauthorizedLabScreen />;
  }

  // If printable report view is active
  if (printableReport) {
    return (
      <PrintableReportView
        report={printableReport}
        outbreaks={outbreaks}
        records={records}
        complianceList={complianceList}
        onBack={() => setPrintableReport(null)}
      />
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 flex flex-col lg:flex-row ${
      isPrintFriendlyMode 
        ? 'bg-white text-slate-900 border-t-8 border-amber-500' 
        : 'bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100'
    }`}>
      
      {/* Real-time Surveillance Record Validation Alert Toast */}
      <AnimatePresence>
        {validationAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed top-4 right-4 z-[9999] max-w-md w-[calc(100vw-2rem)] sm:w-auto p-4 rounded-2xl shadow-2xl border backdrop-blur-md ${
              validationAlert.type === 'error'
                ? 'bg-rose-950/95 border-rose-500 text-rose-100 shadow-rose-900/40'
                : 'bg-amber-950/95 border-amber-500 text-amber-100 shadow-amber-900/40'
            }`}
            role="alert"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${
                validationAlert.type === 'error' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {validationAlert.type === 'error' ? (
                  <AlertOctagon className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 text-xs">
                <div className="font-bold text-sm tracking-tight mb-1 text-white">
                  {validationAlert.title}
                </div>
                <p className="opacity-90 leading-relaxed mb-2">
                  {validationAlert.message}
                </p>
                {validationAlert.details && validationAlert.details.length > 0 && (
                  <ul className="space-y-1 bg-black/30 p-2.5 rounded-lg border border-white/10 font-mono text-[11px]">
                    {validationAlert.details.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className={validationAlert.type === 'error' ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                onClick={() => setValidationAlert(null)}
                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Vertical Navigation Bar */}
      <div className={isPrintFriendlyMode ? 'print:hidden' : 'shrink-0'}>
        <Navbar
          locale={locale}
          setLocale={setLocale}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          filters={filters}
          setFilters={setFilters}
          onOpenLogModal={() => setIsLogModalOpen(true)}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          onOpenYoYModal={() => setIsYoYModalOpen(true)}
          onOpenReportModal={() => setIsAIReportModalOpen(true)}
          onOpenPersonnelDirectory={() => setIsPersonnelModalOpen(true)}
          onOpenAdnisArchive={() => setIsAdnisArchiveModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenSupportModal={() => setIsSupportModalOpen(true)}
          onOpenExternalResources={() => setIsExternalResourcesOpen(true)}
          onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
          onExportAllCSV={handleExportAllCSV}
          onToggleSimulator={() => setIsSimulatorRunning(prev => !prev)}
          isSimulatorRunning={isSimulatorRunning}
          onTogglePrintMode={() => setIsPrintFriendlyMode(prev => !prev)}
          isPrintFriendlyMode={isPrintFriendlyMode}
          isPortraitMode={isPortraitMode}
          onTogglePortraitMode={() => setIsPortraitMode(prev => !prev)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          fastSubTab={fastSubTab}
          onSelectFastSection={(sec) => {
            setFastSubTab(sec);
            setActiveTab('FAST');
          }}
          isOnline={isOnline}
          cachedRecordsCount={records.length}
          activeOutbreakCount={outbreaks.length}
          onResetCache={handleResetCache}
          onSyncAnnualData={handleSyncAnnualData}
          isSyncingData={isSyncingData}
          onForceSync={handleForceSyncToFirestore}
          dataMinDate={dataMinDate}
          dataMaxDate={dataMaxDate}
          isPWAInstallable={isInstallable}
          isPWAInstalled={isInstalled}
          isIOS={isIOS}
          onOpenPWAInstall={() => setIsPWAInstallModalOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenWelcome={handleOpenWelcome}
          onStartTour={handleStartTour}
          onWatchOverview={handleWatchOverview}
        />
      </div>

      {/* Main Right Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen overflow-x-hidden">

        {/* Sticky Top Field Print Snapshot Alert Banner (Hidden when printing) */}
        {isPrintFriendlyMode && (
          <div className="print:hidden sticky top-0 z-50 bg-amber-500 text-slate-950 px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-2 border-b border-amber-600">
            <div className="flex items-center space-x-2 font-bold text-xs sm:text-sm">
              <Printer className="w-5 h-5 animate-bounce" />
              <span>🖨️ FIELD SNAPSHOT PRINT MODE — High-contrast white canvas optimized for physical field meetings & PDF export.</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 text-white font-extrabold text-xs rounded-lg hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Snapshot (Ctrl+P)</span>
              </button>

              <button
                onClick={() => setIsPrintFriendlyMode(false)}
                className="p-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-slate-950 font-bold text-xs cursor-pointer"
                title="Exit Print Mode"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Workspace Container */}
        <main className={`flex-1 w-full mx-auto transition-all duration-300 py-5 sm:py-6 pb-24 lg:pb-6 space-y-6 ${
          isPortraitMode 
            ? 'max-w-2xl px-3 sm:px-4 bg-slate-900/40 dark:bg-slate-900/60 rounded-3xl my-4 border border-indigo-500/20 shadow-2xl ring-1 ring-indigo-500/10' 
            : 'max-w-[1680px] 2xl:max-w-[1920px] px-3.5 sm:px-5 lg:px-6 xl:px-8'
        }`}>

          {/* User Account Approval & RBAC Status Banner */}
          <AccountStatusBanner 
            onOpenAdminConsole={() => setActiveTab('AdminConsole')}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />

        

        {/* Portrait Mode Field Banner */}
        {isPortraitMode && (
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-indigo-200 border border-indigo-700/60 p-4 rounded-2xl shadow-lg flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 font-medium">
              <span className="text-lg">📱</span>
              <div>
                <p className="font-extrabold text-white font-heading">Portrait Field Mode Active</p>
                <p className="text-[11px] text-indigo-300">Optimized vertical stack for handheld tablets & field mobile screens.</p>
              </div>
            </div>
            <button
              onClick={() => setIsPortraitMode(false)}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-[11px] transition-colors cursor-pointer shrink-0"
            >
              Exit Portrait
            </button>
          </div>
        )}
        
        {/* Printable Official Header Block (Appears prominently in print mode) */}
        {isPrintFriendlyMode && (
          <div className="bg-slate-50 border-2 border-slate-900 p-5 sm:p-6 rounded-xl space-y-4 print:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-300 pb-3 gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-xl shrink-0">
                  {currentLabInfo.shortCode}
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-tight">
                    {currentLabInfo.fullName.toUpperCase()} ({currentLabInfo.shortCode})
                  </h1>
                  <h2 className="text-xs font-bold text-slate-700 uppercase">
                    Field Epidemiology & Disease Surveillance Briefing Snapshot
                  </h2>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs font-mono shrink-0">
                <p className="font-bold">PRINTED: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-slate-600">ZONE FILTER: {filters.zone}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold uppercase rounded">
                  PHYSICAL BRIEFING COPY
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-serif italic m-0">
              Official surveillance snapshot summary prepared for regional field veterinary officer consultations across {currentLabInfo.fullName} operational coverage ({currentLabInfo.coverageWoredas} Woredas). Includes active outbreak hot-spots, CFR trends, and woreda zero-reporting compliance status.
            </p>

            {/* Date Range Picker Controls (Interactive on screen, formally formatted for print) */}
            <div className="pt-3 border-t border-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 shrink-0">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span>Snapshot Date Filter:</span>
                </div>

                {/* From Date Input */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-300 px-2 py-1 rounded-lg shadow-xs">
                  <label htmlFor="snapshot-from-date" className="text-slate-500 font-semibold text-[11px] select-none">
                    From:
                  </label>
                  <input
                    id="snapshot-from-date"
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    className="bg-transparent text-xs font-mono font-medium text-slate-900 focus:outline-none cursor-pointer"
                    title="Filter snapshot start date"
                  />
                </div>

                {/* To Date Input */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-300 px-2 py-1 rounded-lg shadow-xs">
                  <label htmlFor="snapshot-to-date" className="text-slate-500 font-semibold text-[11px] select-none">
                    To:
                  </label>
                  <input
                    id="snapshot-to-date"
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    className="bg-transparent text-xs font-mono font-medium text-slate-900 focus:outline-none cursor-pointer"
                    title="Filter snapshot end date"
                  />
                </div>

                {/* Quick Presets (Screen view) */}
                <div className="flex items-center gap-1 print:hidden">
                  <button
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, dateFrom: '', dateTo: '' }))}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                      !filters.dateFrom && !filters.dateTo
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    All Dates
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, dateFrom: '2026-07-01', dateTo: '2026-07-29' }))}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                      filters.dateFrom === '2026-07-01' && filters.dateTo === '2026-07-29'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Jul 2026
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, dateFrom: '2026-01-01', dateTo: '2026-12-31' }))}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                      filters.dateFrom === '2026-01-01' && filters.dateTo === '2026-12-31'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    2026 YTD
                  </button>

                  {(filters.dateFrom || filters.dateTo) && (
                    <button
                      type="button"
                      onClick={() => setFilters(prev => ({ ...prev, dateFrom: '', dateTo: '' }))}
                      title="Reset date range filter"
                      className="p-1 rounded-md bg-white border border-slate-300 text-slate-600 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filtered Data Telemetry Counter */}
              <div className="flex items-center gap-2 font-mono text-[11px] self-end md:self-center">
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-950 font-bold rounded-md border border-emerald-300 shadow-2xs">
                  {filteredRecords.length} records in window
                </span>
                <span className="px-2.5 py-1 bg-slate-200 text-slate-900 font-bold rounded-md">
                  {filteredOutbreaks.length} outbreaks
                </span>
              </div>
            </div>

            {/* Formal Physical Document Audit Line (Visible in physical printouts and PDF) */}
            <div className="hidden print:block pt-2 border-t border-slate-400 font-mono text-[11px] text-slate-900">
              <span className="font-extrabold">FILTERED SNAPSHOT WINDOW: </span>
              <span>{formatDateRangeDisplay(filters.dateFrom, filters.dateTo)}</span>
              <span className="ml-4 font-extrabold">VOLUME: </span>
              <span>{filteredRecords.length} Records ({filteredOutbreaks.length} Active Outbreaks)</span>
            </div>
          </div>
        )}

        
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${selectedLab}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="space-y-6"
          >
            {activeTab === 'Dashboard' && (
              <div className="space-y-6">
                {/* KPI Cards & Zone Reporting Rates (Individual cards stagger from 0.04s to 0.38s) */}
                <div>
                  <KPICards
                    records={filteredRecords}
                    outbreaks={filteredOutbreaks}
                    complianceList={filteredComplianceList}
                    locale={locale}
                  />
                </div>

                {/* WAHO / WOAH MEL Scorecard & Data Quality Panel */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.42, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <MELScorecardPanel
                    locale={locale}
                    records={filteredRecords}
                    outbreaks={filteredOutbreaks}
                    complianceList={filteredComplianceList}
                    onSelectZone={(zone) => setFilters(prev => ({ ...prev, zone }))}
                  />
                </motion.div>

                {/* Reporting Trend Charts & Profile Simulator */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.42, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
                >
                  <TrendCharts
                    locale={locale}
                    records={filteredRecords}
                    darkMode={isPrintFriendlyMode ? false : darkMode}
                    onAddLogArrival={handleAddLogArrival}
                    isSimulatorRunning={isSimulatorRunning}
                    onToggleSimulator={() => setIsSimulatorRunning(prev => !prev)}
                    onOpenYoYModal={() => setIsYoYModalOpen(true)}
                  />
                </motion.div>

                {/* 2-Column Section: Species Donut Chart + CFR Trend Line Chart */}
                <div className={`grid gap-6 ${isPortraitMode ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-2'}`}>
                  <motion.div
                    className="min-w-0"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.42, delay: 0.44, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <SpeciesDonutChart 
                      darkMode={isPrintFriendlyMode ? false : darkMode} 
                      records={filteredRecords}
                      laboratoryId={selectedLab}
                    />
                  </motion.div>

                  <motion.div
                    className="min-w-0"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.42, delay: 0.50, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <CFRTrendChart 
                      darkMode={isPrintFriendlyMode ? false : darkMode} 
                      laboratoryId={selectedLab}
                    />
                  </motion.div>
                </div>
              </div>
            )}

            {activeTab === 'Map' && (
              <div className="space-y-6">
                {/* Interactive Outbreak Map */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05, ease: 'easeOut' }}
                >
                  <OutbreakMap
                    outbreaks={filteredOutbreaks}
                    records={filteredRecords}
                    darkMode={isPrintFriendlyMode ? false : darkMode}
                    selectedZone={filters.zone}
                  />
                </motion.div>
              </div>
            )}

            {activeTab === 'Tables' && (
              <div className="space-y-6">
                {/* Disease Summary & Outbreak Tables */}
                <div className={`grid gap-6 ${isPortraitMode ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-2'}`}>
                  <motion.div
                    className="min-w-0"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05, ease: 'easeOut' }}
                  >
                    <DiseaseSummaryTable locale={locale} summaries={filteredDiseaseSummaries} />
                  </motion.div>

                  <motion.div
                    className="min-w-0"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
                  >
                    <OutbreakTable locale={locale} outbreaks={filteredOutbreaks} />
                  </motion.div>
                </div>

                {/* Field Surveillance Log Table */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
                >
                  <SurveillanceTable locale={locale} records={filteredRecords} />
                </motion.div>

                {/* Woreda Compliance Progress Bars Table (36 Woredas) */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
                >
                  <ComplianceTable locale={locale} complianceList={filteredComplianceList} records={filteredRecords} />
                </motion.div>
              </div>
            )}

            {activeTab === 'VaccineCalendar' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <VaccineCalendarContainer />
              </motion.div>
            )}

            {activeTab === 'FieldToolkit' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <FieldToolkitContainer
                  onOpenFastResource={(diseaseKey) => {
                    setActiveTab('FAST');
                    setFastSubTab('diseases');
                  }}
                  onViewOnMap={(inv) => {
                    if ('disease' in inv && inv.disease) {
                      setFilters(prev => ({ ...prev, disease: inv.disease as any }));
                    }
                    setActiveTab('Map');
                  }}
                  onReportSubmitted={(report, survRecord) => {
                    if (survRecord) {
                      setRecords(prev => [survRecord, ...prev]);
                      saveRecordToFirestore(survRecord);
                    }
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'FAST' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <FastModuleContainer
                  records={filteredRecords}
                  initialSubTab={fastSubTab}
                  onNavigateToMap={(diseaseName) => {
                    if (diseaseName) {
                      setFilters(prev => ({ ...prev, disease: diseaseName as any }));
                    }
                    setActiveTab('Map');
                  }}
                  onNavigateToDashboard={() => setActiveTab('Dashboard')}
                />
              </motion.div>
            )}

            {activeTab === 'AdminConsole' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <AdminConsole
                  records={filteredRecords}
                  complianceList={complianceList}
                  onOpenReportModal={() => setIsAIReportModalOpen(true)}
                  onOpenAdnisArchive={() => setIsAdnisArchiveModalOpen(true)}
                />
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* Footer Banner at the bottom of all dashboards */}
      {!isPrintFriendlyMode && (
        <FooterBanner onOpenExternalResources={() => setIsExternalResourcesOpen(true)} />
      )}
      </div>

      {/* Modals */}
      <NewArrivalModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onAddRecord={handleAddLogArrival}
      />

      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportRecords={handleImportRecords}
        onOpenYoYAnalysis={() => setIsYoYModalOpen(true)}
      />

      <YoYTrendAnalysisModal
        isOpen={isYoYModalOpen}
        onClose={() => setIsYoYModalOpen(false)}
        records={records}
        darkMode={darkMode}
      />

      <AIReportModal
        isOpen={isAIReportModalOpen}
        onClose={() => setIsAIReportModalOpen(false)}
        outbreaks={filteredOutbreaks}
        records={records}
        filteredRecords={filteredRecords}
        filters={filters}
        complianceList={filteredComplianceList}
        onOpenPrintView={(rep) => setPrintableReport(rep)}
        locale={locale}
        isOnline={isOnline}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />

      <GoogleDriveModal
        isOpen={isGoogleDriveOpen}
        onClose={() => setIsGoogleDriveOpen(false)}
        records={records}
        onImportRecords={handleImportRecords}
        onSyncAdnisArchive={handleSyncAdnisArchive}
        onSyncAnnualData={handleSyncAnnualData}
        isSyncingAdnis={isSyncingAdnis}
        isSyncingData={isSyncingData}
      />

      <ExternalResourcesModal
        isOpen={isExternalResourcesOpen}
        onClose={() => setIsExternalResourcesOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <ExportConfirmModal
        isOpen={isExportConfirmModalOpen}
        onClose={() => setIsExportConfirmModalOpen(false)}
        onConfirm={handleConfirmExportAllCSV}
        labName={currentLabInfo.fullName}
        labCode={currentLabInfo.shortCode}
        recordsCount={filteredRecords.length}
        outbreaksCount={filteredOutbreaks.length}
        complianceCount={filteredComplianceList.length}
        diseaseSummariesCount={filteredDiseaseSummaries.length}
        zoneFilter={filters.zone}
        isExporting={isExportingCSV}
      />

      <PersonnelDirectoryModal
        isOpen={isPersonnelModalOpen}
        onClose={() => setIsPersonnelModalOpen(false)}
        personnelList={personnelList}
      />

      <AdnisArchiveModal
        isOpen={isAdnisArchiveModalOpen}
        onClose={() => setIsAdnisArchiveModalOpen(false)}
        metadata={datasetMetadata}
        importBatches={importBatches}
        onTriggerSync={handleSyncAdnisArchive}
        isSyncing={isSyncingAdnis}
      />

      {/* PWA In-App Banner & Installation Guide Modal */}
      <PWAInstallBanner
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        isIOS={isIOS}
        isDismissed={isDismissed}
        onInstall={installPWA}
        onOpenModal={() => setIsPWAInstallModalOpen(true)}
        onDismiss={dismissPWAPrompt}
      />

      <PWAInstallModal
        isOpen={isPWAInstallModalOpen}
        onClose={() => setIsPWAInstallModalOpen(false)}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        isIOS={isIOS}
        onInstall={installPWA}
      />

      {/* Enterprise Interactive Onboarding Tour Components */}
      <TourWelcome
        isOpen={isWelcomeOpen}
        locale={locale}
        voiceEnabled={voiceEnabled}
        dontShowAgain={dontShowAgainWelcome}
        onSelectLocale={setLocale}
        onToggleVoice={handleToggleVoice}
        onToggleDontShowAgain={handleToggleDontShowWelcome}
        onStartTour={handleStartTour}
        onWatchOverview={handleWatchOverview}
        onExploreFreely={handleExploreFreely}
        onClose={handleCloseWelcome}
      />

      <TourOverview
        isOpen={isOverviewOpen}
        locale={locale}
        voiceEnabled={voiceEnabled}
        onSelectLocale={setLocale}
        onToggleVoice={handleToggleVoice}
        onClose={handleCloseOverview}
        onStartTour={handleStartTour}
      />

      <OnboardingTour
        isOpen={isTourOpen}
        onClose={handleCloseTour}
        onFinish={handleCloseTour}
        setActiveTab={setActiveTab}
        onSelectFastSection={handleSelectFastSection}
        isAdmin={Boolean(user)}
      />
    </div>
  );
}
