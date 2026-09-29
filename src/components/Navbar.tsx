import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlusCircle, 
  FileSpreadsheet, 
  Download, 
  FileText, 
  Moon, 
  Sun, 
  Play, 
  Filter, 
  Building2, 
  Printer, 
  Volume2, 
  VolumeX, 
  TrendingUp, 
  Wifi, 
  WifiOff, 
  Database, 
  RotateCcw, 
  Smartphone, 
  Maximize2, 
  Calendar, 
  HelpCircle, 
  Globe, 
  HardDrive, 
  UserCircle, 
  LogOut, 
  LayoutDashboard, 
  MapPin, 
  Table, 
  Menu, 
  X, 
  Sparkles, 
  ChevronRight,
  FlaskConical,
  BookOpen,
  ClipboardCheck,
  TestTube2,
  HeartHandshake,
  GraduationCap,
  Stethoscope,
  CheckCircle2,
  Compass,
  User,
  Users,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { 
  FilterState, 
  Locale,
  ActiveTab
} from '../types';
import { soundEngine } from '../utils/sound';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { LANGUAGE_OPTIONS } from '../utils/translations';
import { ZoneFilterBottomSheet } from './ZoneFilterBottomSheet';
import { BottomTabBar } from './BottomTabBar';
import { LaboratorySelector } from './LaboratorySelector';
import { useLaboratory } from '../contexts/LaboratoryContext';
import { getPendingSyncCount, syncOfflineDrafts } from '../utils/fieldToolkitStorage';
import { flushCachedRecordsToFirestore } from '../utils/firebaseStorage';
import { SyncStatusIndicator } from './SyncStatusIndicator';

