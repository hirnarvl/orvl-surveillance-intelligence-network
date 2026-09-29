import React, { useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  Layers, 
  Info,
  Calendar,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEngine } from '../utils/sound';

interface ExportConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  labName: string;
  labCode: string;
  recordsCount: number;
  outbreaksCount: number;
  complianceCount: number;
  diseaseSummariesCount: number;
  zoneFilter?: string;
  isExporting?: boolean;
}

export const ExportConfirmModal: React.FC<ExportConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  labName,
  labCode,
  recordsCount,
  outbreaksCount,
  complianceCount,
  diseaseSummariesCount,
  zoneFilter = 'All',
  isExporting = false
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isExporting) {
        soundEngine.playClick();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isExporting]);

  if (!isOpen) return null;

  const totalRows = recordsCount + outbreaksCount + complianceCount + diseaseSummariesCount;

  const datasets = [
    {
      name: `${labCode}_Surveillance_Records.csv`,
      label: 'Surveillance Records',
      description: 'Primary case records, clinical diagnoses, species, and geolocations',
      count: recordsCount,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
    },
    {
      name: `${labCode}_Outbreaks.csv`,
      label: 'Active Outbreak Investigations',
      description: 'Epidemic clusters, attack rates, index dates, and quarantine statuses',
      count: outbreaksCount,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60'
    },
    {
      name: `${labCode}_Woreda_Compliance.csv`,
      label: 'Woreda Reporting Compliance',
      description: 'Sub-regional submission performance, deadlines, and timeliness grades',
      count: complianceCount,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60'
    },
    {
      name: `${labCode}_Disease_Summary.csv`,
      label: 'Epidemiological Disease Summaries',
      description: 'Aggregated case fatality rates, incidence, and pathogen burden statistics',
      count: diseaseSummariesCount,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60'
    }
  ];

  return (
    <AnimatePresence>
      <div 
        id="export-confirm-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isExporting) {
            soundEngine.playClick();
            onClose();
          }
        }}
      >
        <motion.div
          id="export-confirm-modal-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-dialog-title"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-50/60 via-slate-50 to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-200 dark:border-emerald-800/50">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 id="export-dialog-title" className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Confirm Bulk CSV Export
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Generate and download multi-dataset surveillance CSV bundles
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (!isExporting) {
                  soundEngine.playClick();
                  onClose();
                }
              }}
              disabled={isExporting}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Laboratory & Filter Context Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Target Lab:</span>
                <span className="font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-700/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                  {labName} ({labCode})
                </span>
              </div>
              {zoneFilter !== 'All' && (
                <div className="flex items-center space-x-1.5 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/50">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filtered Zone: <strong>{zoneFilter}</strong></span>
                </div>
              )}
            </div>

            {/* Warning / Prompt notice */}
            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">
                  You are about to initiate 4 simultaneous CSV file downloads.
                </p>
                <p className="text-amber-700 dark:text-amber-300">
                  To prevent accidental large exports or bandwidth spikes, please verify the record counts below before proceeding.
                </p>
              </div>
            </div>

            {/* Datasets Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
                <span>Included Datasets ({datasets.length})</span>
                <span>Total: {totalRows.toLocaleString()} rows</span>
              </div>

              <div className="space-y-2">
                {datasets.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${item.bgColor} transition-all`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className={`w-4 h-4 ${item.color} shrink-0`} />
                        <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                          {item.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate pl-6">
                        {item.name}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-800/90 text-slate-900 dark:text-white border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
                        {item.count.toLocaleString()} rows
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Browser permission tip */}
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 dark:text-slate-500 px-1 pt-1">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Browser may prompt you to allow multiple file downloads. Select "Allow" if requested.</span>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              disabled={isExporting}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playSuccess();
                onConfirm();
              }}
              disabled={isExporting || totalRows === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl transition-all shadow-md hover:shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>
                {isExporting ? 'Exporting Files...' : `Confirm & Export ${datasets.length} CSV Files`}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
