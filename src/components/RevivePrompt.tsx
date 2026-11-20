import React, { useEffect, useState, useRef } from 'react';
import { sound } from '../utils/audio';
import { Tv, Shield } from 'lucide-react';

interface RevivePromptProps {
  score: number;
  onWatchAdRevive: () => void;
  onSkipRevive: () => void;
}

export const RevivePrompt: React.FC<RevivePromptProps> = ({
  score,
  onWatchAdRevive,
  onSkipRevive,
}) => {
  const [seconds, setSeconds] = useState(5);
  const [adTriggered, setAdTriggered] = useState(false);
  const timerRef = useRef<number | null>(null);
  const onSkipRef = useRef(onSkipRevive);
  const skippedRef = useRef(false);

  onSkipRef.current = onSkipRevive;

  useEffect(() => {
    sound.playTap();
    timerRef.current = window.setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        sound.playClick();
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Safely trigger skip outside state updater when countdown reaches 0
  useEffect(() => {
    if (seconds === 0 && !adTriggered && !skippedRef.current) {
      skippedRef.current = true;
      onSkipRef.current();
    }
  }, [seconds, adTriggered]);

  const handleWatch = () => {
    if (adTriggered || skippedRef.current) return;
    setAdTriggered(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    sound.playCash();
    onWatchAdRevive();
  };

  const handleSkip = () => {
    if (adTriggered || skippedRef.current) return;
    skippedRef.current = true;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    sound.playClick();
    onSkipRef.current();
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-xs rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-cyan-500/40 p-6 flex flex-col items-center text-center shadow-2xl">
        {/* Animated Countdown Circle */}
        <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#27272a"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#06b6d4"
              strokeWidth="6"
              strokeDasharray="251.2"
              strokeDashoffset={`${251.2 * (1 - seconds / 5)}`}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <span className="absolute text-4xl font-black text-white font-mono">{seconds}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-black text-cyan-400 mb-1">
          <Shield className="w-4 h-4 text-cyan-400" />
          İKİNCİ ŞANS!
        </div>
        <h3 className="text-xl font-black text-white mb-1">Kaldığın Yerden Devam Et</h3>
        <p className="text-xs text-zinc-400 mb-5">
          {score} puandasın! Kısa bir reklam izle ve kalkanla yeniden canlan!
        </p>

        {/* Watch Ad Revive Button */}
        <button
          onClick={handleWatch}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 text-zinc-950 font-black text-sm shadow-xl shadow-cyan-500/30 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 mb-3"
        >
          <Tv className="w-4 h-4 fill-zinc-950" />
          CANLAN (REKLAM İZLE)
        </button>

        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="text-xs font-bold text-zinc-500 hover:text-zinc-300 py-1 transition"
        >
          Hayır, Oyunu Bitir
        </button>
      </div>
    </div>
  );
};
