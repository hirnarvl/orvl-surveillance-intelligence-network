import React, { useState } from 'react';
import { X, HardDrive, ExternalLink, ShieldCheck, RefreshCw, CheckCircle2, AlertCircle, Database, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useLaboratory } from '../contexts/LaboratoryContext';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  records?: any[];
  onImportRecords?: (records: any[]) => void;
  onSyncAdnisArchive?: () => Promise<void>;
  onSyncAnnualData?: () => Promise<void>;
  isSyncingAdnis?: boolean;
  isSyncingData?: boolean;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({ 
  isOpen, 
  onClose,
  onSyncAdnisArchive,
  onSyncAnnualData,
  isSyncingAdnis = false,
  isSyncingData = false
}) => {
  const { accessToken, connectGoogleDrive, setCustomAccessToken } = useAuth();
  const { currentLabInfo } = useLaboratory();
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualToken, setManualToken] = useState('');

  if (!isOpen) return null;

  const handleAuthorizeDrive = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await connectGoogleDrive();
    } catch (err: any) {
      if (!String(err).includes('popup-closed-by-user')) {
        setAuthError(err?.message || 'Google Drive authorization failed');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleApplyManualToken = () => {
    if (manualToken.trim()) {
      setCustomAccessToken(manualToken.trim());
      setAuthError(null);
      setShowManualInput(false);
      setManualToken('');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <HardDrive className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Google Drive Integration</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">ADNIS centralized archives & annual spreadsheets</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Connection Status Card */}
            <div className={`p-4 rounded-xl border ${
              accessToken 
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' 
                : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3">
                  {accessToken ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className={`text-sm font-semibold ${accessToken ? 'text-emerald-900 dark:text-emerald-200' : 'text-amber-900 dark:text-amber-200'}`}>
                      {accessToken ? 'Google Drive Authorized' : 'Google Drive Authorization Needed'}
                    </h4>
                    <p className={`text-xs mt-0.5 ${accessToken ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
                      {accessToken 
                        ? 'Read permission granted (drive.readonly). ADNIS spreadsheets can be synchronized directly into Cloud Firestore.'
                        : 'To read the ADNIS folders and spreadsheets, authorize access with your Google account.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAuthorizeDrive}
                  disabled={authLoading}
                  className="shrink-0 flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 text-xs font-semibold rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${authLoading ? 'animate-spin' : ''}`} />
                  <span>{accessToken ? 'Re-authorize' : 'Authorize Drive'}</span>
                </button>
              </div>

              {authError && (
                <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg space-y-2">
                  <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                    {authError}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <a
                      href={window.location.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open in New Tab
                    </a>
                    <button
                      type="button"
                      onClick={() => setShowManualInput(!showManualInput)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      {showManualInput ? 'Hide manual entry' : 'Or paste token manually'}
                    </button>
                  </div>
                </div>
              )}

              {showManualInput && (
                <div className="mt-3 p-3 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Paste Google OAuth Access Token
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      placeholder="ya29.a0A..."
                      className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyManualToken}
                      disabled={!manualToken.trim()}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      Apply Token
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Synchronization Actions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Synchronize Surveillance Datasets
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={onSyncAdnisArchive}
                  disabled={isSyncingAdnis || !onSyncAdnisArchive}
                  className="flex flex-col items-start p-4 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 rounded-xl transition-all text-left disabled:opacity-50 group"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg group-hover:scale-105 transition-transform">
                      <Database className="w-5 h-5" />
                    </div>
                    {isSyncingAdnis && (
                      <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {currentLabInfo.shortCode} Historical ADNIS Archive
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    2-Year Baseline dataset across {currentLabInfo.coverageWoredas} {currentLabInfo.shortCode} operational woredas.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onSyncAnnualData}
                  disabled={isSyncingData || !onSyncAnnualData}
                  className="flex flex-col items-start p-4 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-xl transition-all text-left disabled:opacity-50 group"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:scale-105 transition-transform">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    {isSyncingData && (
                      <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    ADNIS 2025 & 2026 Folders
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Ongoing annual surveillance spreadsheets and records.
                  </span>
                </button>
              </div>
            </div>

            {/* Verified Google Drive Repository Links */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col space-y-2.5">
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                <span>Configured Google Drive Folders</span>
              </div>
              <a
                href="https://drive.google.com/drive/folders/1QxnB2XqQJeN-uUWKvo6dlFWKhNQqxrwl"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-2 px-3 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <span className="font-medium truncate">{currentLabInfo.shortCode} Historical ADNIS Archive (2-Year Baseline)</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
              </a>
              <a
                href="https://drive.google.com/drive/folders/1PqTNHiMRTuMxwbMy9qPpjGoLzeny4o36"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-2 px-3 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <span className="font-medium truncate">ADNIS_2025 Folder</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
              </a>
              <a
                href="https://drive.google.com/drive/folders/15P2NgBhbC29NlGQ_LCJsEKydw-G1HHcJ"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-2 px-3 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <span className="font-medium truncate">ADNIS_2026 Folder</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
