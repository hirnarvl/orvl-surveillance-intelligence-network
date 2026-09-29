import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, ChevronDown, Check, Layers, ShieldCheck, Lock, Globe } from 'lucide-react';
import { useLaboratory } from '../contexts/LaboratoryContext';
import { LaboratoryId } from '../data/laboratories';
import { soundEngine } from '../utils/sound';

interface LaboratorySelectorProps {
  className?: string;
  isFullWidth?: boolean;
}

export const LaboratorySelector: React.FC<LaboratorySelectorProps> = ({ 
  className = '',
  isFullWidth = false 
}) => {
  const { 
    selectedLab, 
    setSelectedLab, 
    currentLabInfo, 
    availableLaboratories, 
    isMultiLabView, 
    isLabLocked 
  } = useLaboratory();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelect = (labId: LaboratoryId) => {
    soundEngine.playSuccess();
    setSelectedLab(labId);
    setIsOpen(false);
  };

  // Single laboratory locked view
  if (isLabLocked) {
    return (
      <div 
        id="laboratory-selector-locked"
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 ${isFullWidth ? 'w-full justify-between' : ''} ${className}`}
        title="Institutional access restricted to assigned laboratory tenant"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="truncate">{currentLabInfo.shortName}</span>
        </div>
        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </div>
    );
  }

  return (
    <div className={`relative ${isFullWidth ? 'w-full' : 'inline-block text-left'} ${className}`} ref={dropdownRef} id="laboratory-selector-container">
      <button
        id="laboratory-selector-button"
        type="button"
        onClick={() => {
          soundEngine.playClick();
          setIsOpen(!isOpen);
        }}
        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer ${
          isFullWidth ? 'w-full' : ''
        } ${
          isMultiLabView
            ? 'bg-purple-50/90 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/60'
            : selectedLab === 'arvl'
            ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
            : 'bg-blue-50/90 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/60'
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0">
          {isMultiLabView ? (
            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
          ) : (
            <Building2 className={`w-4 h-4 shrink-0 ${selectedLab === 'arvl' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`} />
          )}

          <span className="truncate">
            {currentLabInfo.shortName}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-md bg-white/80 dark:bg-black/40 border border-current/20">
            {currentLabInfo.code}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${isFullWidth ? 'left-0 right-0 w-full' : 'right-0 w-72 sm:w-80'} mt-2 rounded-2xl shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-slate-800 dark:text-slate-100 focus:outline-none ring-1 ring-black/5`}
            role="menu"
            aria-orientation="vertical"
          >
            <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Switch Laboratory Context
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800/60">
                Multi-Tenant Core
              </span>
            </div>

            <div className="py-1.5 space-y-1 px-1.5">
              {availableLaboratories.map((lab) => {
                const isSelected = selectedLab === lab.id;
                const isAll = lab.id === 'all';
                const isArvl = lab.id === 'arvl';

                return (
                  <button
                    key={lab.id}
                    id={`lab-option-${lab.id}`}
                    onClick={() => handleSelect(lab.id as LaboratoryId)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-start gap-2.5 transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? isAll
                          ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-950 dark:text-purple-100 font-semibold ring-1 ring-purple-300 dark:ring-purple-800'
                          : isArvl
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-100 font-semibold ring-1 ring-emerald-300 dark:ring-emerald-800'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-950 dark:text-blue-100 font-semibold ring-1 ring-blue-300 dark:ring-blue-800'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                    }`}
                    role="menuitem"
                  >
                    <div className="mt-0.5 shrink-0">
                      {isAll ? (
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                          <Layers className="w-4 h-4" />
                        </div>
                      ) : isArvl ? (
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                          <Building2 className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                          <Building2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate">{lab.name}</span>
                        {isSelected && (
                          <Check className={`w-4 h-4 shrink-0 ${
                            isAll 
                              ? 'text-purple-600 dark:text-purple-400' 
                              : isArvl 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : 'text-blue-600 dark:text-blue-400'
                          }`} />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {isAll 
                          ? '148 Woredas • Hararghe, Arsi, Shewa & Bale' 
                          : lab.id === 'hrvl' 
                          ? '36 Authorized Woredas • East & West Hararghe' 
                          : '112 Operational Units • Arsi, West Arsi, Bale & Shewa'
                        }
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="px-3 py-2 mt-1 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 rounded-b-2xl flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Context-Aware Analytics Filtering
              </span>
              <span className="font-mono text-[9px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                v2026.09
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
