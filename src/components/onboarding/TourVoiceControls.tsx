import React from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw } from 'lucide-react';
import { SpeechState } from '../../services/voiceService';
import { soundEngine } from '../../utils/sound';
import { useI18n } from '../../contexts/I18nContext';

interface TourVoiceControlsProps {
  voiceEnabled: boolean;
  speechState: SpeechState;
  speechRate: number;
  onToggleVoice: (enabled: boolean) => void;
  onPlay: () => void;
  onPause: () => void;
  onReplay: () => void;
  onChangeRate: (rate: number) => void;
  compact?: boolean;
}

export const TourVoiceControls: React.FC<TourVoiceControlsProps> = ({
  voiceEnabled,
  speechState,
  speechRate,
  onToggleVoice,
  onPlay,
  onPause,
  onReplay,
  onChangeRate,
  compact = false
}) => {
  const { t } = useI18n();
  const isPlaying = speechState === 'playing';
  const isPaused = speechState === 'paused';

  return (
    <div className={`flex flex-wrap items-center justify-between gap-2 ${compact ? 'text-xs' : 'text-xs'}`}>
      {/* Left: Voice On/Off Toggle & Speaking Indicator */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onToggleVoice(!voiceEnabled);
          }}
          aria-label={voiceEnabled ? 'Mute voice narration' : 'Enable voice narration'}
          className={`
            flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer
            ${voiceEnabled
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }
          `}
        >
          {voiceEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{t.tourVoiceOn || 'Voice On'}</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{t.tourVoiceOff || 'Voice Off'}</span>
            </>
          )}
        </button>

        {/* Pulsing Audio Wave indicator when actively speaking */}
        {voiceEnabled && isPlaying && (
          <div className="flex items-center gap-0.5 px-1.5 py-1 bg-emerald-100 dark:bg-emerald-900/60 rounded-lg text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
            <span className="w-1 h-3 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1 h-4 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1 h-2 bg-emerald-500 rounded-full animate-bounce" />
            <span className="ml-1 hidden sm:inline">{t.tourSpeakingStatus || 'Speaking'}</span>
          </div>
        )}
      </div>

      {/* Right: Play / Pause / Replay / Speed controls */}
      {voiceEnabled && (
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80">
          {isPlaying ? (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onPause();
              }}
              aria-label="Pause voice narration"
              title="Pause Voice (Space)"
              className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onPlay();
              }}
              aria-label="Play voice narration"
              title="Play Voice (Space)"
              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onReplay();
            }}
            aria-label="Replay voice narration"
            title="Replay Voice (R)"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Speed Toggle (0.8x, 1.0x, 1.2x) */}
          <div className="flex items-center gap-0.5 pl-1 border-l border-slate-300 dark:border-slate-700">
            {[0.8, 1.0, 1.2].map((rate) => {
              const isSelected = Math.abs(speechRate - rate) < 0.05;
              return (
                <button
                  key={rate}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onChangeRate(rate);
                  }}
                  className={`
                    px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer
                    ${isSelected
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }
                  `}
                  title={`Set voice speed to ${rate}x`}
                >
                  {rate}x
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
