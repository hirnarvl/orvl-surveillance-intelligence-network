import React from 'react';
import { Globe } from 'lucide-react';
import { Locale } from '../../types';
import { soundEngine } from '../../utils/sound';

interface TourLanguageSelectorProps {
  currentLocale: Locale;
  onSelectLocale: (locale: Locale) => void;
  size?: 'sm' | 'md';
  variant?: 'pills' | 'select';
}

const LANGUAGES: { code: Locale; label: string; native: string; flag: string }[] = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'am', label: 'Amharic', native: 'አማርኛ', flag: '🇪🇹' },
  { code: 'om', label: 'Afaan Oromo', native: 'Afaan Oromoo', flag: '🌳' },
];

export const TourLanguageSelector: React.FC<TourLanguageSelectorProps> = ({
  currentLocale,
  onSelectLocale,
  size = 'sm',
  variant = 'pills'
}) => {
  if (variant === 'select') {
    return (
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
        <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
        <select
          aria-label="Select Narration Language"
          value={currentLocale}
          onChange={(e) => {
            soundEngine.playClick();
            onSelectLocale(e.target.value as Locale);
          }}
          className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-2"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="dark:bg-slate-900 text-slate-900 dark:text-white">
              {lang.native} ({lang.label})
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80">
      {LANGUAGES.map((lang) => {
        const isSelected = currentLocale === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onSelectLocale(lang.code);
            }}
            className={`
              flex items-center gap-1.5 rounded-lg font-bold transition-all cursor-pointer select-none
              ${size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'}
              ${isSelected
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }
            `}
            title={`Switch language to ${lang.label}`}
          >
            <span>{lang.native}</span>
          </button>
        );
      })}
    </div>
  );
};
