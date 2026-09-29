import React, { useState, useEffect } from 'react';
import { useLaboratory } from '../contexts/LaboratoryContext';
import { ARVLVaccinationDashboard } from './arvlVaccination/ARVLVaccinationDashboard';
import { VaccineCalendar } from './VaccineCalendar';
import { Calendar, Building2, Layers, ShieldAlert, Sparkles } from 'lucide-react';

export const VaccineCalendarContainer: React.FC = () => {
  const { selectedLab, currentLabInfo } = useLaboratory();

  // If user is in ARVL lab context, default to 'arvl', else default to 'hrvl' (or user choice)
  const [activeCalendarTab, setActiveCalendarTab] = useState<'arvl' | 'hrvl'>(() => {
    return selectedLab === 'arvl' ? 'arvl' : 'hrvl';
  });

  // Sync with global lab selection changes
  useEffect(() => {
    if (selectedLab === 'arvl') {
      setActiveCalendarTab('arvl');
    } else if (selectedLab === 'hrvl') {
      setActiveCalendarTab('hrvl');
    }
  }, [selectedLab]);

  return (
    <div className="space-y-4">
      {/* Sub-navigation bar for switching between ARVL and HRVL calendars */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Veterinary Vaccination Planning Modules</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {activeCalendarTab === 'arvl' ? 'ARVL Module Active' : 'HRVL Module Active'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Select laboratory jurisdiction to view regional livestock vaccination schedules
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveCalendarTab('arvl')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeCalendarTab === 'arvl'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>ARVL Calendar (122 Units)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCalendarTab('hrvl')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeCalendarTab === 'hrvl'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>HRVL Calendar (Hararghe)</span>
          </button>
        </div>
      </div>

      {/* Render Active Calendar */}
      {activeCalendarTab === 'arvl' ? (
        <ARVLVaccinationDashboard />
      ) : (
        <VaccineCalendar />
      )}
    </div>
  );
};
