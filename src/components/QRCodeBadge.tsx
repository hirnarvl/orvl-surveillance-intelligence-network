import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode, ExternalLink } from 'lucide-react';

interface QRCodeBadgeProps {
  value: string;
  size?: number;
  className?: string;
  title?: string;
  ariaLabel?: string;
  showScanLabel?: boolean;
}

export const QRCodeBadge: React.FC<QRCodeBadgeProps> = ({
  value,
  size = 64,
  className = '',
  title = 'Scan to view Developer Profile',
  ariaLabel = 'QR Code linking to Developer Profile',
  showScanLabel = false,
}) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(value, {
      width: size * 2, // 2x for retina/crispness
      margin: 1,
      color: {
        dark: '#0f172a', // slate-900
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => {
        if (isMounted && url) setDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate QR code', err);
      });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  return (
    <div 
      className={`relative group inline-flex flex-col items-center justify-center ${className}`}
      title={title}
    >
      <div 
        className="p-1.5 bg-white rounded-xl border-2 border-amber-400/90 shadow-md shadow-amber-500/10 ring-2 ring-emerald-500/20 group-hover:scale-105 group-hover:border-amber-300 transition-all duration-200 cursor-pointer overflow-hidden flex items-center justify-center"
        style={{ width: size + 12, height: size + 12 }}
      >
        {dataUrl && dataUrl.trim() !== '' ? (
          <img 
            src={dataUrl} 
            alt={ariaLabel} 
            className="w-full h-full object-contain rounded-lg"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-700">
            <QrCode className="w-6 h-6 animate-pulse" />
          </div>
        )}
      </div>

      {showScanLabel && (
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider flex items-center gap-0.5">
          <span>Scan QR</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </span>
      )}
    </div>
  );
};
