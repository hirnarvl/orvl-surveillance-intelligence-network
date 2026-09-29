import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  TOUR_STEPS, 
  TourStep, 
  ONBOARDING_STORAGE_KEY, 
  ONBOARDING_DONT_SHOW_KEY 
} from './TourConfig';
import { TourSpotlight, SpotlightRect } from './TourSpotlight';
import { TourCard } from './TourCard';
import { TourCompletionModal } from './TourCompletionModal';
import { ActiveTab, Locale } from '../../types';
import { useI18n } from '../../contexts/I18nContext';
import { useLaboratory } from '../../contexts/LaboratoryContext';
import { voiceService, SpeechState } from '../../services/voiceService';
import { soundEngine } from '../../utils/sound';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish?: () => void;
  setActiveTab?: (tab: ActiveTab) => void;
  onSelectFastSection?: (section: 'diseases' | 'resources' | 'field-tools' | 'laboratory' | 'one-health' | 'training') => void;
  isAdmin?: boolean;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  onFinish,
  setActiveTab,
  onSelectFastSection,
  isAdmin = true,
}) => {
  const { locale, setLocale } = useI18n();
  const { selectedLab } = useLaboratory();

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);

  // Voice narration states
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('hrvl_tour_voice_enabled');
    return saved !== 'false'; // default true
  });
  const [speechState, setSpeechState] = useState<SpeechState>('idle');
  const [speechRate, setSpeechRate] = useState<number>(() => voiceService.getRate());

  const [dontShowAgain, setDontShowAgain] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(ONBOARDING_DONT_SHOW_KEY) === 'true';
  });

  const lastSyncedStepRef = useRef<number>(-1);
  const setActiveTabRef = useRef(setActiveTab);
  setActiveTabRef.current = setActiveTab;
  const onSelectFastSectionRef = useRef(onSelectFastSection);
  onSelectFastSectionRef.current = onSelectFastSection;

  const currentStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];
  const totalSteps = TOUR_STEPS.length;

  // Subscribe to voice state
  useEffect(() => {
    const unsub = voiceService.subscribe({
      onStateChange: (st) => setSpeechState(st),
    });
    return unsub;
  }, []);

  // Voice narration per step
  useEffect(() => {
    voiceService.setLabContext(selectedLab);
    if (!isOpen || showCompletionModal) {
      voiceService.stop();
      return;
    }

    if (voiceEnabled && currentStep) {
      const narrationText = currentStep.narration[locale] || currentStep.narration.en;
      voiceService.speak(narrationText, locale);
    } else {
      voiceService.stop();
    }

    return () => {
      voiceService.stop();
    };
  }, [isOpen, currentStepIndex, locale, voiceEnabled, showCompletionModal, currentStep, selectedLab]);

  // Sync activeTab and fastSubTab only when step actually changes
  useEffect(() => {
    if (!isOpen || !currentStep) {
      lastSyncedStepRef.current = -1;
      return;
    }

    if (lastSyncedStepRef.current === currentStepIndex) {
      return;
    }
    lastSyncedStepRef.current = currentStepIndex;

    if (setActiveTabRef.current && currentStep.activeTab) {
      setActiveTabRef.current(currentStep.activeTab);
    }

    if (onSelectFastSectionRef.current && currentStep.fastSubTab) {
      onSelectFastSectionRef.current(currentStep.fastSubTab);
    }
  }, [isOpen, currentStepIndex, currentStep]);

  // Measure target element rect whenever step changes or tour opens
  useEffect(() => {
    if (!isOpen || showCompletionModal) {
      setSpotlightRect(null);
      return;
    }

    if (currentStep.isVisionStep || !currentStep.targetDataTour) {
      setSpotlightRect(null);
      return;
    }

    const selectors = [
      `[data-tour="${currentStep.targetDataTour}"]`,
      `[data-tour="nav-${currentStep.targetDataTour}"]`,
      `[data-tour="${currentStep.id}"]`,
    ];

    const measure = () => {
      let el: Element | null = null;
      for (const sel of selectors) {
        el = document.querySelector(sel);
        if (el) break;
      }

      if (!el) {
        setSpotlightRect(null);
        return;
      }

      // Smooth scroll target into view if completely offscreen
      const rawRect = el.getBoundingClientRect();
      const inView = (
        rawRect.top >= 0 &&
        rawRect.left >= 0 &&
        rawRect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rawRect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );

      if (!inView) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }

      const rect = el.getBoundingClientRect();
      const padding = 8;
      const top = Math.max(0, Math.round(rect.top - padding));
      const left = Math.max(0, Math.round(rect.left - padding));
      const width = Math.round(rect.width + padding * 2);
      const height = Math.round(rect.height + padding * 2);

      setSpotlightRect((prev) => {
        if (
          prev &&
          prev.top === top &&
          prev.left === left &&
          prev.width === width &&
          prev.height === height
        ) {
          return prev;
        }
        return {
          top,
          left,
          width,
          height,
          right: left + width,
          bottom: top + height,
        };
      });
    };

    measure();
    const timer1 = setTimeout(measure, 100);
    const timer2 = setTimeout(measure, 350);

    const handleResize = () => {
      measure();
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', handleResize, { passive: true });
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [isOpen, showCompletionModal, currentStepIndex, currentStep.isVisionStep, currentStep.targetDataTour, currentStep.id]);

  const handleNext = useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Reached end of tour -> open completion modal
      soundEngine.playSuccess();
      setShowCompletionModal(true);
      voiceService.stop();
    }
  }, [currentStepIndex, totalSteps]);

  const handlePrev = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const handleSkip = useCallback(() => {
    voiceService.stop();
    if (dontShowAgain) {
      localStorage.setItem(ONBOARDING_DONT_SHOW_KEY, 'true');
    }
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    onClose();
  }, [dontShowAgain, onClose]);

  const handleFinish = useCallback(() => {
    voiceService.stop();
    if (dontShowAgain) {
      localStorage.setItem(ONBOARDING_DONT_SHOW_KEY, 'true');
    }
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setShowCompletionModal(false);
    onFinish ? onFinish() : onClose();
  }, [dontShowAgain, onFinish, onClose]);

  const handleToggleDontShowAgain = (checked: boolean) => {
    setDontShowAgain(checked);
    if (checked) {
      localStorage.setItem(ONBOARDING_DONT_SHOW_KEY, 'true');
    } else {
      localStorage.removeItem(ONBOARDING_DONT_SHOW_KEY);
    }
  };

  const handleToggleVoice = (enabled: boolean) => {
    setVoiceEnabled(enabled);
    localStorage.setItem('hrvl_tour_voice_enabled', enabled ? 'true' : 'false');
    if (!enabled) {
      voiceService.stop();
    } else {
      const narrationText = currentStep.narration[locale] || currentStep.narration.en;
      voiceService.speak(narrationText, locale);
    }
  };

  const handlePlayVoice = () => {
    if (speechState === 'paused') {
      voiceService.resume();
    } else {
      const narrationText = currentStep.narration[locale] || currentStep.narration.en;
      voiceService.speak(narrationText, locale);
    }
  };

  const handlePauseVoice = () => {
    voiceService.pause();
  };

  const handleReplayVoice = () => {
    const narrationText = currentStep.narration[locale] || currentStep.narration.en;
    voiceService.speak(narrationText, locale);
  };

  const handleChangeRate = (rate: number) => {
    setSpeechRate(rate);
    voiceService.setRate(rate);
  };

  const handleSelectLocale = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  // Keyboard accessibility
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in form field
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        soundEngine.playClick();
        handleSkip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        soundEngine.playClick();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        soundEngine.playClick();
        handlePrev();
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (speechState === 'playing') {
          handlePauseVoice();
        } else {
          handlePlayVoice();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleReplayVoice();
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        const locales: Locale[] = ['en', 'am', 'om'];
        const nextIdx = (locales.indexOf(locale) + 1) % locales.length;
        setLocale(locales[nextIdx]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, locale, speechState, handleNext, handlePrev, handleSkip, setLocale]);

  if (!isOpen) return null;

  return (
    <div className="onboarding-tour-root">
      {/* Spotlight Canvas Overlay */}
      {!showCompletionModal && (
        <TourSpotlight
          rect={currentStep.isVisionStep ? null : spotlightRect}
          onClickBackdrop={() => {
            soundEngine.playBlip();
          }}
        />
      )}

      {/* Explanatory Step Card */}
      {!showCompletionModal && (
        <TourCard
          step={currentStep}
          currentStepIndex={currentStepIndex}
          totalSteps={totalSteps}
          spotlightRect={spotlightRect}
          locale={locale}
          voiceEnabled={voiceEnabled}
          speechState={speechState}
          speechRate={speechRate}
          onSelectLocale={handleSelectLocale}
          onToggleVoice={handleToggleVoice}
          onPlayVoice={handlePlayVoice}
          onPauseVoice={handlePauseVoice}
          onReplayVoice={handleReplayVoice}
          onChangeRate={handleChangeRate}
          onNext={handleNext}
          onPrev={handlePrev}
          onSkip={handleSkip}
          onFinish={() => {
            setShowCompletionModal(true);
          }}
          onStepClick={(num) => {
            soundEngine.playClick();
            setCurrentStepIndex(num - 1);
          }}
          dontShowAgain={dontShowAgain}
          onToggleDontShowAgain={handleToggleDontShowAgain}
          isAdmin={isAdmin}
        />
      )}

      {/* Completion Modal */}
      <TourCompletionModal
        isOpen={showCompletionModal}
        locale={locale}
        onSelectLocale={handleSelectLocale}
        onExplore={handleFinish}
        onRestartTour={() => {
          setShowCompletionModal(false);
          setCurrentStepIndex(0);
        }}
      />
    </div>
  );
};
