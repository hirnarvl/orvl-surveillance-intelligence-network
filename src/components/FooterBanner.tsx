import React, { useState, useEffect } from 'react';
import { Info, X } from 'lucide-react';
import { soundEngine } from '../utils/sound';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../contexts/I18nContext';

interface FooterBannerProps {
  onOpenExternalResources?: () => void;
}

/** Official reactive Telegram brand icon */
const TelegramIcon: React.FC<{ className?: string }> = ({ className = 'w-11 h-11 sm:w-12 sm:h-12' }) => (
  <svg
    className={`${className} drop-shadow-sm`}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="12" fill="#24A1DE" />
    <path
      d="M17.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.196 1.006.128.832.941z"
      fill="#ffffff"
    />
  </svg>
);

/** Single compact horizontal contact row: [Developer QR Code] [Telegram icon → rvlAsella] [Telegram icon → Adnis2025] */
const DeveloperContactRow: React.FC<{ t: any }> = ({ t }) => (
  <div className="flex items-center gap-4 sm:gap-5 flex-nowrap py-1">
    {/* 1. Developer QR Code */}
    <a
      href="https://henokabebet.link/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.footerDeveloperQrLabel || "Developer Profile QR Code"}
      title={t.footerDeveloperQrLabel || "Developer Profile QR Code"}
      onClick={() => soundEngine.playClick()}
      className="shrink-0 p-1 bg-white rounded-xl border border-white/20 shadow-md hover:scale-105 active:scale-95 transition-transform duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c14e] block"
    >
      <img
        src="/gravatar-qr.svg"
        alt={t.footerDeveloperQrLabel || "Developer Profile QR Code"}
        className="w-11 h-11 sm:w-12 sm:h-12 object-contain rounded-lg"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/gravatar-qr.png';
        }}
      />
    </a>

    {/* 2. Telegram channel: Asella RVL */}
    <a
      href="https://t.me/rvlAsella"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.footerTelegramAsellaLabel || "Telegram channel: Asella RVL"}
      title={t.footerTelegramAsellaLabel || "Telegram channel: Asella RVL"}
      onClick={() => soundEngine.playClick()}
      className="shrink-0 rounded-full transition-transform duration-200 hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c14e] shadow-md hover:shadow-cyan-500/25"
    >
      <TelegramIcon />
    </a>

    {/* 3. Telegram channel: ADNIS */}
    <a
      href="https://t.me/Adnis2025"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.footerTelegramAdnisLabel || "Telegram channel: ADNIS"}
      title={t.footerTelegramAdnisLabel || "Telegram channel: ADNIS"}
      onClick={() => soundEngine.playClick()}
      className="shrink-0 rounded-full transition-transform duration-200 hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c14e] shadow-md hover:shadow-cyan-500/25"
    >
      <TelegramIcon />
    </a>
  </div>
);

