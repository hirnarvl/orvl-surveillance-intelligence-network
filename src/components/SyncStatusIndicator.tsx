import React, { useState, useEffect, useRef } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  HardDrive, 
  FileText, 
  FlaskConical, 
  ShieldCheck, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  CloudUpload, 
  X,
  Server
} from 'lucide-react';
import { 
  getGranularSyncDetails, 
  syncAllPendingData, 
  GranularSyncDetails, 
  SyncProgressUpdate 
} from '../utils/syncManager';
import { soundEngine } from '../utils/sound';

interface SyncStatusIndicatorProps {
  isOnline?: boolean;
  cachedRecordsCount?: number;
  onSyncComplete?: () => void;
  variant?: 'compact' | 'full' | 'sidebar';
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  isOnline: propIsOnline,
  cachedRecordsCount = 0,
  onSyncComplete,
  variant = 'compact'
}) => {
  const [details, setDetails] = useState<GranularSyncDetails>(getGranularSyncDetails());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgressUpdate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const effectiveIsOnline = propIsOnline !== undefined ? propIsOnline : details.isOnline;

  // Poll for sync changes and listen for events
  useEffect(() => {
    const update = () => {
      setDetails(getGranularSyncDetails());
    };

    update();

    const interval = setInterval(update, 2000);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    window.addEventListener('orvl-sync-updated', update);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      window.removeEventListener('orvl-sync-updated', update);
    };
  }, []);

  // Format last sync timestamp
  const formatLastSync = (ts: number | null): string => {
    if (!ts) return 'Pending first sync';
    const diffSeconds = Math.floor((Date.now() - ts) / 1000);
    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleTriggerSync = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isSyncing) return;

    soundEngine.playClick();
    setIsSyncing(true);
    setSyncFeedback(null);
    setSyncProgress({
      current: 0,
      total: Math.max(details.totalPending, 1),
      percent: 5,
      stepMessage: 'Connecting to Cloud Firestore...'
    });

    try {
      const result = await syncAllPendingData((prog) => {
        setSyncProgress(prog);
      });

      if (result.success) {
        soundEngine.playSuccess();
        setSyncFeedback({
          type: 'success',
          message: `Successfully synchronized ${result.syncedCount} records to Cloud Firestore.`
        });
        if (onSyncComplete) onSyncComplete();
      } else {
        soundEngine.playAlert();
        const errText = result.errors.length > 0 ? result.errors.join('; ') : 'Some records remained in local queue';
        setSyncFeedback({
          type: 'error',
          message: `Notice: ${errText}`
        });
      }
    } catch (err) {
      soundEngine.playAlert();
      setSyncFeedback({
        type: 'error',
        message: `Failed to complete sync: ${String(err)}`
      });
    } finally {
      setIsSyncing(false);
      setDetails(getGranularSyncDetails());
    }
  };

  // Close modal on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Render Granular Details Dialog/Modal
  const renderDetailsModal = () => {
    if (!isModalOpen) return null;

    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
        onClick={() => setIsModalOpen(false)}
      >
        <div 
          className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${
                !effectiveIsOnline 
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' 
                  : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
              }`}>
                {!effectiveIsOnline ? <WifiOff className="w-5 h-5" /> : <Database className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Firestore Synchronization Status
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${
                    !effectiveIsOnline 
                      ? 'bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100' 
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                  }`}>
                    {effectiveIsOnline ? 'Online' : 'Offline'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time synchronization and IndexedDB persistence monitor
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Granular Breakdown Cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 px-1">
              <span>Granular Synchronization Queue</span>
              <span className={`font-mono text-xs px-2 py-0.5 rounded-md ${
                details.totalPending > 0
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 font-bold'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
              }`}>
                {details.totalPending > 0 ? `${details.totalPending} Unsynced Records` : '100% In Sync'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Surveillance Records */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="font-semibold text-[11px]">Surveillance Logs</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                    {details.surveillancePending}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {details.surveillancePending > 0 ? 'Queued' : 'Synced'}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  Collection: current_data
                </span>
              </div>

              {/* ADNIS Outbreak / Zero Reports */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-semibold text-[11px]">ADNIS Reports</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                    {details.adnisPending}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {details.adnisPending > 0 ? 'Unsent' : 'Synced'}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  Collection: adnis_field_reports
                </span>
              </div>

              {/* Field Investigations */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-semibold text-[11px]">Investigations</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                    {details.investigationsPending}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {details.investigationsPending > 0 ? 'Drafts' : 'Synced'}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  Collection: field_investigations
                </span>
              </div>

              {/* Samples & Lab Results */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <FlaskConical className="w-3.5 h-3.5 text-purple-500" />
                  <span className="font-semibold text-[11px]">Samples &amp; Tests</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                    {details.samplesPending}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {details.samplesPending > 0 ? 'Queued' : 'Synced'}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  Collection: samples_and_results
                </span>
              </div>
            </div>
          </div>

          {/* Sync Progress Bar if Active */}
          {isSyncing && syncProgress && (
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-teal-800 dark:text-teal-200">
                <span className="flex items-center gap-1.5 truncate">
                  <RotateCcw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                  <span className="truncate">{syncProgress.stepMessage}</span>
                </span>
                <span className="font-mono text-xs">{syncProgress.percent}%</span>
              </div>
              <div className="w-full bg-teal-200 dark:bg-teal-900/60 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-teal-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${syncProgress.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Feedback message */}
          {syncFeedback && (
            <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              syncFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
            }`}>
              {syncFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="flex-1 leading-snug">{syncFeedback.message}</span>
            </div>
          )}

          {/* System & Persistence Details */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Last Successful Sync:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatLastSync(details.lastSyncTimestamp)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5" />
                Local Cache Persistence:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">
                {cachedRecordsCount || details.totalCachedRecords} records saved
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Server className="w-3.5 h-3.5" />
                Target Firestore Database:
              </span>
              <span className="font-mono text-[10px] text-slate-700 dark:text-slate-300 truncate max-w-[190px]" title="ai-studio-hrvldataanalytic-84b8fec2-2107-46fd-9e7d-cc69019e0bac">
                ai-studio-hrvldataanalytic...
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isSyncing
                  ? 'bg-slate-300 text-slate-600 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
                  : !effectiveIsOnline
                  ? 'bg-amber-600 hover:bg-amber-700 active:scale-95 text-white shadow-amber-600/20'
                  : 'bg-teal-600 hover:bg-teal-700 active:scale-95 text-white shadow-teal-600/20'
              }`}
            >
              <RotateCcw className={`w-3.5 h-3.5 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {isSyncing 
                  ? 'Synchronizing...' 
                  : !effectiveIsOnline 
                  ? 'Queue Flush to Firestore' 
                  : 'Force Sync to Firestore'
                }
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Compact Variant for Mobile Header
  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer ${
            !effectiveIsOnline
              ? details.totalPending > 0
                ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-800 animate-pulse'
                : 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800'
              : details.totalPending > 0
              ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800'
              : 'bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800'
          }`}
          title={`${details.totalPending} unsynced records. Click to inspect synchronization details.`}
          aria-label="Firestore synchronization status"
        >
          {!effectiveIsOnline ? (
            <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          ) : details.totalPending > 0 ? (
            <RotateCcw className={`w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          )}

          <span className="font-extrabold text-[11px] hidden sm:inline">
            {!effectiveIsOnline 
              ? details.totalPending > 0 
                ? `${details.totalPending} Unsynced` 
                : 'Offline' 
              : details.totalPending > 0 
              ? `${details.totalPending} Pending` 
              : 'Synced'}
          </span>

          {details.totalPending > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-rose-600 text-white dark:bg-rose-700">
              {details.totalPending}
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono opacity-80">
              {cachedRecordsCount}
            </span>
          )}
        </button>

        {renderDetailsModal()}
      </>
    );
  }

  // Sidebar Variant for Desktop Navigation Column
  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className={`w-full flex flex-col p-2.5 rounded-xl border transition-all cursor-pointer shadow-xs group ${
          !effectiveIsOnline
            ? details.totalPending > 0
              ? 'bg-rose-50/90 text-rose-950 border-rose-300 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800/80 hover:border-rose-400'
              : 'bg-amber-50/90 text-amber-950 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/80 hover:border-amber-400'
            : details.totalPending > 0
            ? 'bg-amber-50/90 text-amber-950 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/80 hover:border-amber-400'
            : 'bg-teal-50/80 text-teal-950 border-teal-200 dark:bg-teal-950/30 dark:text-teal-200 dark:border-teal-800/80 hover:border-teal-300'
        }`}
        title="Click to view detailed Firestore synchronization breakdown"
      >
        {/* Top line: Status, Network indicator and Badge */}
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-1.5 truncate">
            {!effectiveIsOnline ? (
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            ) : (
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}

            <span className="truncate">
              {!effectiveIsOnline ? 'Offline Storage Mode' : 'Cloud Firestore Online'}
            </span>
          </div>

          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
            details.totalPending > 0
              ? 'bg-rose-600 text-white dark:bg-rose-700 animate-pulse'
              : 'bg-emerald-600/90 text-white dark:bg-emerald-700'
          }`}>
            {details.totalPending > 0 ? `${details.totalPending} Unsynced` : 'All Synced'}
          </span>
        </div>

        {/* Middle Line: Granular Counts */}
        <div className="mt-2 grid grid-cols-3 gap-1 text-[10px] text-center">
          <div className="p-1 rounded bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex flex-col items-center">
            <span className="text-[9px] text-slate-500 dark:text-slate-400">Surv. Logs</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {details.surveillancePending}
            </span>
          </div>
          <div className="p-1 rounded bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex flex-col items-center">
            <span className="text-[9px] text-slate-500 dark:text-slate-400">ADNIS</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {details.adnisPending}
            </span>
          </div>
          <div className="p-1 rounded bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex flex-col items-center">
            <span className="text-[9px] text-slate-500 dark:text-slate-400">Samples</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {details.investigationsPending + details.samplesPending}
            </span>
          </div>
        </div>

        {/* Bottom Line: Cache total and details cue */}
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
          <span className="truncate">
            {cachedRecordsCount || details.totalCachedRecords} records in cache
          </span>
          <span className="font-semibold text-teal-700 dark:text-teal-300 group-hover:underline flex items-center gap-0.5 shrink-0">
            Details &rarr;
          </span>
        </div>
      </div>

      {renderDetailsModal()}
    </>
  );
};
