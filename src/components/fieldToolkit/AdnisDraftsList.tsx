import React from 'react';
import { 
  FileEdit, 
  Trash2, 
  Calendar, 
  MapPin, 
  Stethoscope, 
  AlertCircle, 
  ShieldCheck, 
  Flame,
  Clock,
  ArrowRight
} from 'lucide-react';
import { AdnisReport } from '../../types/adnisReporting';
import { soundEngine } from '../../utils/sound';

interface AdnisDraftsListProps {
  drafts: AdnisReport[];
  onResumeDraft: (draft: AdnisReport) => void;
  onDeleteDraft: (draftId: string) => void;
  onNewFieldReport: () => void;
  onNewZeroReport: () => void;
}

export const AdnisDraftsList: React.FC<AdnisDraftsListProps> = ({
  drafts,
  onResumeDraft,
  onDeleteDraft,
  onNewFieldReport,
  onNewZeroReport
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileEdit className="w-5 h-5 text-amber-500" />
            <span>My Local Drafts ({drafts.length})</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Draft reports saved locally on your device. You can resume editing and submit anytime.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewFieldReport}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>+ Field Report</span>
          </button>
          <button
            onClick={onNewZeroReport}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>+ Zero Report</span>
          </button>
        </div>
      </div>

      {drafts.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mx-auto text-slate-400">
            <FileEdit className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Draft Reports Saved</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            When you create a Field or Zero report and click "Save Draft", it will appear here so you can continue working on it even offline.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onNewFieldReport}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Start Field Report
            </button>
            <button
              onClick={onNewZeroReport}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Start Zero Report
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {drafts.map(draft => {
            const isZero = draft.report_type === 'ZERO_REPORT';
            return (
              <div
                key={draft.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-slate-400 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Badge & Date */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${
                      isZero 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800' 
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    }`}>
                      {isZero ? <ShieldCheck className="w-3 h-3" /> : <Flame className="w-3 h-3" />}
                      <span>{isZero ? 'Zero Report Draft' : 'Field Outbreak Draft'}</span>
                    </span>

                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(draft.updated_at).toLocaleDateString()}</span>
                    </span>
                  </div>

                  {/* Title & Woreda */}
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {isZero ? 'Zero Disease Surveillance' : (draft.tentative_diagnosis || 'Unclassified Outbreak')}
                  </h4>

                  <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{draft.district} Woreda ({draft.zone}) • {draft.reporting_unit}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Species: {draft.species?.join(', ') || 'None selected'}</span>
                    </p>
                    {!isZero && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        Cases: <strong>{draft.cases}</strong> • Deaths: <strong>{draft.deaths}</strong> • At Risk: <strong>{draft.at_risk}</strong>
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onDeleteDraft(draft.id);
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                    title="Delete Draft"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onResumeDraft(draft);
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-all cursor-pointer shadow-xs"
                  >
                    <span>Resume</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
