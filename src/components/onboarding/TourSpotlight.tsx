import React from 'react';

export interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

interface TourSpotlightProps {
  rect: SpotlightRect | null;
  borderRadius?: number;
  onClickBackdrop?: () => void;
}

export const TourSpotlight: React.FC<TourSpotlightProps> = ({
  rect,
  borderRadius = 12,
  onClickBackdrop,
}) => {
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

  return (
    <div 
      className="fixed inset-0 z-[100] pointer-events-auto transition-opacity duration-300"
      aria-hidden="true"
    >
      {/* SVG Spotlight Overlay Cutout */}
      <svg
        className="w-full h-full absolute inset-0 transition-all duration-300 pointer-events-auto"
        width={windowWidth}
        height={windowHeight}
        onClick={onClickBackdrop}
      >
        <defs>
          <mask id="tour-spotlight-mask">
            {/* White area = fully opaque backdrop */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black area = cut-out spotlight hole */}
            {rect && (
              <rect
                x={rect.left}
                y={rect.top}
                width={rect.width}
                height={rect.height}
                rx={borderRadius}
                ry={borderRadius}
                fill="black"
                className="transition-all duration-300 ease-out"
              />
            )}
          </mask>
        </defs>

        {/* Dimmed backdrop applied through mask */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.72)"
          mask="url(#tour-spotlight-mask)"
          className="backdrop-blur-[1.5px]"
        />
      </svg>

      {/* Pulsing Emerald Border Ring around Spotlight Target */}
      {rect && (
        <div
          style={{
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            borderRadius: `${borderRadius}px`,
          }}
          className="fixed pointer-events-none transition-all duration-300 ease-out border-2 border-emerald-400 dark:border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.35)] ring-4 ring-emerald-500/20 animate-pulse"
        />
      )}
    </div>
  );
};

