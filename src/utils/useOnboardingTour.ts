import { useState, useCallback, useEffect } from 'react';
import { ONBOARDING_STORAGE_KEY, ONBOARDING_DONT_SHOW_KEY } from '../components/onboarding/TourConfig';

const VOICE_STORAGE_KEY = 'hrvl_tour_voice_enabled';

export interface UseOnboardingTourReturn {
  isWelcomeOpen: boolean;
  isTourOpen: boolean;
  isOverviewOpen: boolean;
  dontShowAgain: boolean;
  voiceEnabled: boolean;
  isCompleted: boolean;
  openWelcome: () => void;
  closeWelcome: () => void;
  startTour: () => void;
  closeTour: () => void;
  watchOverview: () => void;
  closeOverview: () => void;
  exploreFreely: () => void;
  toggleDontShowAgain: (checked: boolean) => void;
  toggleVoice: (enabled: boolean) => void;
  resetTourPreferences: () => void;
}

/**
 * Custom React Hook managing interactive onboarding tour visibility,
 * persistent 'Don't show tour again' preference, and voice narration settings in localStorage.
 *
 * Behavior:
 * - On first visit: Opens the Welcome modal automatically if neither 'dont_show_again' nor 'completed' is set in localStorage.
 * - On subsequent visits: Welcome modal remains closed unless explicitly triggered by the user via navigation/controls.
 * - Checking 'Don't show again' immediately persists to localStorage.
 */
export function useOnboardingTour(): UseOnboardingTourReturn {
  // Read initial preferences safely from localStorage
  const [dontShowAgain, setDontShowAgainState] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return false;
      return localStorage.getItem(ONBOARDING_DONT_SHOW_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isCompleted, setIsCompletedState] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return false;
      return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [voiceEnabled, setVoiceEnabledState] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return true;
      return localStorage.getItem(VOICE_STORAGE_KEY) !== 'false';
    } catch {
      return true;
    }
  });

  // Welcome modal is only auto-opened on first visit (when neither preference nor completion flag is set)
  const [isWelcomeOpen, setIsWelcomeOpen] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return false;
      const dontShow = localStorage.getItem(ONBOARDING_DONT_SHOW_KEY) === 'true';
      const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
      return !dontShow && !completed;
    } catch {
      return false;
    }
  });

  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [isOverviewOpen, setIsOverviewOpen] = useState<boolean>(false);

  // Toggle 'Don't show again' and sync immediately to localStorage
  const toggleDontShowAgain = useCallback((checked: boolean) => {
    setDontShowAgainState(checked);
    try {
      if (checked) {
        localStorage.setItem(ONBOARDING_DONT_SHOW_KEY, 'true');
      } else {
        localStorage.removeItem(ONBOARDING_DONT_SHOW_KEY);
      }
    } catch (e) {
      console.warn('Failed to save onboarding preference to localStorage:', e);
    }
  }, []);

  // Toggle Voice narration preference
  const toggleVoice = useCallback((enabled: boolean) => {
    setVoiceEnabledState(enabled);
    try {
      localStorage.setItem(VOICE_STORAGE_KEY, enabled ? 'true' : 'false');
    } catch (e) {
      console.warn('Failed to save tour voice preference to localStorage:', e);
    }
  }, []);

  // Explicit user trigger: Open Welcome Modal
  const openWelcome = useCallback(() => {
    setIsTourOpen(false);
    setIsOverviewOpen(false);
    setIsWelcomeOpen(true);
  }, []);

  const closeWelcome = useCallback(() => {
    setIsWelcomeOpen(false);
  }, []);

  // Explicit user trigger: Start Guided Step-by-Step Tour
  const startTour = useCallback(() => {
    setIsWelcomeOpen(false);
    setIsOverviewOpen(false);
    setIsTourOpen(true);
  }, []);

  const closeTour = useCallback(() => {
    setIsTourOpen(false);
  }, []);

  // Explicit user trigger: Watch Overview Video / Interactive Narrative
  const watchOverview = useCallback(() => {
    setIsWelcomeOpen(false);
    setIsOverviewOpen(true);
  }, []);

  const closeOverview = useCallback(() => {
    setIsOverviewOpen(false);
  }, []);

  // Explore freely action
  const exploreFreely = useCallback(() => {
    setIsWelcomeOpen(false);
    if (dontShowAgain) {
      try {
        localStorage.setItem(ONBOARDING_DONT_SHOW_KEY, 'true');
      } catch (e) {
        console.warn('Failed to persist dontShowAgain on explore freely:', e);
      }
    }
  }, [dontShowAgain]);

  // Reset all tour preferences (useful for testing or user re-triggering welcome flow)
  const resetTourPreferences = useCallback(() => {
    try {
      localStorage.removeItem(ONBOARDING_DONT_SHOW_KEY);
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear tour preferences:', e);
    }
    setDontShowAgainState(false);
    setIsCompletedState(false);
    setIsWelcomeOpen(true);
  }, []);

  // Listen to storage events across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ONBOARDING_DONT_SHOW_KEY) {
        setDontShowAgainState(e.newValue === 'true');
      } else if (e.key === ONBOARDING_STORAGE_KEY) {
        setIsCompletedState(e.newValue === 'true');
      } else if (e.key === VOICE_STORAGE_KEY) {
        setVoiceEnabledState(e.newValue !== 'false');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    isWelcomeOpen,
    isTourOpen,
    isOverviewOpen,
    dontShowAgain,
    voiceEnabled,
    isCompleted,
    openWelcome,
    closeWelcome,
    startTour,
    closeTour,
    watchOverview,
    closeOverview,
    exploreFreely,
    toggleDontShowAgain,
    toggleVoice,
    resetTourPreferences,
  };
}
