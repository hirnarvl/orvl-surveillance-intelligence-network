import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Locale } from '../types';
import { translations, Translations, LANGUAGE_OPTIONS } from '../utils/translations';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
  languageOptions: typeof LANGUAGE_OPTIONS;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('hrvl_locale');
    if (saved === 'en' || saved === 'om' || saved === 'am') {
      return saved;
    }
    // Browser language detection
    if (typeof navigator !== 'undefined' && navigator.language) {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('am')) return 'am';
      if (browserLang.startsWith('om') || browserLang.startsWith('orm') || browserLang.startsWith('gaz')) return 'om';
    }
    return 'en';
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('hrvl_locale', newLocale);
  };

  useEffect(() => {
    localStorage.setItem('hrvl_locale', locale);
  }, [locale]);

  const currentTranslation = translations[locale] || translations.en;
  const t = useMemo<Translations>(() => {
    return new Proxy(currentTranslation, {
      get(target: any, prop: string) {
        if (prop in target && target[prop] !== undefined && target[prop] !== '') {
          return target[prop];
        }
        if (prop in translations.en) {
          return (translations.en as any)[prop];
        }
        return prop;
      }
    });
  }, [currentTranslation]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, languageOptions: LANGUAGE_OPTIONS }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
