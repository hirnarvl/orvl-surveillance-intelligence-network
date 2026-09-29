import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Smartphone, Share2 } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { useLaboratory } from '../contexts/LaboratoryContext';

interface PWAInstallBannerProps {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isDismissed: boolean;
  onInstall: () => Promise<boolean>;
  onOpenModal: () => void;
  onDismiss: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  isInstallable,
  isInstalled,
  isIOS,
  isDismissed,
  onInstall,
  onOpenModal,
  onDismiss
}) => {
  const { t } = useI18n();
  const { currentLabInfo, selectedLab } = useLaboratory();

  // Hide if already installed or dismissed recently
  if (isInstalled || isDismissed) {
    return null;
  }

  // Only show if browser supports direct install or on iOS Safari
  if (!isInstallable && !isIOS) {
    return null;
  }

  const logoSrc = (currentLabInfo?.logoUrl && currentLabInfo.logoUrl.trim() !== '')
    ? currentLabInfo.logoUrl
    : (selectedLab === 'arvl' ? 'https://lh3.googleusercontent.com/d/1ramCieRBgrY-MWZteIHalwv5vYbIy36R' : 'https://lh3.googleusercontent.com/d/1LzxKTsj6b4TO1aIyI-tAddDsR5QMYYom');
  const appTitle = selectedLab === 'arvl' 
    ? 'Install ARVL Dashboard' 
    : selectedLab === 'hrvl' 
      ? (t.installHRVLDashboard || 'Install HRVL Dashboard')
      : 'Install Regional Vet Dashboard';

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed bottom-4 right-4 z-40 max-w-sm w-[calc(100vw-2rem)] bg-slate-900/95 text-white border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md p-4 overflow-hidden"
        role="region"
        aria-label={appTitle}
      >
        {/* Glow accent */}
        <div className={`absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full blur-xl pointer-events-none ${
          selectedLab === 'arvl' ? 'bg-emerald-500/20' : 'bg-indigo-500/20'
        }`} />

        <div className="flex items-start gap-3 relative">
          {logoSrc ? (
            <img 
              src={logoSrc} 
              alt={currentLabInfo?.name || 'Laboratory Logo'} 
              className="w-11 h-11 object-contain rounded-xl p-0.5 bg-slate-950 border border-slate-700/80 shrink-0 shadow-md"
            />
          ) : null}

          <div className="flex-1 min-w-0 pr-4">
            <h4 className="text-xs font-bold text-slate-100 leading-snug">
              {appTitle}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
              {isIOS 
                ? 'Add to your Home Screen for quick offline field access.'
                : (t.installPwaDescription || 'Install for instant offline field surveillance and GIS mapping.')
              }
            </p>

            <div className="flex items-center gap-2 mt-3">
              {isInstallable ? (
                <button
                  onClick={onInstall}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-white rounded-lg text-xs font-bold shadow-sm transition-all ${
                    selectedLab === 'arvl'
                      ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700'
                      : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  {t.installNow || 'Install'}
                </button>
              ) : isIOS ? (
                <button
                  onClick={onOpenModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  How to Install
                </button>
              ) : null}

              <button
                onClick={onDismiss}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              >
                {t.notNow || 'Not now'}
              </button>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors shrink-0"
            aria-label={t.close || 'Dismiss'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};
