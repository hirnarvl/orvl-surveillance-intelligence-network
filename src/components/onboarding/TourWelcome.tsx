import React, { useEffect } from 'react';
import { 
  Compass, 
  Play, 
  X, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  FlaskConical,
  MapPin,
  FileSpreadsheet,
  Volume2,
  VolumeX,
  FileText
} from 'lucide-react';
import { TOUR_WELCOME_CONTENT } from './TourConfig';
import { TourLanguageSelector } from './TourLanguageSelector';
import { Locale } from '../../types';
import { useLaboratory } from '../../contexts/LaboratoryContext';
import { voiceService } from '../../services/voiceService';
import { soundEngine } from '../../utils/sound';

interface TourWelcomeProps {
  isOpen: boolean;
  locale: Locale;
  voiceEnabled: boolean;
  dontShowAgain: boolean;
  onSelectLocale: (locale: Locale) => void;
  onToggleVoice: (enabled: boolean) => void;
  onToggleDontShowAgain: (checked: boolean) => void;
  onStartTour: () => void;
  onWatchOverview: () => void;
  onExploreFreely: () => void;
  onClose: () => void;
}

export const TourWelcome: React.FC<TourWelcomeProps> = ({
  isOpen,
  locale,
  voiceEnabled,
  dontShowAgain,
  onSelectLocale,
  onToggleVoice,
  onToggleDontShowAgain,
  onStartTour,
  onWatchOverview,
  onExploreFreely,
  onClose,
}) => {
  const { selectedLab } = useLaboratory();
  const isArvl = selectedLab === 'arvl';
  const logoSrc = isArvl
    ? '/arvl-emblem.png'
    : '/hrvl-emblem.png';
  const content = TOUR_WELCOME_CONTENT;

  // Speak welcome narration in selected language if voice enabled
  useEffect(() => {
    voiceService.setLabContext(selectedLab);
    if (!isOpen) {
      voiceService.stop();
      return;
    }

    if (voiceEnabled) {
      const narrationText = content.narration[locale] || content.narration.en;
      voiceService.speak(narrationText, locale);
    } else {
      voiceService.stop();
    }

    return () => {
      voiceService.stop();
    };
  }, [isOpen, locale, voiceEnabled, selectedLab]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Header with HRVL Emblem & Language Selector */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <ShieldCheck className="w-64 h-64" />
          </div>

          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 shrink-0 flex items-center justify-center">
                <img 
                  src={logoSrc} 
                  alt={isArvl ? 'ARVL Emblem' : 'HRVL Emblem'} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain filter drop-shadow-md" 
                />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-emerald-200">
                    {isArvl ? 'ARVL Digital Platform' : 'HRVL Digital Platform'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/20 text-white">
                    v2.5
                  </span>
                </div>
                <p className="text-xs text-emerald-100 font-medium">
                  {content.subtitle[locale]}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              aria-label="Close welcome overlay"
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Welcome Title */}
          <h1 id="welcome-modal-title" className="text-lg sm:text-2xl font-black tracking-tight text-white leading-tight">
            {content.title[locale]}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed mt-2 font-medium">
            {content.description[locale]}
          </p>

          {/* Language & Voice Selector Toolbar */}
          <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-200">
                Language / ቋንቋ / Afaan:
              </span>
              <TourLanguageSelector
                currentLocale={locale}
                onSelectLocale={onSelectLocale}
                size="sm"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onToggleVoice(!voiceEnabled);
              }}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer
                ${voiceEnabled
                  ? 'bg-white/20 text-white border-white/30'
                  : 'bg-black/20 text-white/70 border-white/10'
                }
              `}
            >
              {voiceEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Voice Narration On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-white/60" />
                  <span>Voice Narration Off</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3 Pillars Overview Section */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {content.pillars.map((pillar, i) => {
              const icons = [FileSpreadsheet, FlaskConical, MapPin];
              const Icon = icons[i] || Sparkles;
              return (
                <div 
                  key={i} 
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-left"
                >
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{pillar.title[locale]}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {pillar.desc[locale]}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Voice Narration Transcript Box (Synchronized upon language selection) */}
          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {locale === 'om' ? `Barreeffama Sagalee Qajeelchaa (${locale.toUpperCase()})` : locale === 'am' ? `የድምፅ መመሪያ ጽሑፍ (${locale.toUpperCase()})` : `Voice Narration Transcript (${locale.toUpperCase()})`}
                </span>
              </div>
              {voiceEnabled && (
                <span className="text-emerald-700 dark:text-emerald-400 font-bold lowercase">
                  {locale === 'om' ? 'sagaleen banaadha' : locale === 'am' ? 'ድምፅ እየተጫወተ ነው' : 'voice active'}
                </span>
              )}
            </div>
            <p className="text-xs italic text-slate-700 dark:text-slate-300 leading-relaxed m-0 text-justify">
              "{content.narration[locale]}"
            </p>
          </div>

          {/* Action Choice Buttons */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* 1. Start Guided Tour */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playSuccess();
                onStartTour();
              }}
              className="w-full py-3 px-5 flex items-center justify-between rounded-2xl text-sm font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-lg shadow-emerald-600/20 border border-emerald-500 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Compass className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="leading-tight">{content.startTourButton[locale]}</div>
                  <div className="text-[11px] text-emerald-100 font-normal">
                    Interactive 10-step guided tour with voice narration
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </button>

            {/* 2. Watch Overview */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onWatchOverview();
              }}
              className="w-full py-3 px-5 flex items-center justify-between rounded-2xl text-sm font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded-xl border border-teal-200 dark:border-teal-800">
                  <Play className="w-5 h-5 fill-current" />
                </div>
                <div className="text-left">
                  <div className="leading-tight">{content.watchOverviewButton[locale]}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                    60-90 second conceptual overview of the data-to-action pathway
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 opacity-60 transform group-hover:translate-x-1 transition-transform" />
            </button>

            {/* 3. Explore Freely */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onExploreFreely();
              }}
              className="w-full py-2.5 px-4 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer"
            >
              {content.exploreFreelyButton[locale]}
            </button>
          </div>
        </div>

        {/* Footer: Don't show again toggle */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => {
                soundEngine.playClick();
                onToggleDontShowAgain(e.target.checked);
              }}
              className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer"
            />
            <span>{content.dontShowAgain[locale]}</span>
          </label>

          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono hidden sm:inline">
            HRVL • One Health
          </span>
        </div>
      </div>
    </div>
  );
};
