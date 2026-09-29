import React, { useState, useEffect, useMemo } from 'react';
import { 
  Stethoscope, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  TestTube2, 
  FlaskConical, 
  HeartHandshake, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Activity, 
  ShieldAlert, 
  ChevronRight, 
  Download, 
  Printer, 
  RotateCcw,
  HardDrive,
  FileEdit,
  CloudOff,
  FileSpreadsheet,
  BarChart3,
  Wifi,
  WifiOff,
  Flame,
  ShieldCheck,
  Eye,
  Layers
} from 'lucide-react';
import { 
  AdnisReport, 
  AdnisReportType 
} from '../../types/adnisReporting';
import { 
  loadCachedAdnisReports, 
  saveAdnisDraft, 
  deleteAdnisDraft, 
  finalizeAndSubmitAdnisReport, 
  syncAllPendingAdnisReports,
  syncSingleAdnisReportToFirestore,
  downloadNationalAdnisExport
} from '../../services/adnisReportingService';
import { AdnisFieldReportWizard } from './AdnisFieldReportWizard';
import { AdnisZeroReportWizard } from './AdnisZeroReportWizard';
import { AdnisDraftsList } from './AdnisDraftsList';
import { AdnisPendingSyncList } from './AdnisPendingSyncList';
import { AdnisSubmittedHistory } from './AdnisSubmittedHistory';
import { AdnisCompletenessView } from './AdnisCompletenessView';
import { AdnisReportDetailModal } from './AdnisReportDetailModal';

// Existing diagnostic modules preserved seamlessly
import { FieldInvestigation, SampleRecord, LabResultRecord } from '../../types/fieldToolkit';
import { 
  loadFieldInvestigations, 
  saveFieldInvestigations 
} from '../../utils/fieldToolkitStorage';
import { FieldInvestigationForm } from './FieldInvestigationForm';
import { FieldInvestigationDetailModal } from './FieldInvestigationDetailModal';
import { SampleCollectionManager } from './SampleCollectionManager';
import { LabResultManager } from './LabResultManager';
import { OneHealthPanel } from './OneHealthPanel';

import { useAuth } from '../../contexts/AuthContext';
import { useLaboratory } from '../../contexts/LaboratoryContext';
import { SurveillanceRecord, ZoneName } from '../../types';
import { soundEngine } from '../../utils/sound';

type AdnisWorkspaceTab = 
  | 'overview' 
  | 'new_field' 
  | 'new_zero' 
  | 'drafts' 
  | 'pending_sync' 
  | 'submitted' 
  | 'completeness' 
  | 'diagnostics_hub';

interface FieldToolkitContainerProps {
  onOpenFastResource?: (diseaseKey: string) => void;
  onViewOnMap?: (inv: FieldInvestigation | AdnisReport) => void;
  onReportSubmitted?: (report: AdnisReport, survRecord?: SurveillanceRecord) => void;
}