export const FooterBanner: React.FC<FooterBannerProps> = () => {
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const { locale, t } = useI18n();

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAboutOpen) {
        setIsAboutOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAboutOpen]);

  const platformDescription = t.footerPlatformDescription || (locale === 'om'
    ? "Waltajjiin kun qorannoo dhibee beeyladootaa, qorannoo laabraatoorii beeyladootaa, ekispartiizii falaasamaa, gabaasa, qaaccessa fi murtee fayyaa beeyladootaa ragaa irratti hundaa'eef naannoo dijitaalaa walitti qindaa'e dhiyeessa."
    : locale === 'am'
    ? "ይህ መድረክ በእንስሳት በሽታ ክትትል፣ በእንስሳት ህክምና ላቦራቶሪ ምርመራ፣ በመስክ ኤፒዲሚዮሎጂ፣ በሪፖርት አቀራረብ እና በመረጃ ላይ በተመሰረተ የእንስሳት ጤና ውሳኔ አሰጣጥ ላይ የተቀናጀ ዲጂታል አሰራርን ያቀርባል።"
    : "This portal provides an integrated digital environment for animal disease surveillance, veterinary laboratory diagnostics, field epidemiology, reporting, analytics and evidence-based animal health decision support across regional veterinary laboratories in Oromia.");

  return (
    <footer className="w-full text-[#eafaf5] font-sans overflow-hidden mt-12 border-t border-white/10">
      {/* Section 1: About this platform with justified text alignment */}
      <div className="bg-[#0e3d3a] p-[16px_20px] sm:p-[20px_28px]">
        <div className="max-w-[760px]">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <h3 className="text-[13.5px] font-bold text-[#f2c14e] tracking-[0.2px] flex items-center gap-2 m-0">
              <Info className="w-4 h-4 text-[#f2c14e] shrink-0" />
              <span>{t.footerAboutTitle || 'About this platform'}</span>
            </h3>
            <button 
              className="inline-flex items-center gap-1.5 bg-transparent border border-white/20 text-[#eafaf5] text-[11.5px] font-medium p-[3px_10px] rounded-full cursor-pointer hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c14e]"
              aria-haspopup="dialog"
              aria-expanded={isAboutOpen}
              onClick={() => {
                soundEngine.playClick();
                setIsAboutOpen(true);
              }}
            >
              <span>{t.footerExpandedView || 'Expanded view'}</span>
            </button>
          </div>
          <p className="text-[12.5px] leading-[1.65] text-[#bfe3d8] m-0 text-justify">
            {platformDescription}
          </p>
        </div>
      </div>

      {/* Section 2: Combined Developer Contact and Data Confidentiality & Legal Disclaimer in ONE SECTION */}
      <section 
        aria-label={t.footerCombinedSectionTitle || "Data Confidentiality, Legal Disclaimer & Developer Contact"}
        className="bg-[#0b3330] p-[16px_20px] sm:p-[20px_28px] border-t border-white/12"
      >
        <div className="max-w-[760px] space-y-3.5">
          {/* Section Header */}
          <div className="flex items-center gap-[10px] flex-wrap">
            <svg className="w-[19px] h-[19px] shrink-0 text-[#f2c14e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            <span className="text-[13.5px] font-bold text-[#eafaf5] mr-auto tracking-[0.2px]">
              {t.footerCombinedSectionTitle || 'Data Confidentiality, Legal Disclaimer & Developer Contact'}
            </span>
          </div>

          {/* Legal Disclaimer & Data Governance Paragraphs (Justified Text) */}
          <div className="pt-2 border-t border-white/5 text-[12.5px] leading-[1.65] text-[#bfe3d8] space-y-2.5">
            <p className="m-0 text-justify">
              {t.footerLegalDisclaimer}
            </p>
            <p className="m-0 text-justify">
              <strong className="text-[#eafaf5]">{t.footerNetworkSyncLabel} </strong>
              {t.footerNetworkSyncText}
            </p>
            <p className="m-0 text-justify">
              <strong className="text-[#eafaf5]">{t.footerPrivacyComplianceLabel} </strong>
              {t.footerPrivacyComplianceText}
            </p>
          </div>

          {/* Unified Developer Contact Block (Inside this same section) */}
          <div className="pt-3.5 border-t border-white/10">
            <h4 className="text-[13.5px] font-bold text-[#f2c14e] tracking-[0.2px] mb-2.5 m-0">
              {t.footerDeveloperContactTitle || 'Developer contact'}
            </h4>
            <DeveloperContactRow t={t} />
          </div>
        </div>
      </section>

      {/* Expanded About & Legal Modal */}
      <AnimatePresence>
        {isAboutOpen && (
          <div 
            className="fixed inset-0 bg-[#060e0d]/60 flex items-center justify-center p-5 z-[1000]"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsAboutOpen(false);
            }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0e3d3a] text-[#eafaf5] w-full max-w-[500px] max-h-[85vh] overflow-y-auto rounded-[14px] p-[22px_22px_20px] relative shadow-[0_20px_60px_rgba(0,0,0,0.45)] border border-white/10 custom-scrollbar"
              role="dialog"
              aria-modal="true"
            >
              <button 
                className="absolute top-2.5 right-2.5 bg-transparent border-none text-[#bfe3d8] hover:text-[#eafaf5] text-[22px] leading-none cursor-pointer p-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c14e] rounded-md"
                aria-label={t.footerClose || "Close about dialog"}
                onClick={() => {
                  soundEngine.playClick();
                  setIsAboutOpen(false);
                }}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4 pt-1">
                {/* Section 1: About this platform */}
                <div>
                  <h3 className="m-[0_0_8px_0] text-[15px] font-bold text-[#f2c14e] flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#f2c14e] shrink-0" />
                    <span>{t.footerAboutTitle || 'About this platform'}</span>
                  </h3>
                  <p className="m-0 text-[13px] leading-[1.65] text-[#bfe3d8] text-justify">
                    {platformDescription}
                  </p>
                </div>

                {/* Section 2: Combined Developer Contact & Data Confidentiality/Disclaimer in ONE SECTION */}
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <h4 className="m-[0_0_6px_0] text-[13.5px] font-bold text-[#f2c14e]">
                    {t.footerCombinedSectionTitle || 'Data Confidentiality, Legal Disclaimer & Developer Contact'}
                  </h4>
                  
                  <p className="m-0 text-[12.5px] leading-[1.65] text-[#bfe3d8] text-justify">
                    {t.footerLegalDisclaimer}
                  </p>

                  <p className="m-0 text-[12.5px] leading-[1.65] text-[#bfe3d8] text-justify">
                    <strong className="text-[#eafaf5]">{t.footerNetworkSyncLabel} </strong>
                    {t.footerNetworkSyncText}
                  </p>

                  <p className="m-0 text-[12.5px] leading-[1.65] text-[#bfe3d8] text-justify">
                    <strong className="text-[#eafaf5]">{t.footerPrivacyComplianceLabel} </strong>
                    {t.footerPrivacyComplianceText}
                  </p>

                  <div className="pt-2.5 border-t border-white/10">
                    <h5 className="m-[0_0_8px_0] text-[12.5px] font-semibold text-[#f2c14e]">
                      {t.footerDeveloperContactTitle || 'Developer contact'}
                    </h5>
                    <DeveloperContactRow t={t} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
};
