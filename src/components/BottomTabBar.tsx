import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Plus, 
  Stethoscope, 
  Layers, 
  X, 
  Table, 
  Calendar, 
  FlaskConical, 
  Sparkles, 
  TrendingUp, 
  Globe, 
  User, 
  Compass, 
  Download, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  ChevronRight,
  Database,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveTab, FilterState, ZoneName } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { soundEngine } from '../utils/sound';
import { getGranularSyncDetails } from '../utils/syncManager';

interface BottomTabBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenLogModal: () => void;
  onOpenReportModal: () => void;
  onOpenYoYModal: () => void;
  onOpenProfile?: () => void;
  onStartTour?: () => void;
  onOpenWelcome?: () => void;
  onOpenPWAInstall?: () => void;
  isPWAInstallable?: boolean;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  isOnline?: boolean;
  cachedRecordsCount?: number;
  activeOutbreakCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenLogModal,
  onOpenReportModal,
  onOpenYoYModal,
  onOpenProfile,
  onStartTour,
  onOpenWelcome,
  onOpenPWAInstall,
  isPWAInstallable = false,
  filters,
  setFilters,
  isOnline = true,
  cachedRecordsCount = 0,
  activeOutbreakCount = 0
}) => {
  const { t, locale, setLocale, languageOptions } = useI18n();
  const [isQuickActionSheetOpen, setIsQuickActionSheetOpen] = useState(false);
  const [isMoreHubOpen, setIsMoreHubOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(() => getGranularSyncDetails().totalPending);

  React.useEffect(() => {
    const update = () => setPendingCount(getGranularSyncDetails().totalPending);
    window.addEventListener('orvl-sync-updated', update);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    const interval = setInterval(update, 2500);
    return () => {
      clearInterval(interval);
      window.removeEventListener('orvl-sync-updated', update);
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  const handleTabClick = (tab: ActiveTab) => {
    soundEngine.playClick();
    setActiveTab(tab);
    setIsQuickActionSheetOpen(false);
    setIsMoreHubOpen(false);
  };

  const handleOpenLog = () => {
    soundEngine.playClick();
    setIsQuickActionSheetOpen(false);
    setIsMoreHubOpen(false);
    onOpenLogModal();
  };

  const handleZoneSelect = (zone: 'All' | ZoneName) => {
    soundEngine.playClick();
    setFilters(prev => ({ ...prev, zone, woreda: 'All' }));
  };

  return (
    <>
      {/* =========================================================================
          1. Mobile Bottom Tab Bar (Docked to bottom on screens < lg)
      ========================================================================= */}
      <nav 
        id="mobile-bottom-tab-bar"
        aria-label="Mobile Navigation Bar"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800/90 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-6px_20px_rgba(0,0,0,0.35)] pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 transition-all"
      >
        <div className="grid grid-cols-5 items-center px-1.5 max-w-lg mx-auto relative">
          
          {/* 1. Dashboard Tab */}
          <button
            id="tab-btn-dashboard"
            onClick={() => handleTabClick('Dashboard')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer relative group ${
              activeTab === 'Dashboard'
                ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            aria-label="Overview Dashboard"
          >
            {activeTab === 'Dashboard' && (
              <motion.div
                layoutId="activeBottomTabPill"
                className="absolute inset-0 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl -z-10 border border-emerald-200/60 dark:border-emerald-800/50"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <LayoutDashboard className={`w-5 h-5 mb-0.5 transition-transform ${activeTab === 'Dashboard' ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] tracking-tight truncate max-w-[62px]">
              {t.dashboard}
            </span>
          </button>

          {/* 2. Outbreak Map Tab */}
          <button
            id="tab-btn-map"
            onClick={() => handleTabClick('Map')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer relative group ${
              activeTab === 'Map'
                ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            aria-label="Outbreak GIS Map"
          >
            {activeTab === 'Map' && (
              <motion.div
                layoutId="activeBottomTabPill"
                className="absolute inset-0 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl -z-10 border border-emerald-200/60 dark:border-emerald-800/50"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <div className="relative">
              <MapPin className={`w-5 h-5 mb-0.5 transition-transform ${activeTab === 'Map' ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
              {activeOutbreakCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
              )}
            </div>
            <span className="text-[10px] tracking-tight truncate max-w-[62px]">
              {t.map}
            </span>
          </button>

          {/* 3. Center Raised Quick Log Action Button */}
          <div className="flex flex-col items-center justify-center relative -top-3">
            <button
              id="tab-btn-quick-log"
              onClick={() => {
                soundEngine.playClick();
                setIsQuickActionSheetOpen(prev => !prev);
                setIsMoreHubOpen(false);
              }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/35 border-2 border-white dark:border-slate-900 ring-4 ring-emerald-500/15 active:scale-90 hover:scale-105 transition-all cursor-pointer"
              aria-label="Field Quick Actions and Log New Record"
              title="Field Quick Action Hub"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
            <span className="text-[9px] font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5 tracking-tight">
              + Log
            </span>
          </div>

          {/* 4. Field Toolkit Tab */}
          <button
            id="tab-btn-field-toolkit"
            onClick={() => handleTabClick('FieldToolkit')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer relative group ${
              activeTab === 'FieldToolkit'
                ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            aria-label={t.fieldToolkit || "ORVL Module & Field Tools"}
          >
            {activeTab === 'FieldToolkit' && (
              <motion.div
                layoutId="activeBottomTabPill"
                className="absolute inset-0 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl -z-10 border border-emerald-200/60 dark:border-emerald-800/50"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Stethoscope className={`w-5 h-5 mb-0.5 transition-transform ${activeTab === 'FieldToolkit' ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] tracking-tight truncate max-w-[62px]" title={t.fieldToolkit || "ORVL Module & Field Tools"}>
              {t.fieldToolkit || 'ORVL Module & Field Tools'}
            </span>
          </button>

          {/* 5. More Hub / Menu Tab */}
          <button
            id="tab-btn-more-hub"
            onClick={() => {
              soundEngine.playClick();
              setIsMoreHubOpen(prev => !prev);
              setIsQuickActionSheetOpen(false);
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer relative group ${
              isMoreHubOpen || activeTab === 'FAST' || activeTab === 'Tables' || activeTab === 'VaccineCalendar'
                ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            aria-label="Open More Field Hub"
          >
            {(isMoreHubOpen || (activeTab !== 'Dashboard' && activeTab !== 'Map' && activeTab !== 'FieldToolkit')) && (
              <motion.div
                layoutId="activeBottomTabPill"
                className="absolute inset-0 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl -z-10 border border-emerald-200/60 dark:border-emerald-800/50"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Layers className={`w-5 h-5 mb-0.5 transition-transform ${isMoreHubOpen ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] tracking-tight truncate max-w-[62px]">
              More Hub
            </span>
          </button>

        </div>
      </nav>

      {/* =========================================================================
          2. Field Quick Action Bottom Sheet (Triggered via Center + Button)
      ========================================================================= */}
      <AnimatePresence>
        {isQuickActionSheetOpen && (
          <div 
            id="quick-action-sheet-backdrop"
            className="lg:hidden fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-xs"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                soundEngine.playClick();
                setIsQuickActionSheetOpen(false);
              }
            }}
          >
            <motion.div
              id="quick-action-sheet"
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 overflow-hidden pb-[max(env(safe-area-inset-bottom),1rem)] max-h-[85vh] flex flex-col"
            >
              {/* Drag Handle */}
              <div className="pt-3 pb-1 flex justify-center">
                <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>

              {/* Sheet Header */}
              <div className="px-5 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Field Quick Action Hub
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Rapid data entry & epidemiology tools
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setIsQuickActionSheetOpen(false);
                  }}
                  className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sheet Action Grid */}
              <div className="p-4 space-y-3 overflow-y-auto">
                {/* 1. Primary Action: Log Record */}
                <button
                  id="action-btn-log-case"
                  onClick={handleOpenLog}
                  className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between shadow-md hover:from-emerald-700 hover:to-teal-700 transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <Plus className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <p className="text-xs font-black tracking-wide uppercase text-emerald-100">Primary Field Task</p>
                      <p className="text-sm font-extrabold text-white">Log Surveillance Alert / Outbreak</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-emerald-200 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* 2. Secondary Quick Actions */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {/* AI SitRep Report */}
                  <button
                    id="action-btn-ai-sitrep"
                    onClick={() => {
                      soundEngine.playClick();
                      setIsQuickActionSheetOpen(false);
                      onOpenReportModal();
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">AI Situation Report</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Gemini synthesis</p>
                  </button>

                  {/* Field Investigation / Sample */}
                  <button
                    id="action-btn-field-investigation"
                    onClick={() => {
                      handleTabClick('FieldToolkit');
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-2">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Sample & Diagnostics</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Cold chain tracking</p>
                  </button>

                  {/* FAST Transboundary Diseases */}
                  <button
                    id="action-btn-fast-diseases"
                    onClick={() => {
                      handleTabClick('FAST');
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
                      <FlaskConical className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">FAST Clinical Guide</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">FMD, PPR, LSD, CBPP</p>
                  </button>

                  {/* YoY Comparative Trends */}
                  <button
                    id="action-btn-yoy-analytics"
                    onClick={() => {
                      soundEngine.playClick();
                      setIsQuickActionSheetOpen(false);
                      onOpenYoYModal();
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-2">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">YoY Trends & Analysis</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Multi-year comparison</p>
                  </button>
                </div>

                {/* Storage & Connectivity Status Bar */}
                <div className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                  !isOnline && pendingCount > 0
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-200'
                    : 'bg-slate-100/80 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/70 text-slate-700 dark:text-slate-300'
                }`}>
                  <div className="flex items-center space-x-2">
                    {isOnline ? (
                      <Wifi className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
                    )}
                    <span className="font-semibold">
                      {isOnline 
                        ? (pendingCount > 0 ? `${pendingCount} Records Pending Sync` : 'Cloud Firestore Synced')
                        : (pendingCount > 0 ? `Offline (${pendingCount} Unsynced Records)` : 'Offline Storage Mode Active')
                      }
                    </span>
                  </div>
                  <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                    !isOnline && pendingCount > 0
                      ? 'bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {cachedRecordsCount} cached
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          3. More Hub Drawer (Tabs, Language, Filters, Profile, Tour)
      ========================================================================= */}
      <AnimatePresence>
        {isMoreHubOpen && (
          <div 
            id="more-hub-sheet-backdrop"
            className="lg:hidden fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-xs"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                soundEngine.playClick();
                setIsMoreHubOpen(false);
              }
            }}
          >
            <motion.div
              id="more-hub-sheet"
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 overflow-hidden pb-[max(env(safe-area-inset-bottom),1rem)] max-h-[88vh] flex flex-col"
            >
              {/* Drag Handle */}
              <div className="pt-3 pb-1 flex justify-center">
                <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>

              {/* Header */}
              <div className="px-5 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    ORVL Module & Field Tools
                  </h3>
                </div>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setIsMoreHubOpen(false);
                  }}
                  className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-4 overflow-y-auto">
                {/* 1. Zone Filter Quick Bar */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Active Zone Filter
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleZoneSelect('All')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        filters.zone === 'All'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      All Zones (36)
                    </button>
                    <button
                      onClick={() => handleZoneSelect('E/H')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        filters.zone === 'E/H'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      East Hararghe (21)
                    </button>
                    <button
                      onClick={() => handleZoneSelect('W/H')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        filters.zone === 'W/H'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      West Hararghe (15)
                    </button>
                  </div>
                </div>

                {/* 2. All Application Views */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Application Modules & Views
                  </p>
                  <div className="space-y-1">
                    {/* FAST & One Health */}
                    <button
                      onClick={() => handleTabClick('FAST')}
                      className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'FAST'
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <FlaskConical className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>FAST & One Health Knowledge Hub</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    </button>

                    {/* Surveillance & Compliance Tables */}
                    <button
                      onClick={() => handleTabClick('Tables')}
                      className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'Tables'
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Table className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>Surveillance & Compliance Tables</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    </button>

                    {/* Vaccine Calendar */}
                    <button
                      onClick={() => handleTabClick('VaccineCalendar')}
                      className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'VaccineCalendar'
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>Vaccine Calendar & Outbreak Timeline</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    </button>
                  </div>
                </div>

                {/* 3. Guides */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Guides
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {onStartTour && (
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          setIsMoreHubOpen(false);
                          onStartTour();
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                      >
                        <Compass className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mb-1" />
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Guided Tour</p>
                        <p className="text-[10px] text-slate-400">Interactive walkthrough</p>
                      </button>
                    )}
                  </div>
                </div>

                {/* 4. Language Selector */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Language / Afaan / ቋንቋ
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {languageOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          soundEngine.playClick();
                          setLocale(opt.id);
                        }}
                        className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                          locale === opt.id
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>{opt.flag}</span>
                        <span className="truncate">{opt.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. PWA Install Prompt if available */}
                {isPWAInstallable && onOpenPWAInstall && (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setIsMoreHubOpen(false);
                      onOpenPWAInstall();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs font-extrabold flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install HRVL App on Home Screen (Offline)</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