export const FieldToolkitContainer: React.FC<FieldToolkitContainerProps> = ({
  onOpenFastResource,
  onViewOnMap,
  onReportSubmitted
}) => {
  const { user, userProfile } = useAuth();
  const { currentLabInfo, selectedLab } = useLaboratory();
  
  // Workspace Tab State
  const [workspaceTab, setWorkspaceTab] = useState<AdnisWorkspaceTab>('overview');

  // Network State
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // ADNIS Reports State
  const [adnisReports, setAdnisReports] = useState<AdnisReport[]>([]);
  const [editingDraft, setEditingDraft] = useState<AdnisReport | null>(null);
  const [inspectedReport, setInspectedReport] = useState<AdnisReport | null>(null);

  // Sync state
  const [isGlobalSyncing, setIsGlobalSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Diagnostic sub-modules state (Preserving existing features)
  const [investigations, setInvestigations] = useState<FieldInvestigation[]>([]);
  const [diagSubTab, setDiagSubTab] = useState<'investigations' | 'samples' | 'lab' | 'oneHealth'>('investigations');
  const [isDiagFormOpen, setIsDiagFormOpen] = useState<boolean>(false);
  const [selectedDiagInvestigation, setSelectedDiagInvestigation] = useState<FieldInvestigation | null>(null);

  // Listen to network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync pending reports when coming back online
      syncAllPendingAdnisReports().then(res => {
        if (res.syncedCount > 0) {
          setAdnisReports(loadCachedAdnisReports());
          setSyncFeedback(`Auto-synced ${res.syncedCount} queued reports to cloud.`);
          setTimeout(() => setSyncFeedback(null), 4000);
        }
      });
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load cached reports & investigations on mount
  useEffect(() => {
    const loadedAdnis = loadCachedAdnisReports();
    setAdnisReports(loadedAdnis);

    const loadedInvs = loadFieldInvestigations();
    setInvestigations(loadedInvs);
  }, []);

  // Computed counts
  const draftsCount = useMemo(() => {
    return adnisReports.filter(r => r.report_status === 'DRAFT').length;
  }, [adnisReports]);

  const pendingSyncCount = useMemo(() => {
    return adnisReports.filter(r => r.report_status === 'SYNC_PENDING' || r.report_status === 'SYNC_ERROR').length;
  }, [adnisReports]);

  const submittedCount = useMemo(() => {
    return adnisReports.filter(r => r.report_status === 'SUBMITTED' || r.report_status === 'SYNCED').length;
  }, [adnisReports]);

  // Draft operations
  const handleSaveDraft = (draft: AdnisReport) => {
    const updated = saveAdnisDraft(draft);
    setAdnisReports(loadCachedAdnisReports());
    setWorkspaceTab('drafts');
  };

  const handleDeleteDraft = (draftId: string) => {
    deleteAdnisDraft(draftId);
    setAdnisReports(loadCachedAdnisReports());
  };

  const handleResumeDraft = (draft: AdnisReport) => {
    setEditingDraft(draft);
    if (draft.report_type === 'ZERO_REPORT') {
      setWorkspaceTab('new_zero');
    } else {
      setWorkspaceTab('new_field');
    }
  };

  // Finalize & submit operation
  const handleFinalizeReport = async (report: AdnisReport) => {
    const result = await finalizeAndSubmitAdnisReport(report, isOnline);
    const reloaded = loadCachedAdnisReports();
    setAdnisReports(reloaded);
    setEditingDraft(null);

    // Notify parent App.tsx if hook provided
    if (onReportSubmitted) {
      onReportSubmitted(result.report, result.surveillanceRecord);
    }

    setWorkspaceTab('submitted');
    setSyncFeedback(
      result.synced 
        ? 'Report finalized and synchronized to Hirna Regional Lab cloud database.' 
        : 'Report finalized and stored securely on device. Queued for background synchronization.'
    );
    setTimeout(() => setSyncFeedback(null), 5000);
  };

  // Sync actions
  const handleTriggerSyncAll = async () => {
    setIsGlobalSyncing(true);
    try {
      const res = await syncAllPendingAdnisReports();
      setAdnisReports(loadCachedAdnisReports());
      if (res.syncedCount > 0) {
        setSyncFeedback(`Successfully synchronized ${res.syncedCount} reports.`);
      } else if (res.failedCount > 0) {
        setSyncFeedback(`Sync failed for ${res.failedCount} reports. Check logs.`);
      }
      setTimeout(() => setSyncFeedback(null), 4000);
    } finally {
      setIsGlobalSyncing(false);
    }
  };

  const handleSingleRetry = async (rep: AdnisReport) => {
    await syncSingleAdnisReportToFirestore(rep);
    setAdnisReports(loadCachedAdnisReports());
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Operational Surveillance Workspace */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-5 sm:p-6 rounded-3xl border border-emerald-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[11px] font-mono font-black uppercase tracking-wider border border-emerald-400/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>National ADNIS Surveillance Protocol</span>
            </span>

            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold flex items-center gap-1 ${
              isOnline ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-700/50' : 'bg-amber-900/60 text-amber-200 border border-amber-700/50'
            }`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isOnline ? 'Online (Real-time Sync)' : 'Offline Mode (Local Storage)'}</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
            {currentLabInfo.fullName} — Native Surveillance Log
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Official field epidemiology and zero-reporting workspace for {selectedLab === 'arvl' ? 'Arsi, West Arsi, Bale, Shewa & Urban Units (122 woredas)' : selectedLab === 'hrvl' ? 'East & West Hararghe (36 woredas)' : 'National Integrated Laboratory Network (158 units)'}. Offline-first capture, automated GPS validation, and seamless cloud synchronization.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-start md:justify-end">
          <button
            onClick={() => {
              soundEngine.playClick();
              setEditingDraft(null);
              setWorkspaceTab('new_field');
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-600/30 cursor-pointer flex items-center gap-2"
          >
            <Flame className="w-4 h-4" />
            <span>+ Field Report</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setEditingDraft(null);
              setWorkspaceTab('new_zero');
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-blue-600/30 cursor-pointer flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>+ Zero Report</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              downloadNationalAdnisExport(adnisReports);
            }}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition-all cursor-pointer"
            title="Download National Excel Export"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sync Feedback Toast Notification */}
      {syncFeedback && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
          <button
            onClick={() => setSyncFeedback(null)}
            className="text-emerald-700 dark:text-emerald-300 hover:opacity-80 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Primary Workspace Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'overview' as AdnisWorkspaceTab, label: 'Overview & Status', icon: BarChart3 },
          { id: 'new_field' as AdnisWorkspaceTab, label: 'New Field Report', icon: Flame, badge: 'Outbreak' },
          { id: 'new_zero' as AdnisWorkspaceTab, label: 'New Zero Report', icon: ShieldCheck, badge: 'Zero' },
          { id: 'drafts' as AdnisWorkspaceTab, label: 'My Drafts', icon: FileEdit, count: draftsCount },
          { id: 'pending_sync' as AdnisWorkspaceTab, label: 'Pending Sync', icon: CloudOff, count: pendingSyncCount, alert: pendingSyncCount > 0 },
          { id: 'submitted' as AdnisWorkspaceTab, label: 'Submitted Reports', icon: FileSpreadsheet, count: submittedCount },
          { id: 'completeness' as AdnisWorkspaceTab, label: 'Reporting Completeness', icon: Activity },
          { id: 'diagnostics_hub' as AdnisWorkspaceTab, label: 'Lab & Diagnostics Toolkit', icon: FlaskConical }
        ].map(tab => {
          const isActive = workspaceTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundEngine.playClick();
                setWorkspaceTab(tab.id);
              }}
              className={`px-3.5 py-2.5 rounded-xl font-black text-xs whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>

              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  tab.alert 
                    ? 'bg-amber-500 text-white' 
                    : isActive 
                    ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {tab.count}
                </span>
              )}

              {tab.badge && !isActive && (
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 uppercase font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Workspace Body Content */}
      <div className="transition-all">
        {/* =========================================================================
            1. OVERVIEW & OPERATIONAL DASHBOARD
        ========================================================================= */}
        {workspaceTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick KPI Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div 
                onClick={() => setWorkspaceTab('drafts')}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 transition-all cursor-pointer shadow-xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">My Drafts</span>
                  <FileEdit className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {draftsCount}
                </p>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Click to resume editing</span>
              </div>

              <div 
                onClick={() => setWorkspaceTab('pending_sync')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs group ${
                  pendingSyncCount > 0 
                    ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800' 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Sync</span>
                  <CloudOff className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {pendingSyncCount}
                </p>
                <span className="text-[11px] text-slate-500 font-medium">
                  {pendingSyncCount > 0 ? 'Queued offline reports' : 'All synced to cloud'}
                </span>
              </div>

              <div 
                onClick={() => setWorkspaceTab('submitted')}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-all cursor-pointer shadow-xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submitted Reports</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {submittedCount}
                </p>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Active in database</span>
              </div>

              <div 
                onClick={() => setWorkspaceTab('completeness')}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-all cursor-pointer shadow-xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hararghe Coverage</span>
                  <Activity className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  36 Woredas
                </p>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">View completeness</span>
              </div>
            </div>

            {/* Quick Action Banners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      Field / Outbreak Investigation Report
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Active disease event with clinical cases, morbidity, mortality, and symptoms.
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Includes GPS capture, livestock species multi-selection, strict 0 ≤ Deaths ≤ Cases ≤ At Risk validation, structured clinical symptoms catalog, and tentative diagnosis.
                </p>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setEditingDraft(null);
                    setWorkspaceTab('new_field');
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Start New Field Report Wizard (9 Steps)
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-blue-600 text-white">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      Zero Report (Surveillance Attestation)
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Certifies active surveillance with zero reportable disease events in period.
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Confirms absence of outbreaks across monitored livestock species. Contributes directly to woreda completeness and timeliness compliance without inflating disease numbers.
                </p>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setEditingDraft(null);
                    setWorkspaceTab('new_zero');
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Start New Zero Report
                </button>
              </div>
            </div>

            {/* Recent Submissions Table */}
            <AdnisSubmittedHistory
              reports={adnisReports}
              onViewReportDetails={(report) => setInspectedReport(report)}
            />
          </div>
        )}

        {/* =========================================================================
            2. NEW FIELD / OUTBREAK REPORT WIZARD
        ========================================================================= */}
        {workspaceTab === 'new_field' && (
          <AdnisFieldReportWizard
            initialReport={editingDraft}
            userProfile={userProfile}
            isOnline={isOnline}
            onSaveDraft={handleSaveDraft}
            onFinalizeSubmit={handleFinalizeReport}
            onCancel={() => setWorkspaceTab('overview')}
          />
        )}

        {/* =========================================================================
            3. NEW ZERO REPORT WIZARD
        ========================================================================= */}
        {workspaceTab === 'new_zero' && (
          <AdnisZeroReportWizard
            initialReport={editingDraft}
            userProfile={userProfile}
            isOnline={isOnline}
            onSaveDraft={handleSaveDraft}
            onFinalizeSubmit={handleFinalizeReport}
            onCancel={() => setWorkspaceTab('overview')}
          />
        )}

        {/* =========================================================================
            4. MY DRAFTS
        ========================================================================= */}
        {workspaceTab === 'drafts' && (
          <AdnisDraftsList
            drafts={adnisReports.filter(r => r.report_status === 'DRAFT')}
            onResumeDraft={handleResumeDraft}
            onDeleteDraft={handleDeleteDraft}
            onNewFieldReport={() => {
              setEditingDraft(null);
              setWorkspaceTab('new_field');
            }}
            onNewZeroReport={() => {
              setEditingDraft(null);
              setWorkspaceTab('new_zero');
            }}
          />
        )}

        {/* =========================================================================
            5. PENDING SYNCHRONIZATION QUEUE
        ========================================================================= */}
        {workspaceTab === 'pending_sync' && (
          <AdnisPendingSyncList
            pendingReports={adnisReports.filter(r => r.report_status === 'SYNC_PENDING' || r.report_status === 'SYNC_ERROR')}
            isOnline={isOnline}
            onSyncAll={handleTriggerSyncAll}
            onRetrySingle={handleSingleRetry}
            onViewDetails={(rep) => setInspectedReport(rep)}
          />
        )}

        {/* =========================================================================
            6. SUBMITTED REPORTS & HISTORY
        ========================================================================= */}
        {workspaceTab === 'submitted' && (
          <AdnisSubmittedHistory
            reports={adnisReports}
            onViewReportDetails={(rep) => setInspectedReport(rep)}
          />
        )}

        {/* =========================================================================
            7. REPORTING COMPLETENESS & ZERO REPORT MONITORING
        ========================================================================= */}
        {workspaceTab === 'completeness' && (
          <AdnisCompletenessView
            reports={adnisReports}
            onStartZeroReportForWoreda={(woredaName, zone) => {
              setEditingDraft({
                id: `adnis-zero-${Date.now()}`,
                client_report_id: `guid-${Date.now()}`,
                device_id: 'dev-client',
                report_type: 'ZERO_REPORT',
                report_status: 'DRAFT',
                reporter_id: user?.uid || '',
                reporter_name: userProfile?.fullName || 'District Focal Person',
                reporter_phone: userProfile?.phone || '',
                reporter_email: userProfile?.email || '',
                reporter_role: userProfile?.role || 'district_focal_person',
                organization: userProfile?.organization || 'District Animal Health Bureau',
                region: 'Oromia',
                zone: zone === 'E/H' ? 'East Hararghe' : 'West Hararghe',
                district: woredaName,
                reporting_unit: `${woredaName} Central Veterinary Post`,
                reporting_period_start: `${new Date().toISOString().substring(0, 7)}-01`,
                reporting_period_end: new Date().toISOString().split('T')[0],
                report_date: new Date().toISOString().split('T')[0],
                species: ['Bovine', 'Ovine', 'Caprine', 'Equine', 'Avian'],
                gps_status: 'GPS_UNAVAILABLE',
                latitude: null,
                longitude: null,
                gps_source: 'none',
                gps_captured_offline: !isOnline,
                at_risk: 0,
                cases: 0,
                deaths: 0,
                symptoms: [],
                comments: `Routine monthly surveillance completed for ${woredaName}. Zero reportable disease outbreaks detected.`,
                created_at: Date.now(),
                updated_at: Date.now()
              });
              setWorkspaceTab('new_zero');
            }}
            onStartFieldReportForWoreda={(woredaName, zone) => {
              setEditingDraft({
                id: `adnis-rep-${Date.now()}`,
                client_report_id: `guid-${Date.now()}`,
                device_id: 'dev-client',
                report_type: 'FIELD_REPORT',
                report_status: 'DRAFT',
                reporter_id: user?.uid || '',
                reporter_name: userProfile?.fullName || 'Field Veterinarian',
                reporter_phone: userProfile?.phone || '',
                reporter_email: userProfile?.email || '',
                reporter_role: userProfile?.role || 'field_veterinarian',
                organization: userProfile?.organization || 'District Veterinary Clinic',
                region: 'Oromia',
                zone: zone === 'E/H' ? 'East Hararghe' : 'West Hararghe',
                district: woredaName,
                reporting_unit: `${woredaName} Outbreak Area`,
                reporting_period_start: `${new Date().toISOString().substring(0, 7)}-01`,
                reporting_period_end: new Date().toISOString().split('T')[0],
                report_date: new Date().toISOString().split('T')[0],
                species: ['Bovine'],
                gps_status: 'GPS_UNAVAILABLE',
                latitude: null,
                longitude: null,
                gps_source: 'none',
                gps_captured_offline: !isOnline,
                at_risk: 100,
                cases: 10,
                deaths: 1,
                symptoms: [],
                created_at: Date.now(),
                updated_at: Date.now()
              });
              setWorkspaceTab('new_field');
            }}
          />
        )}

        {/* =========================================================================
            8. LAB & DIAGNOSTICS TOOLKIT (Preserving existing features)
        ========================================================================= */}
        {workspaceTab === 'diagnostics_hub' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                onClick={() => setDiagSubTab('investigations')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  diagSubTab === 'investigations' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Detailed Investigations ({investigations.length})
              </button>
              <button
                onClick={() => setDiagSubTab('samples')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  diagSubTab === 'samples' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Sample Collections
              </button>
              <button
                onClick={() => setDiagSubTab('lab')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  diagSubTab === 'lab' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Lab Results Manager
              </button>
              <button
                onClick={() => setDiagSubTab('oneHealth')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  diagSubTab === 'oneHealth' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                One Health Panel
              </button>
            </div>

            {diagSubTab === 'investigations' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Active Diagnostic Investigations
                  </h4>
                  <button
                    onClick={() => setIsDiagFormOpen(true)}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    + Detailed Investigation
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {investigations.map(inv => (
                    <div key={inv.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{inv.disease}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700">{inv.status}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{inv.woreda} ({inv.zone}) • {inv.kebele}</p>
                      <button
                        onClick={() => setSelectedDiagInvestigation(inv)}
                        className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                      >
                        View Full Clinical Record →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {diagSubTab === 'samples' && (
              <SampleCollectionManager
                investigations={investigations}
                onSaveSample={(sample) => {
                  const updated = investigations.map(inv => {
                    if (inv.id === sample.investigationId) {
                      return { ...inv, samples: [...(inv.samples || []), sample] };
                    }
                    return inv;
                  });
                  setInvestigations(updated);
                  saveFieldInvestigations(updated);
                }}
              />
            )}

            {diagSubTab === 'lab' && (
              <LabResultManager
                investigations={investigations}
                onSaveLabResult={(res: LabResultRecord) => {
                  const updated = investigations.map(inv => {
                    if (inv.id === res.investigationId) {
                      return { ...inv, labResults: [...(inv.labResults || []), res] };
                    }
                    return inv;
                  });
                  setInvestigations(updated);
                  saveFieldInvestigations(updated);
                }}
              />
            )}

            {diagSubTab === 'oneHealth' && (
              <OneHealthPanel 
                investigations={investigations} 
                onSelectInvestigation={(inv) => setSelectedDiagInvestigation(inv)}
                onOpenNewInvestigation={() => setIsDiagFormOpen(true)}
              />
            )}
          </div>
        )}
      </div>

      {/* Modal: Report Details View */}
      {inspectedReport && (
        <AdnisReportDetailModal
          report={inspectedReport}
          onClose={() => setInspectedReport(null)}
        />
      )}

      {/* Modal: Diagnostic Investigation Detail View */}
      {selectedDiagInvestigation && (
        <FieldInvestigationDetailModal
          investigation={selectedDiagInvestigation}
          onClose={() => setSelectedDiagInvestigation(null)}
          onUpdateInvestigation={(updated) => {
            const updatedList = investigations.map(i => i.id === updated.id ? updated : i);
            setInvestigations(updatedList);
            saveFieldInvestigations(updatedList);
            setSelectedDiagInvestigation(updated);
          }}
          onAddSample={(invId) => {
            setDiagSubTab('samples');
            setSelectedDiagInvestigation(null);
          }}
          onAddLabResult={(invId, sId) => {
            setDiagSubTab('lab');
            setSelectedDiagInvestigation(null);
          }}
          onViewOnMap={(inv) => onViewOnMap?.(inv)}
        />
      )}

      {/* Modal: New Diagnostic Form */}
      {isDiagFormOpen && (
        <FieldInvestigationForm
          existingInvestigations={investigations}
          onOpenFastResource={onOpenFastResource}
          onSave={(inv) => {
            const updated = [inv, ...investigations];
            setInvestigations(updated);
            saveFieldInvestigations(updated);
            setIsDiagFormOpen(false);
          }}
          onClose={() => setIsDiagFormOpen(false)}
        />
      )}
    </div>
  );
};
