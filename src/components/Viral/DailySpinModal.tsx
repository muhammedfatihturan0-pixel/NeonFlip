import React, { useState } from 'react';
import { PlayerStats } from '../../types';
import { sound } from '../../utils/audio';
import { Gift, Coins, Gem, Sparkles, Tv, ArrowLeft, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailySpinModalProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  onWatchAdForExtraSpin: () => void;
  onClose: () => void;
}

interface WheelSegment {
  label: string;
  type: 'coins' | 'gems' | 'jackpot';
  amount: number;
  color: string;
}

const SEGMENTS: WheelSegment[] = [
  { label: '50 ALTIN', type: 'coins', amount: 50, color: '#0284c7' },
  { label: '3 ELMAS', type: 'gems', amount: 3, color: '#9333ea' },
  { label: '150 ALTIN', type: 'coins', amount: 150, color: '#059669' },
  { label: 'BÜYÜK 500', type: 'jackpot', amount: 500, color: '#eab308' },
  { label: '8 ELMAS', type: 'gems', amount: 8, color: '#db2777' },
  { label: '250 ALTIN', type: 'coins', amount: 250, color: '#ea580c' },
];

export const DailySpinModal: React.FC<DailySpinModalProps> = ({
  stats,
  onUpdateStats,
  onWatchAdForExtraSpin,
  onClose,
}) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<WheelSegment | null>(null);

  // Check if daily spin is available (24h cooldown, or free on first launch)
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const canFreeSpin = now - stats.lastSpinTimestamp > oneDayMs;

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setWonPrize(null);

    sound.playTap();

    // Pick random winning segment
    const winningIndex = Math.floor(Math.random() * SEGMENTS.length);
    const segmentAngle = 360 / SEGMENTS.length;
    // Calculate target angle to land on segment
    const extraRounds = 5 * 360;
    const targetAngle = extraRounds + (360 - winningIndex * segmentAngle - segmentAngle / 2);

    setRotation((prev) => prev + targetAngle);

    // Tick audio
    let ticks = 0;
    const tickInterval = setInterval(() => {
      sound.playSpinTick();
      ticks++;
      if (ticks > 25) clearInterval(tickInterval);
    }, 120);

    setTimeout(() => {
      clearInterval(tickInterval);
      setSpinning(false);
      const prize = SEGMENTS[winningIndex];
      setWonPrize(prize);
      sound.playCash();

      try {
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
      } catch {
        // safe
      }

      // Update stats
      if (prize.type === 'gems') {
        onUpdateStats({
          ...stats,
          totalGems: stats.totalGems + prize.amount,
          lastSpinTimestamp: Date.now(),
        });
      } else {
        onUpdateStats({
          ...stats,
          totalCoins: stats.totalCoins + prize.amount,
          lastSpinTimestamp: Date.now(),
        });
      }
    }, 3600);
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-zinc-950 text-white animate-in fade-in duration-200">
      {/* Header */}
      <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          GERİ
        </button>

        <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
          <Gift className="w-4 h-4" />
          GÜNLÜK ŞANS ÇARKI
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center max-w-sm mx-auto w-full text-center">
        <h3 className="text-xl font-black text-white mb-1">Şansını Dene & Kazan!</h3>
        <p className="text-xs text-zinc-400 mb-6">Her gün ücretsiz çevir veya reklam izleyerek ödül katla!</p>

        {/* The Wheel Container */}
        <div className="relative w-64 h-64 mb-6">
          {/* Wheel Pointer */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 filter drop-shadow-md" />

          {/* Rotating Canvas Wheel */}
          <div
            className="w-full h-full rounded-full border-4 border-zinc-700 shadow-2xl relative overflow-hidden transition-transform ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionDuration: spinning ? '3.5s' : '0s',
            }}
          >
            {SEGMENTS.map((seg, idx) => {
              const deg = (360 / SEGMENTS.length) * idx;
              return (
                <div
                  key={idx}
                  className="absolute w-full h-full flex items-center justify-center font-black text-[11px] text-white select-none"
                  style={{
                    backgroundColor: seg.color,
                    clipPath: 'polygon(50% 50%, 0% 0%, 100% 0%)',
                    transform: `rotate(${deg}deg)`,
                    transformOrigin: '50% 50%',
                  }}
                >
                  <span className="relative -top-16 font-extrabold tracking-tight drop-shadow-md">
                    {seg.label}
                  </span>
                </div>
              );
            })}

            {/* Center Core Cap */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-zinc-900 border-2 border-amber-400 flex items-center justify-center shadow-lg z-10">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Won Prize Banner */}
        {wonPrize && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300 font-black text-sm flex items-center justify-center gap-2 animate-bounce">
            <Check className="w-4 h-4" />
            Tebrikler! +{wonPrize.amount} {wonPrize.type === 'gems' ? 'Elmas' : 'Altın'} Kazandın!
          </div>
        )}

        {/* Spin Actions */}
        <div className="w-full space-y-2.5">
          {canFreeSpin ? (
            <button
              disabled={spinning}
              onClick={handleSpin}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-zinc-950 font-black text-sm shadow-xl shadow-amber-500/25 hover:brightness-110 active:scale-95 transition disabled:opacity-50"
            >
              {spinning ? 'ÇEVRİLİYOR...' : 'ÜCRETSİZ ÇEVİR (1 HAK)'}
            </button>
          ) : (
            <button
              disabled={spinning}
              onClick={onWatchAdForExtraSpin}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-sm shadow-xl shadow-blue-500/25 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Tv className="w-4 h-4" />
              REKLAM İZLE & TEKRAR ÇEVİR
            </button>
          )}

          <p className="text-[11px] text-zinc-500 font-semibold">
            {canFreeSpin ? 'Günlük ücretsiz hak hazır!' : 'Günlük hak kullanıldı. Reklam izleyerek sınırsız çevir!'}
          </p>
        </div>
      </div>
    </div>
  );
};
