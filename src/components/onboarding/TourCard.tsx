import React, { useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Compass, 
  Check,
  ShieldAlert,
  FileText
} from 'lucide-react';
import { TourStep } from './TourConfig';
import { TourProgress } from './TourProgress';
import { SpotlightRect } from './TourSpotlight';
import { TourLanguageSelector } from './TourLanguageSelector';
import { TourVoiceControls } from './TourVoiceControls';
import { Locale } from '../../types';
import { SpeechState } from '../../services/voiceService';
import { soundEngine } from '../../utils/sound';
import { useI18n } from '../../contexts/I18nContext';

interface TourCardProps {
  step: TourStep;
  currentStepIndex: number;
  totalSteps: number;
  spotlightRect: SpotlightRect | null;
  locale: Locale;
  voiceEnabled: boolean;
  speechState: SpeechState;
  speechRate: number;
  onSelectLocale: (locale: Locale) => void;
  onToggleVoice: (enabled: boolean) => void;
  onPlayVoice: () => void;
  onPauseVoice: () => void;
  onReplayVoice: () => void;
  onChangeRate: (rate: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onFinish: () => void;
  onStepClick?: (stepNumber: number) => void;
  dontShowAgain: boolean;
  onToggleDontShowAgain: (checked: boolean) => void;
  isAdmin?: boolean;
}

export const TourCard: React.FC<TourCardProps> = ({
  step,
  currentStepIndex,
  totalSteps,
  spotlightRect,
  locale,
  voiceEnabled,
  speechState,
  speechRate,
  onSelectLocale,
  onToggleVoice,
  onPlayVoice,
  onPauseVoice,
  onReplayVoice,
  onChangeRate,
  onNext,
  onPrev,
  onSkip,
  onFinish,
  onStepClick,
  dontShowAgain,
  onToggleDontShowAgain,
  isAdmin = true,
}) => {
  const { t } = useI18n();
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const isSpeaking = speechState === 'playing';

  // Responsive, Viewport-Safe Floating or Anchored Position Calculation
  const cardStyle = useMemo<React.CSSProperties>(() => {
    if (typeof window === 'undefined') return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cardWidth = Math.min(480, vw - 24);
    const cardHeight = 490; // approximate estimate
    const margin = 16;

    // Mobile screens (<768px) or Vision step or no spotlight rect
    if (step.isVisionStep || !spotlightRect || vw < 768) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${cardWidth}px`,
        maxWidth: 'calc(100vw - 24px)',
        maxHeight: 'calc(100vh - 32px)',
        zIndex: 110,
      };
    }

    let top = spotlightRect.top;
    let left = spotlightRect.right + margin;

    // Preferred placement: right of target
    if (left + cardWidth > vw - margin) {
      // Not enough space on right, try left of target
      left = spotlightRect.left - cardWidth - margin;
    }

    // If still not fitting on left, position below target
    if (left < margin) {
      left = Math.max(margin, Math.min(spotlightRect.left, vw - cardWidth - margin));
      top = spotlightRect.bottom + margin;
    }

    // If not fitting on bottom, position above target
    if (top + cardHeight > vh - margin) {
      top = Math.max(margin, spotlightRect.top - cardHeight - margin);
    }

    // Ensure strictly within viewport bounds
    top = Math.max(margin, Math.min(top, vh - cardHeight - margin));
    left = Math.max(margin, Math.min(left, vw - cardWidth - margin));

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${cardWidth}px`,
      maxWidth: 'calc(100vw - 24px)',
      maxHeight: 'calc(100vh - 32px)',
      zIndex: 110,
    };
  }, [spotlightRect, step.isVisionStep]);

  // Localized texts
  const title = step.title[locale] || step.title.en;
  const subtitle = step.subtitle ? (step.subtitle[locale] || step.subtitle.en) : undefined;
  const purpose = step.purpose[locale] || step.purpose.en;
  const features = step.features[locale] || step.features.en;
  const narration = step.narration[locale] || step.narration.en;

