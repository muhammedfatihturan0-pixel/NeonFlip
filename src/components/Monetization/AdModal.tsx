import React, { useState, useEffect } from 'react';
import { AdModalConfig } from '../../types';
import { sound } from '../../utils/audio';
import { CheckCircle2, ShieldCheck, Tv, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdModalProps {
  config: AdModalConfig;
  onRewardClaimed: () => void;
  onDismiss: () => void;
}

export const AdModal: React.FC<AdModalProps> = ({ config, onRewardClaimed, onDismiss }) => {
  const isInterstitial = config.type === 'INTERSTITIAL';
  const [timeLeft, setTimeLeft] = useState(config.durationSeconds || 5);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    sound.playTap();
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCompleted(true);
          if (!isInterstitial) {
            sound.playCash();
            try {
              confetti({
                particleCount: 45,
                spread: 60,
                origin: { y: 0.6 },
              });
            } catch {
              // Safe fallback
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isInterstitial]);

  const handleClaim = () => {
    sound.playCash();
    onRewardClaimed();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Top Ad Network Banner */}
        <div className="bg-zinc-950 px-4 py-2.5 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black px-1.5 py-0.5 rounded tracking-wide">
              {isInterstitial ? 'GEÇİŞ REKLAMI' : 'ÖDÜLLÜ REKLAM'}
            </span>
            <span className="text-[11px] font-semibold text-zinc-400">AdMob Test</span>
          </div>

          <div className="flex items-center gap-2">
            {!completed ? (
              <div className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/50">
                {timeLeft} sn
              </div>
            ) : (
              <button
                id="close-ad-btn"
                onClick={isInterstitial ? handleClaim : onDismiss}
                className="p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                aria-label="Reklamı Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Ad Content Placeholder (Replaced by native Google Mobile Ads SDK on Android) */}
        <div className="relative bg-gradient-to-br from-slate-900 via-zinc-950 to-cyan-950/40 p-6 flex flex-col items-center justify-center text-center min-h-[240px]">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-4">
            <Tv className="w-8 h-8 text-cyan-400" />
          </div>

          <h3 className="text-lg font-black text-white tracking-tight mb-1.5">
            {isInterstitial ? 'Reklam Gösteriliyor' : 'Ödüllü Video Reklam'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
            {isInterstitial
              ? 'Google Play Android derlemesinde bu alanda gerçek AdMob geçiş reklamı gösterilir.'
              : 'Reklam tamamlandığında ödülün hesabına otomatik aktarılır. Android derlemesinde gerçek AdMob ödüllü videosu oynatılır.'}
          </p>
        </div>

        {/* Ad Reward Status & Claim Action */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-zinc-200">{config.title}</span>
            </div>
            <span className="text-xs font-semibold text-emerald-400">
              {config.rewardDescription}
            </span>
          </div>

          {completed ? (
            <button
              id="claim-reward-btn"
              onClick={handleClaim}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-zinc-950 font-black text-sm shadow-xl shadow-amber-500/25 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              {isInterstitial ? 'DEVAM ET' : 'ÖDÜLÜ AL!'}
            </button>
          ) : (
            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-1000 ease-linear"
                style={{
                  width: `${((config.durationSeconds - timeLeft) / config.durationSeconds) * 100}%`,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