interface NavbarProps {
  locale?: Locale;
  setLocale?: (loc: Locale) => void;
  activeTab?: ActiveTab;
  setActiveTab?: (tab: ActiveTab) => void;
  fastSubTab?: string;
  onSelectFastSection?: (section: 'diseases' | 'resources' | 'field-tools' | 'laboratory' | 'one-health' | 'training') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onOpenLogModal: () => void;
  onOpenImportModal: () => void;
  onOpenYoYModal: () => void;
  onOpenReportModal: () => void;
  onOpenPersonnelDirectory?: () => void;
  onOpenAdnisArchive?: () => void;
  onOpenAuthModal: () => void;
  onOpenSupportModal?: () => void;
  onOpenExternalResources?: () => void;
  onOpenGoogleDrive?: () => void;
  onSyncAnnualData?: () => void;
  isSyncingData?: boolean;
  onForceSync?: () => Promise<void> | void;
  onExportAllCSV: () => void;
  onTogglePrintMode: () => void;
  isPrintFriendlyMode: boolean;
  isOnline?: boolean;
  cachedRecordsCount?: number;
  activeOutbreakCount?: number;
  onResetCache?: () => void;
  dataMinDate?: string;
  dataMaxDate?: string;
  onToggleSimulator?: () => void;
  isSimulatorRunning?: boolean;
  isPortraitMode?: boolean;
  onTogglePortraitMode?: () => void;
  isPWAInstallable?: boolean;
  isPWAInstalled?: boolean;
  isIOS?: boolean;
  onOpenPWAInstall?: () => void;
  onOpenProfile?: () => void;
  onOpenWelcome?: () => void;
  onStartTour?: () => void;
  onWatchOverview?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  locale,
  setLocale,
  darkMode,
  setDarkMode,
  filters,
  setFilters,
  onOpenLogModal,
  onOpenImportModal,
  onOpenYoYModal,
  onOpenReportModal,
  onOpenPersonnelDirectory,
  onOpenAdnisArchive,
  onExportAllCSV,
  onTogglePrintMode,
  isPrintFriendlyMode,
  isOnline = true,
  cachedRecordsCount = 0,
  activeOutbreakCount = 0,
  onResetCache,
  dataMinDate,
  dataMaxDate,
  onOpenAuthModal,
  onOpenSupportModal,
  onOpenExternalResources,
  onOpenGoogleDrive,
  onSyncAnnualData,
  isSyncingData,
  onForceSync,
  activeTab = 'Dashboard',
  setActiveTab,
  fastSubTab = 'diseases',
  onSelectFastSection,
  isPWAInstallable = false,
  isPWAInstalled = false,
  isIOS = false,
  onOpenPWAInstall,
  onOpenProfile,
  onOpenWelcome,
  onStartTour,
  onWatchOverview
}) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundEngine.enabled);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isZoneSheetOpen, setIsZoneSheetOpen] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isForceSyncing, setIsForceSyncing] = useState<boolean>(false);

  const { locale: ctxLocale, setLocale: ctxSetLocale, t: ctxT } = useI18n();

  useEffect(() => {
    // Initial check
    setPendingSyncCount(getPendingSyncCount());

    // Setup an interval to poll for changes in local storage
    const interval = setInterval(() => {
      setPendingSyncCount(getPendingSyncCount());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleForceSync = async () => {
    soundEngine.playClick();
    setIsForceSyncing(true);
    try {
      if (onForceSync) {
        await onForceSync();
      } else {
        const result = await flushCachedRecordsToFirestore();
        if (result.success) {
          soundEngine.playSuccess();
          alert(`Successfully flushed ${result.count} cached records to Cloud Firestore.`);
        } else {
          alert(`Notice: ${result.error || 'Cached records queued in Firestore offline persistence.'}`);
        }
      }

      // Also flush pending field drafts if any exist
      if (pendingSyncCount > 0) {
        await syncOfflineDrafts();
        setPendingSyncCount(getPendingSyncCount());
      }
    } catch (e) {
      alert("Error flushing records to Firestore: " + String(e));
    } finally {
      setIsForceSyncing(false);
      setPendingSyncCount(getPendingSyncCount());
    }
  };

  const activeLocale = locale || ctxLocale;
  const t = ctxT;

  const handleLocaleChange = (newLoc: Locale) => {
    if (setLocale) {
      setLocale(newLoc);
    } else {
      ctxSetLocale(newLoc);
    }
  };

  const { user, logout, userProfile, isAdmin } = useAuth();
  const { selectedLab, currentLabInfo } = useLaboratory();

  const availableZones: { id: string; label: string }[] = useMemo(() => {
    if (selectedLab === 'hrvl') {
      return [
        { id: 'All', label: t.allZones },
        { id: 'E/H', label: t.eastHararghe },
        { id: 'W/H', label: t.westHararghe }
      ];
    }
    if (selectedLab === 'arvl') {
      return [
        { id: 'All', label: t.allZones },
        { id: 'Arsi', label: 'Arsi Zone (25 Woredas)' },
        { id: 'West Arsi', label: 'West Arsi Zone' },
        { id: 'Bale', label: 'Bale Zone' },
        { id: 'East Bale', label: 'East Bale Zone' },
        { id: 'East Shewa', label: 'East Shewa Zone' },
        { id: 'North Shewa', label: 'North Shewa Zone' },
        { id: 'Sheger City', label: 'Sheger City Admin' },
        { id: 'Adama City', label: 'Adama City Admin' },
        { id: 'Shashamane City', label: 'Shashamane City Admin' },
        { id: 'Bishoftu City', label: 'Bishoftu City Admin' }
      ];
    }
    // 'all' Mode
    return [
      { id: 'All', label: 'All Operational Zones' },
      { id: 'E/H', label: t.eastHararghe },
      { id: 'W/H', label: t.westHararghe },
      { id: 'Arsi', label: 'Arsi Zone' },
      { id: 'West Arsi', label: 'West Arsi Zone' },
      { id: 'Bale', label: 'Bale Zone' },
      { id: 'East Bale', label: 'East Bale Zone' },
      { id: 'East Shewa', label: 'East Shewa Zone' },
      { id: 'North Shewa', label: 'North Shewa Zone' },
      { id: 'Sheger City', label: 'Sheger City Admin' },
      { id: 'Adama City', label: 'Adama City Admin' },
      { id: 'Shashamane City', label: 'Shashamane City Admin' },
      { id: 'Bishoftu City', label: 'Bishoftu City Admin' }
    ];
  }, [selectedLab, t]);

  // Auto-reset zone filter if current filter is not valid in selected lab
  useEffect(() => {
    if (filters.zone !== 'All') {
      const exists = availableZones.some(z => z.id === filters.zone);
      if (!exists) {
        setFilters(prev => ({ ...prev, zone: 'All' }));
      }
    }
  }, [selectedLab, availableZones, filters.zone, setFilters]);

  const currentZoneLabel = useMemo(() => {
    const found = availableZones.find(z => z.id === filters.zone);
    return found ? found.label : filters.zone;
  }, [availableZones, filters.zone]);

  const toggleSound = () => {
    const next = !soundEnabled;
    soundEngine.enabled = next;
    setSoundEnabled(next);
    if (next) soundEngine.playBlip();
  };

  const baseNavItems = [
    { id: 'Dashboard' as ActiveTab, label: t.dashboard, icon: LayoutDashboard, dataTour: 'nav-dashboard' },
    { id: 'Map' as ActiveTab, label: t.map, icon: MapPin, dataTour: 'nav-gis' },
    { id: 'Tables' as ActiveTab, label: t.tables, icon: Table, dataTour: 'nav-disease-surveillance' },
    { id: 'VaccineCalendar' as ActiveTab, label: t.vaccineCalendar, icon: Calendar, dataTour: 'nav-vaccine-calendar' },
    { id: 'FieldToolkit' as ActiveTab, label: t.fieldToolkit || 'ORVL Module & Field Tools', icon: Stethoscope, dataTour: 'nav-toolbox' },
    { id: 'FAST' as ActiveTab, label: t.fastToolbox || 'FAST & One Health', icon: FlaskConical, dataTour: 'nav-fast' },
    { id: 'AdminConsole' as ActiveTab, label: isAdmin ? 'Admin Console' : 'Administration', icon: ShieldCheck, dataTour: 'nav-admin' }
  ];

  const navItems = baseNavItems;

  const currentLogoSrc = (currentLabInfo?.logoUrl && currentLabInfo.logoUrl.trim() !== '')
    ? currentLabInfo.logoUrl
    : (selectedLab === 'arvl' ? 'https://lh3.googleusercontent.com/d/1ramCieRBgrY-MWZteIHalwv5vYbIy36R' : '/orvl-emblem.png');
  const currentLogoAlt = `${currentLabInfo?.shortName || 'RVL'} Emblem`;

  return (
    <>
      {/* Mobile Sticky Top Header Bar (visible on small/medium screens) */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 flex items-center justify-center shrink-0">
            {currentLogoSrc ? (
              <img 
                src={currentLogoSrc} 
                alt={currentLogoAlt} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain filter drop-shadow-sm" 
              />
            ) : null}
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight truncate max-w-[170px] sm:max-w-xs">
              {t.title || 'ORVL Surveillance Intelligence Network'}
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[170px] sm:max-w-xs">
              {currentLabInfo?.name ? `${currentLabInfo.name} (${currentLabInfo.shortCode || 'RVL'})` : t.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <LaboratorySelector />

          {/* Granular Firestore Synchronization Status Indicator */}
          <SyncStatusIndicator 
            variant="compact"
            isOnline={isOnline}
            cachedRecordsCount={cachedRecordsCount}
            onSyncComplete={onForceSync}
          />

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Audio Cues' : 'Unmute Audio Cues'}
            aria-label="Toggle sound feedback"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Day / Night Toggle on Mobile */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setDarkMode((prev: boolean) => !prev);
            }}
            title={darkMode ? 'Switch to Day Mode' : 'Switch to Night Mode'}
            aria-label="Toggle theme"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400 fill-amber-400/30" /> : <Moon className="w-4 h-4 text-indigo-600 fill-indigo-600/20" />}
          </button>

          {/* Mobile Sidebar Menu Drawer Toggle */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setIsMobileMenuOpen(prev => !prev);
            }}
            title="Open Full Navigation Drawer"
            aria-label="Open navigation drawer"
            className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Modern High-Craft Bottom-Tab Navigation Bar for Small Screens */}
      <BottomTabBar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (setActiveTab) setActiveTab(tab);
          setIsMobileMenuOpen(false);
        }}
        onOpenLogModal={onOpenLogModal}
        onOpenReportModal={onOpenReportModal}
        onOpenYoYModal={onOpenYoYModal}
        onOpenProfile={onOpenProfile}
        onStartTour={onStartTour}
        onOpenWelcome={onOpenWelcome}
        onOpenPWAInstall={onOpenPWAInstall}
        isPWAInstallable={isPWAInstallable}
        filters={filters}
        setFilters={setFilters}
        isOnline={isOnline}
        cachedRecordsCount={cachedRecordsCount}
        activeOutbreakCount={activeOutbreakCount}
      />

      {/* Backdrop overlay for Mobile Drawer */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Left Vertical Navigation Sidebar Panel */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 lg:z-30
        w-72 lg:w-64 xl:w-72 2xl:w-80 h-screen lg:h-[100dvh]
        bg-white dark:bg-slate-900/98 border-r border-slate-200 dark:border-slate-800
        flex flex-col justify-between
        transition-all duration-300 ease-in-out
        overflow-y-auto custom-scrollbar shadow-xl lg:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header & Brand */}
        <div data-tour="nav-vision" className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center space-x-3">
            {/* 3D Logo Emblem */}
            <div className="h-12 w-12 flex items-center justify-center shrink-0">
              {currentLogoSrc ? (
                <img 
                  src={currentLogoSrc} 
                  alt={currentLogoAlt} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain filter drop-shadow-sm" 
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {t.title || 'ORVL Surveillance Intelligence Network'}
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full border bg-teal-50 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-300 dark:border-teal-800">
                  {t.badge || 'ORVL Intelligence Network'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1 mt-1 truncate">
                <Building2 className="w-3.5 h-3.5 shrink-0 text-teal-600 dark:text-teal-400" />
                <span className="truncate">
                  {currentLabInfo?.name ? `${currentLabInfo.name} (${currentLabInfo.shortCode || 'RVL'})` : 'Regional Veterinary Laboratory'}
                </span>
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                {t.subtitle || 'Oromia Regional Veterinary Laboratory Surveillance Intelligence Network'}
              </p>
            </div>
          </div>

          {/* Laboratory Tenant Selector (Multi-RVL Architecture) */}
          <div className="w-full pt-1">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Active RVL Tenant
              </span>
            </div>
            <LaboratorySelector isFullWidth />
          </div>

          {/* Granular Firestore Synchronization Status Indicator */}
          <div className="w-full">
            <SyncStatusIndicator 
              variant="sidebar"
              isOnline={isOnline}
              cachedRecordsCount={cachedRecordsCount}
              onSyncComplete={onForceSync}
            />
          </div>

          {/* Imported Data Date Range */}
          {dataMinDate && dataMaxDate && (
            <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/60 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">{t.importedDataRange} {dataMinDate} to {dataMaxDate}</span>
            </div>
          )}
        </div>

        {/* Scrollable Navigation Body */}
        <div className="p-4 space-y-6 flex-1">
          {/* Main Navigation Section */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Navigation Menu
            </p>

            {setActiveTab && navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  data-tour={item.dataTour}
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer
                    ${isActive 
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-1 ring-emerald-500' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'translate-x-0.5 text-white' : 'opacity-40'}`} />
                </button>
              );
            })}
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenLogModal();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 flex items-center justify-center space-x-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-md transition-all cursor-pointer border border-emerald-500"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.logArrival}</span>
            </button>
          </div>

          {/* Knowledge & Response (FAST Modules) */}
          <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="px-3 flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Knowledge & Response
              </p>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                FAST
              </span>
            </div>

            {[
              { id: 'diseases', label: t.fastDiseases || 'FAST Diseases', icon: FlaskConical, dataTour: 'nav-fast-diseases' },
              { id: 'resources', label: t.resourceLibrary || 'Resource Library', icon: BookOpen, dataTour: 'nav-fast-resources' },
              { id: 'field-tools', label: t.fieldInvestigation || 'Field Investigation', icon: ClipboardCheck, dataTour: 'nav-fast-field-tools' },
              { id: 'laboratory', label: t.labDiagnostics || 'Laboratory Diagnostics', icon: TestTube2, dataTour: 'nav-laboratory' },
              { id: 'one-health', label: t.oneHealth || 'One Health', icon: HeartHandshake, dataTour: 'nav-fast-one-health' },
              { id: 'training', label: t.trainingHub || 'Training Hub', icon: GraduationCap, dataTour: 'nav-learning' },
            ].map(sub => {
              const Icon = sub.icon;
              const isSelected = activeTab === 'FAST' && fastSubTab === sub.id;
              return (
                <button
                  key={sub.id}
                  data-tour={sub.dataTour}
                  onClick={() => {
                    soundEngine.playClick();
                    if (setActiveTab) setActiveTab('FAST');
                    if (onSelectFastSection) onSelectFastSection(sub.id as any);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-all duration-150 cursor-pointer
                    ${isSelected 
                      ? 'bg-teal-600 text-white font-bold shadow-xs' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-700 dark:hover:text-teal-300 font-medium'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-teal-600 dark:text-teal-400'}`} />
                    <span className="truncate">{sub.label}</span>
                  </div>
                  <ChevronRight className={`w-3 h-3 ${isSelected ? 'text-white' : 'opacity-40'}`} />
                </button>
              );
            })}
          </div>

          {/* Quick Zone Filter */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Zone Filter
              </p>
              <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
                {availableZones.length - 1} zones
              </span>
            </div>
            {/* Desktop / Tablet Select */}
            <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl p-2 border border-slate-200 dark:border-slate-700">
              <Filter className="w-4 h-4 text-slate-400 ml-1 mr-2 shrink-0" />
              <select
                aria-label="Filter by Zone"
                value={filters.zone}
                onChange={(e) => {
                  soundEngine.playClick();
                  setFilters(prev => ({ ...prev, zone: e.target.value as any }));
                }}
                className="w-full bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                {availableZones.map(zone => (
                  <option key={zone.id} value={zone.id} className="dark:bg-slate-900">
                    {zone.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Mobile Bottom Sheet Trigger */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsZoneSheetOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="lg:hidden w-full flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Filter className="w-4 h-4 text-slate-400 ml-1 mr-2 shrink-0" />
              <div className="w-full text-left flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-200">
                <span className="truncate">{currentZoneLabel}</span>
                <ChevronRight className="w-4 h-4 opacity-50 shrink-0 ml-1" />
              </div>
            </button>
          </div>

          {/* Tools & Analytics Quick Actions */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <p className="px-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Tools & Analytics
            </p>
            
            <div className="grid grid-cols-1 gap-1.5">
              {/* Import Data */}
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onOpenImportModal();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 flex items-center space-x-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">Import Data</span>
              </button>

              {/* YoY Analysis */}
              <button
                data-tour="nav-analytics"
                onClick={() => {
                  soundEngine.playClick();
                  onOpenYoYModal();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 flex items-center space-x-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer"
              >
                <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="truncate">{t.yoyAnalysis}</span>
              </button>

              {/* Export Data (Combined) */}
              <div className="relative group">
                <button
                  className="w-full py-2 px-3 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <Download className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="truncate">Export & Backup</span>
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-50 group-hover:rotate-90 transition-transform" />
                </button>
                <div className="hidden group-hover:block pl-8 pr-2 py-1 space-y-1">
                  <button
                    onClick={() => {
                      soundEngine.playSuccess();
                      onExportAllCSV();
                    }}
                    className="w-full py-1.5 px-3 text-left text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Download CSV
                  </button>
                  {onOpenGoogleDrive && (
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        onOpenGoogleDrive();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-1.5 px-3 text-left text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Google Drive Backup
                    </button>
                  )}
                </div>
              </div>

              {/* AI SitRep Report */}
              <button
                data-tour="nav-reports"
                onClick={() => {
                  soundEngine.playClick();
                  onOpenReportModal();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 flex items-center space-x-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="truncate">{t.aiSitrepReport}</span>
              </button>

              {/* ADNIS Historical Archive (Google Drive & Firestore) */}
              {onOpenAdnisArchive && (
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenAdnisArchive();
                    setIsMobileMenuOpen(false);
                  }}
                  title={`View 2-Year Historical ADNIS Surveillance Archive & Ingestion (${currentLabInfo.shortCode})`}
                  className="w-full py-2 px-3 flex items-center space-x-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer"
                >
                  <Database className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="truncate">
                    {selectedLab === 'arvl'
                      ? 'ARVL Historical ADNIS Archive'
                      : selectedLab === 'hrvl'
                      ? 'HRVL Historical ADNIS Archive'
                      : 'Integrated Historical ADNIS Archive'}
                  </span>
                </button>
              )}

              {/* Personnel & Reporter Directory */}
              {onOpenPersonnelDirectory && (
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenPersonnelDirectory();
                    setIsMobileMenuOpen(false);
                  }}
                  title={`View Verified Field Officers & Focal Reporters (${currentLabInfo.coverageWoredas} ${currentLabInfo.shortCode} Woredas)`}
                  className="w-full py-2 px-3 flex items-center space-x-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer"
                >
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{currentLabInfo.shortCode} Personnel & Reporters</span>
                </button>
              )}

              
              {/* Sync Annual Data (2025/2026) */}
              {onSyncAnnualData && (
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onSyncAnnualData();
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={isSyncingData}
                  className="w-full py-2 px-3 flex items-center space-x-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer"
                >
                  <RotateCcw className={`w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ${isSyncingData ? 'animate-spin' : ''}`} />
                  <span className="truncate">{isSyncingData ? 'Syncing...' : `Sync ${currentLabInfo.shortCode} Data (25/26)`}</span>
                </button>
              )}

              {/* Support Template */}
              {onOpenSupportModal && (
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenSupportModal();
                    setIsMobileMenuOpen(false);
                  }}
                  title="View & Copy Support Email Template"
                  className="w-full py-2 px-3 flex items-center space-x-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="truncate">{t.supportTemplate}</span>
                </button>
              )}

              {/* Open Access Portals */}
              {onOpenExternalResources && (
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenExternalResources();
                    setIsMobileMenuOpen(false);
                  }}
                  title="Open Access Portals for Veterinary Research & Epidemiology"
                  className="w-full py-2 px-3 flex items-center space-x-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="truncate">{t.openAccessPortal}</span>
                </button>
              )}

              {/* Field Print Snapshot Toggle */}
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onTogglePrintMode();
                }}
                className={`w-full py-2 px-3 flex items-center space-x-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  isPrintFriendlyMode
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs animate-pulse'
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700/80'
                }`}
              >
                <Printer className={`w-4 h-4 shrink-0 ${isPrintFriendlyMode ? 'text-slate-950' : 'text-amber-600 dark:text-amber-400'}`} />
                <span className="truncate">{isPrintFriendlyMode ? t.exitPrintView : t.fieldPrintSnapshot}</span>
              </button>
            </div>

            {/* Interactive Guided Onboarding Tour & Overview */}
            {(onOpenWelcome || onStartTour || onWatchOverview) && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="px-1 flex items-center justify-between">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Platform Tour & Guide
                  </p>
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                </div>
                {onOpenWelcome && (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onOpenWelcome();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-1.5 px-3 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Welcome & Guide</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-40" />
                  </button>
                )}
                {onStartTour && (
                  <button
                    onClick={() => {
                      soundEngine.playSuccess();
                      onStartTour();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2 px-3 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 rounded-xl border border-emerald-200 dark:border-emerald-800/80 transition-all cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Take Guided Tour</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                )}
                {onWatchOverview && (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onWatchOverview();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-1.5 px-3 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Play className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 fill-current" />
                      <span>Watch Overview</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-40" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer Controls: System & Settings */}
        <div data-tour="nav-administration" className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
          
          <div className="space-y-1.5">
            <p className="px-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              System Settings
            </p>
            
            {/* Install App / PWA Status */}
            {onOpenPWAInstall && (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onOpenPWAInstall();
                  setIsMobileMenuOpen(false);
                }}
                title={isPWAInstalled ? (t.appInstalled || 'App is Installed') : (t.installHRVLDashboard || 'Install ORVL Intelligence Network')}
                className={`w-full py-2.5 px-3 flex items-center justify-between text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  isPWAInstalled
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="truncate">{isPWAInstalled ? t.appInstalled : t.installApp}</span>
                </div>
                {isPWAInstalled && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
              </button>
            )}

            {/* Reset Cache (Moved to Settings) */}
            {onResetCache && (
              <button
                onClick={() => {
                  if (window.confirm('Reset offline cached records and revert to default sample dataset?')) {
                    soundEngine.playClick();
                    onResetCache();
                  }
                }}
                title="Reset offline cache and restore default sample data"
                className="w-full py-2 flex items-center justify-between px-3 text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 rounded-xl border border-rose-200 dark:border-rose-800/40 transition-all cursor-pointer"
              >
                <span className="truncate">{t.resetCache}</span>
                <RotateCcw className="w-4 h-4 shrink-0" />
              </button>
            )}
          </div>
          
          {/* Night / Day Mode Toggle (Prominent) */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setDarkMode((prev: boolean) => !prev);
            }}
            title={darkMode ? 'Switch to Day Mode' : 'Switch to Night Mode'}
            aria-label="Toggle theme"
            className="w-full py-2.5 px-3 flex items-center justify-between text-xs font-bold rounded-xl border transition-all cursor-pointer bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500"
          >
            <div className="flex items-center space-x-2.5">
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400/30" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 fill-indigo-600/20 dark:text-indigo-400" />
              )}
              <span>{darkMode ? t.dayMode : t.nightMode}</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
              {darkMode ? 'Night' : 'Day'}
            </span>
          </button>

          <div className="flex items-center justify-between gap-2">
            {/* Language Selector Dropdown */}
            <div className="flex-1 flex items-center bg-white dark:bg-slate-800 rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-700">
              <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 mr-1.5 shrink-0" />
              <select
                aria-label={t.selectLanguage}
                title={t.selectLanguage}
                value={activeLocale}
                onChange={(e) => {
                  soundEngine.playClick();
                  handleLocaleChange(e.target.value as Locale);
                }}
                className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                {LANGUAGE_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id} className="dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
                    {opt.flag} {opt.nativeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Acoustic Telemetry Sound Switch */}
            <button
              onClick={toggleSound}
              aria-label="Toggle acoustic telemetry sound effects"
              title={soundEnabled ? 'Acoustic Telemetry Audio: ON' : 'Acoustic Telemetry Audio: MUTED'}
              className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                soundEnabled 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-white text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>

          {/* User Auth Section */}
          <div className="pt-1">
            {user ? (
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 min-w-0">
                    {user.photoURL && user.photoURL.trim() !== '' ? (
                      <img 
                        src={user.photoURL} 
                        alt="Profile" 
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600 object-cover shrink-0" 
                      />
                    ) : (
                      <UserCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {userProfile?.fullName || user.displayName || user.email?.split('@')[0]}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {userProfile?.organization || user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      logout();
                    }}
                    title={t.signOut}
                    className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>

                {userProfile && (
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100 dark:border-slate-700/60">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300 truncate">
                      {userProfile.role.replace('admin_', '').replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      userProfile.accountStatus === 'active' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {userProfile.accountStatus.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onOpenAuthModal();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 flex items-center justify-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <UserCircle className="w-4 h-4" />
                <span>{t.signIn}</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      <ZoneFilterBottomSheet
        isOpen={isZoneSheetOpen}
        onClose={() => setIsZoneSheetOpen(false)}
        currentZone={filters.zone}
        availableZones={availableZones}
        onSelectZone={(z) => {
          soundEngine.playClick();
          setFilters(prev => ({ ...prev, zone: z as any }));
        }}
      />
    </>
  );
};