  return (
    <div
      style={cardStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-card-title"
      aria-describedby="tour-card-purpose"
      className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95 pointer-events-auto"
    >
      {/* Top Header Banner */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <TourProgress
            currentStep={currentStepIndex + 1}
            totalSteps={totalSteps}
            onStepClick={onStepClick}
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onSkip();
              }}
              aria-label="Close guided tour"
              title="Close Tour (Esc)"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title, Subtitle & Language Selector in Tour Header */}
        <div className="flex items-start justify-between gap-3 mt-1">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800 shrink-0">
              {step.isVisionStep ? (
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <div>
              <h2 id="tour-card-title" className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-snug">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <TourLanguageSelector
            currentLocale={locale}
            onSelectLocale={onSelectLocale}
            size="sm"
          />
        </div>
      </div>

      {/* Voice Controls Bar */}
      <div className="px-4 sm:px-5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-100 dark:border-slate-800">
        <TourVoiceControls
          voiceEnabled={voiceEnabled}
          speechState={speechState}
          speechRate={speechRate}
          onToggleVoice={onToggleVoice}
          onPlay={onPlayVoice}
          onPause={onPauseVoice}
          onReplay={onReplayVoice}
          onChangeRate={onChangeRate}
          compact
        />
      </div>

      {/* Body: Purpose, Key Features, and Narration Transcript */}
      <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[46vh] custom-scrollbar">
        {/* Purpose */}
        <div>
          <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            {t.tourPurposeLabel || 'Purpose'}
          </h3>
          <p id="tour-card-purpose" className="text-xs sm:text-[13px] leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
            {purpose}
          </p>
        </div>

        {/* Key Features List */}
        {features && features.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t.tourCapabilitiesLabel || 'Key Capabilities'}
            </h3>
            <ul className="space-y-1.5">
              {features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Administration Role Notice if step is admin */}
        {step.requiresAdmin && !isAdmin && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-300 dark:border-amber-800/80 flex items-start gap-2 text-amber-900 dark:text-amber-200 text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              {t.tourAdminNotice || 'Note: System administrative settings and user permissions are accessible exclusively to authorized accounts.'}
            </p>
          </div>
        )}

        {/* Voice Narration / Captions Transcript Box */}
        <div className={`
          p-3 rounded-xl border transition-all duration-200 space-y-1.5
          ${isSpeaking
            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/80 shadow-xs'
            : 'bg-slate-50/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
          }
        `}>
          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <FileText className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{t.tourTranscriptLabel || `Voice Narration Transcript (${locale.toUpperCase()})`}</span>
            </div>
            {isSpeaking && (
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                {t.tourNarratingStatus || 'Narrating...'}
              </span>
            )}
          </div>
          <p className="text-xs italic leading-relaxed text-slate-700 dark:text-slate-300 text-justify m-0">
            "{narration}"
          </p>
        </div>

        {/* Vision Closing Motto */}
        {step.isVisionStep && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/80 text-center">
            <p className="text-xs font-black tracking-wide text-emerald-800 dark:text-emerald-300 uppercase">
              {locale === 'am' ? 'አንድ መድረክ • አንድ ጤና • አንድ ተልዕኮ' : locale === 'om' ? 'Waltajjii Tokko • Fayyaa Tokko • Ergama Tokko' : 'One Platform • One Health • One Mission'}
            </p>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-4 sm:p-5 bg-slate-50/90 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 space-y-3">
        {/* Don't show again toggle */}
        <label className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 select-none cursor-pointer">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => {
              soundEngine.playClick();
              onToggleDontShowAgain(e.target.checked);
            }}
            className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer"
          />
          <span>{t.tourDontShowAgainLabel || 'Don\'t show this tour automatically again'}</span>
        </label>

        {/* Actions Button Row */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onSkip();
            }}
            className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {t.tourSkipButton || 'Skip Tour'}
          </button>

          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onPrev();
                }}
                aria-label="Previous step"
                className="px-3.5 py-2 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t.tourBackButton || 'Back'}</span>
              </button>
            )}

            {isLastStep ? (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSuccess();
                  onFinish();
                }}
                className="px-4 py-2 flex items-center gap-1.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 border border-emerald-500 transition-all cursor-pointer"
              >
                <span>{t.tourFinishButton || 'Finish Tour'}</span>
                <Check className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onNext();
                }}
                aria-label="Next step"
                className="px-4 py-2 flex items-center gap-1.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 border border-emerald-500 transition-all cursor-pointer"
              >
                <span>{t.tourNextButton || 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
