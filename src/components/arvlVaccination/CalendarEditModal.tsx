import React, { useState } from 'react';
import { X, Save, Trash2, Calendar, Syringe, AlertCircle, Info } from 'lucide-react';
import { 
  ARVLVaccinationRecord, 
  RawMonthlyTargets, 
  EthiopianFiscalMonthKey 
} from '../../types/arvlVaccination';
import { 
  MONTH_ORDER, 
  MONTH_LABELS, 
  FISCAL_QUARTERS, 
  parseTargetCodes 
} from '../../data/arvlVaccinationData';

interface CalendarEditModalProps {
  initialRecord: ARVLVaccinationRecord | null;
  onClose: () => void;
  onSave: (record: ARVLVaccinationRecord) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const CalendarEditModal: React.FC<CalendarEditModalProps> = ({
  initialRecord,
  onClose,
  onSave,
  onDelete
}) => {
  const isNew = !initialRecord;

  const [region, setRegion] = useState(initialRecord?.region || 'Oromia ARVL');
  const [zone, setZone] = useState(initialRecord?.zone || 'Arsi');
  const [district, setDistrict] = useState(initialRecord?.district || '');
  const [planningYear, setPlanningYear] = useState(initialRecord?.planningYear || '2026/27');
  const [remark, setRemark] = useState(initialRecord?.remark || '');

  const [rawMonths, setRawMonths] = useState<RawMonthlyTargets>(
    initialRecord?.rawMonths || {
      july: '',
      august: '',
      september: '',
      october: '',
      november: '',
      december: '',
      january: '',
      february: '',
      march: '',
      april: '',
      may: '',
      june: ''
    }
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleMonthChange = (month: EthiopianFiscalMonthKey, value: string) => {
    setRawMonths(prev => ({
      ...prev,
      [month]: value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!district.trim()) return;

    setIsSaving(true);
    try {
      const parsedMonths = {
        july: parseTargetCodes(rawMonths.july),
        august: parseTargetCodes(rawMonths.august),
        september: parseTargetCodes(rawMonths.september),
        october: parseTargetCodes(rawMonths.october),
        november: parseTargetCodes(rawMonths.november),
        december: parseTargetCodes(rawMonths.december),
        january: parseTargetCodes(rawMonths.january),
        february: parseTargetCodes(rawMonths.february),
        march: parseTargetCodes(rawMonths.march),
        april: parseTargetCodes(rawMonths.april),
        may: parseTargetCodes(rawMonths.may),
        june: parseTargetCodes(rawMonths.june)
      };

      const hasTargets = Object.values(parsedMonths).some(arr => arr.length > 0);

      const recordToSave: ARVLVaccinationRecord = {
        id: initialRecord?.id || `arvl-cal-${Date.now()}`,
        planningYear,
        region,
        zone,
        district: district.trim(),
        months: parsedMonths,
        rawMonths,
        remark: remark.trim(),
        qualityFlags: !hasTargets ? ['NO_SCHEDULE'] : undefined,
        source: initialRecord?.source || 'Administrative Field Entry',
        createdAt: initialRecord?.createdAt || Date.now(),
        updatedAt: Date.now()
      };

      await onSave(recordToSave);
      onClose();
    } catch (err) {
      console.error('Failed to save record:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialRecord || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(initialRecord.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete record:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const zonesList = [
    'Arsi',
    'West Arsi',
    'Bale',
    'East Bale',
    'East Shewa',
    'North Shewa',
    'Sheger City',
    'Adama City',
    'Shashamane City',
    'Bishoftu City',
    'Town-level operational units'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-emerald-600" />
              {isNew ? 'Create New District Vaccination Plan' : `Edit Plan: ${initialRecord.district}`}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Specify scheduled vaccine activities across the Ethiopian fiscal year (July–June).
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="py-6 space-y-6 text-xs">
          {/* Top Administrative Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Region *
              </label>
              <input
                type="text"
                required
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Zone *
              </label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              >
                {zonesList.map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                District / Woreda Name *
              </label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. H/wabe, Asakoo, Tiyo"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Planning Year *
              </label>
              <select
                value={planningYear}
                onChange={(e) => setPlanningYear(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              >
                <option value="2026/27">2026/27 (Current)</option>
                <option value="2025/26">2025/26 (Preceding)</option>
                <option value="2027/28">2027/28 (Upcoming)</option>
              </select>
            </div>
          </div>

          {/* Monthly Schedule Inputs Arranged by Quarter */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Syringe className="w-3.5 h-3.5 text-emerald-600" />
                Monthly Vaccination Targets (Comma-separated codes, e.g. "LSD,AHS,FMD" or "BQ,Ant")
              </span>
              <span className="text-slate-400 text-[10px]">
                Leave empty if no activity is scheduled for that month
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map(qKey => {
                const q = FISCAL_QUARTERS[qKey];
                return (
                  <div 
                    key={qKey}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-3"
                  >
                    <div className="font-black text-xs text-slate-800 dark:text-slate-200 pb-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
                      {q.name} ({qKey})
                    </div>

                    {q.months.map(mKey => {
                      const val = rawMonths[mKey];
                      const parsed = parseTargetCodes(val);

                      return (
                        <div key={mKey} className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                            <span>{MONTH_LABELS[mKey].full}</span>
                            {parsed.length > 0 && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                {parsed.length} target{parsed.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => handleMonthChange(mKey, e.target.value)}
                            placeholder="e.g. LSD,AHS,BQ"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                          />
                          {parsed.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {parsed.map((p, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded text-[9px] font-bold"
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Operational Remark & Veterinary Epidemiology Notes
            </label>
            <textarea
              rows={2}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="e.g. Highland agro-pastoral corridor with intensive cattle movement; prior season LSD outbreak buffer."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              {!isNew && onDelete && (
                showConfirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-rose-600 font-bold text-xs">Confirm deletion?</span>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={handleDelete}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs"
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirmDelete(false)}
                      className="px-2 py-1.5 text-slate-500 hover:text-slate-700 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(true)}
                    className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-semibold flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Plan
                  </button>
                )
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Plan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
