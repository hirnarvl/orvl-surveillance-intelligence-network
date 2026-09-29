import React from 'react';
import { Sparkles, CheckCircle2, RotateCcw, Compass, ArrowRight, ShieldCheck } from 'lucide-react';
import { Locale } from '../../types';
import { TOUR_COMPLETION_CONTENT } from './TourConfig';
import { TourLanguageSelector } from './TourLanguageSelector';
import { soundEngine } from '../../utils/sound';

interface TourCompletionModalProps {
  isOpen: boolean;
  locale: Locale;
  onSelectLocale: (locale: Locale) => void;
  onExplore: () => void;
  onRestartTour: () => void;
}

export const TourCompletionModal: React.FC<TourCompletionModalProps> = ({
  isOpen,
  locale,
  onSelectLocale,
  onExplore,
  onRestartTour,
}) => {
  if (!isOpen) return null;

  const content = TOUR_COMPLETION_CONTENT;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-complete-title"
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header decoration */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-10">
            <ShieldCheck className="w-48 h-48" />
          </div>

          <div className="inline-flex p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 mb-3 shadow-lg">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>

          <h2 id="tour-complete-title" className="text-xl sm:text-2xl font-black tracking-tight">
            {content.title[locale]}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1">
            {content.subtitle[locale]}
          </p>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-5">
          {/* Motto / Highlights Card */}
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/80 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{content.mottoTitle[locale] || 'One Platform • One Health • One Mission'}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {content.mottoDesc[locale] || 'From Field Data to Spatial Intelligence. From Intelligence to Rapid One Health Action.'}
            </p>
          </div>

          {/* Language Selector in completion modal */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Language / ቋንቋ / Afaan:
            </span>
            <TourLanguageSelector
              currentLocale={locale}
              onSelectLocale={onSelectLocale}
              size="sm"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onRestartTour();
              }}
              className="w-full sm:w-1/2 py-2.5 px-4 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{content.replayButton[locale]}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playSuccess();
                onExplore();
              }}
              className="w-full sm:w-1/2 py-2.5 px-4 flex items-center justify-center gap-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 border border-emerald-500 transition-all cursor-pointer"
            >
              <span>{content.exploreButton[locale]}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
