import React from 'react';
import { X, Syringe, Info, ShieldCheck, Tag } from 'lucide-react';
import { VaccineDictionaryEntry } from '../../types/arvlVaccination';

interface TargetInfoModalProps {
  target: VaccineDictionaryEntry | null;
  targetCode: string | null;
  onClose: () => void;
}

export const TargetInfoModal: React.FC<TargetInfoModalProps> = ({
  target,
  targetCode,
  onClose
}) => {
  if (!targetCode) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top decorative bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-black text-lg border border-emerald-200 dark:border-emerald-800">
              {targetCode}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {target ? target.officialName : `${targetCode} (Custom Target)`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {target ? `${target.category} Etiology • ${target.targetSpecies}` : 'Unregistered target code in dictionary'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          {target ? (
            <>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <Info className="w-3.5 h-3.5 text-emerald-600" />
                  Description & Veterinary Specification
                </div>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                  {target.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Target Species</div>
                  <div className="text-slate-900 dark:text-white font-semibold mt-0.5">{target.targetSpecies}</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Category</div>
                  <div className="text-slate-900 dark:text-white font-semibold mt-0.5">{target.category}</div>
                </div>
              </div>

              {target.notes && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs leading-relaxed flex items-start gap-2">
                  <Tag className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <strong className="font-semibold block mb-0.5">Campaign & Seasonal Notes:</strong>
                    {target.notes}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300">
              <p className="font-semibold text-sm mb-1">Unregistered Vaccine Target</p>
              <p className="text-xs">
                The code <span className="font-mono font-bold">"{targetCode}"</span> appears in the district schedule but is not yet formally registered in the Vaccine Dictionary. Administrators can add it in the Dictionary Settings.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
