import React, { useState } from 'react';
import { 
  CloudOff, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Stethoscope, 
  Flame, 
  ShieldCheck,
  Wifi,
  WifiOff,
  Eye
} from 'lucide-react';
import { AdnisReport } from '../../types/adnisReporting';
import { soundEngine } from '../../utils/sound';

interface AdnisPendingSyncListProps {
  pendingReports: AdnisReport[];
  isOnline: boolean;
  onSyncAll: () => Promise<void>;
  onRetrySingle: (report: AdnisReport) => Promise<void>;
  onViewDetails: (report: AdnisReport) => void;
}

export const AdnisPendingSyncList: React.FC<AdnisPendingSyncListProps> = ({
  pendingReports,
  isOnline,
  onSyncAll,
  onRetrySingle,
  onViewDetails
}) => {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const handleSyncAllClick = async () => {
    soundEngine.playClick();
    setIsSyncing(true);
    try {
      await onSyncAll();
      soundEngine.playSuccess();
    } catch (err) {
      console.error('Batch sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSingleRetry = async (report: AdnisReport) => {
    soundEngine.playClick();
    setRetryingId(report.id);
    try {
      await onRetrySingle(report);
      soundEngine.playSuccess();
    } catch (err) {
      console.error('Single sync retry failed:', err);
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <CloudOff className="w-5 h-5 text-amber-500" />
            <span>Pending Synchronization Queue ({pendingReports.length})</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Reports stored safely on device waiting for internet connectivity or server acknowledgment.
          </p>
        </div>

        {pendingReports.length > 0 && (
          <button
            onClick={handleSyncAllClick}
            disabled={isSyncing || !isOnline}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              !isOnline
                ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                : isSyncing
                ? 'bg-slate-400 text-white cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
            }`}
          >
            <RotateCcw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing Queue...' : 'Sync All Pending'}</span>
          </button>
        )}
      </div>

      {/* Network Status Warning */}
      {!isOnline && pendingReports.length > 0 && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-xs font-semibold text-amber-900 dark:text-amber-200 flex items-center space-x-2">
          <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            You are currently offline. All finalized reports are cached securely and will automatically push when internet connection is restored.
          </span>
        </div>
      )}

      {/* Empty State */}
      {pendingReports.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">All Reports Synchronized</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            There are no pending offline reports. All field submissions are up-to-date with Hirna Regional Laboratory cloud database.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingReports.map(report => {
            const isZero = report.report_type === 'ZERO_REPORT';
            const isError = report.report_status === 'SYNC_ERROR';
            const isCurrentRetrying = retryingId === report.id;

            return (
              <div
                key={report.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isError
                    ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                    : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      isZero ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {isZero ? 'Zero Report' : 'Field Report'}
                    </span>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      isError 
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' 
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {isError ? 'Sync Error' : 'Pending Sync'}
                    </span>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {report.report_date}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {isZero ? 'Zero Disease Surveillance' : (report.tentative_diagnosis || 'Field Outbreak')}
                  </h4>

                  <p className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{report.district} Woreda ({report.zone}) • {report.reporting_unit}</span>
                  </p>

                  {isError && report.sync_error_message && (
                    <p className="text-rose-600 dark:text-rose-400 text-[11px] font-mono">
                      Error: {report.sync_error_message}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onViewDetails(report);
                    }}
                    className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                    title="View Report Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleSingleRetry(report)}
                    disabled={isCurrentRetrying || !isOnline}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      !isOnline
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                        : isCurrentRetrying
                        ? 'bg-slate-400 text-white cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isCurrentRetrying ? 'animate-spin' : ''}`} />
                    <span>{isCurrentRetrying ? 'Syncing...' : 'Retry'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
