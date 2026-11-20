import React, { useMemo } from 'react';
import { PlayerStats } from '../types';
import { sound } from '../utils/audio';
import { getRankedLeaderboard } from '../utils/leaderboardService';
import {
  RotateCcw,
  Share2,
  ShoppingBag,
  Coins,
  Trophy,
  Tv,
  Gift,
  Check,
  HelpCircle,
  Target,
} from 'lucide-react';

interface GameOverViewProps {
  stats: PlayerStats;
  skinColor: string;
  score: number;
  highScore: number;
  coinsEarned: number;
  isNewHigh: boolean;
  bestCombo: number;
  noAdsOwned: boolean;
  coinsDoubled?: boolean;
  onPlayAgain: () => void;
  onDoubleCoins: () => void;
  onOpenShop: () => void;
  onOpenShare: () => void;
  onOpenLeaderboard: () => void;
  onOpenSpin: () => void;
  onOpenHowToPlay?: () => void;
}

export const GameOverView: React.FC<GameOverViewProps> = ({
  stats,
  skinColor,
  score,
  highScore,
  coinsEarned,
  isNewHigh,
  noAdsOwned,
  coinsDoubled = false,
  onPlayAgain,
  onDoubleCoins,
  onOpenShop,
  onOpenShare,
  onOpenLeaderboard,
  onOpenSpin,
  onOpenHowToPlay,
}) => {
  const board = useMemo(
    () => getRankedLeaderboard(stats, skinColor),
    [stats, skinColor]
  );

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-between p-5 bg-black/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between max-w-sm pt-2">
        <button
          onClick={() => {
            sound.playClick();
            onOpenSpin();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-black hover:bg-amber-900/80 transition"
        >
          <Gift className="w-3.5 h-3.5" />
          GÜNLÜK ÇARK
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onOpenLeaderboard();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-black hover:bg-cyan-900/80 transition"
        >
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          KÜRESEL #{board.userRank}
        </button>
      </div>

      {/* Main Score Centerpiece */}
      <div className="w-full max-w-sm flex flex-col items-center text-center my-auto space-y-3.5">
        {/* Record Badge */}
        {isNewHigh ? (
          <div className="flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-500 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/30 animate-bounce">
            <Trophy className="w-4 h-4 fill-zinc-950" />
            YENİ REKOR!
          </div>
        ) : (
          <span className="text-xs font-black uppercase tracking-wider text-rose-400">
            OYUN BİTTİ
          </span>
        )}

        {/* Score Number */}
        <div>
          <div className="text-7xl font-black text-white font-['Space_Grotesk'] tracking-tight drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            {score}
          </div>
          <p className="text-xs font-bold text-zinc-400">SKORUN</p>
        </div>

        {/* Mini Stats Card */}
        <div className="w-full grid grid-cols-2 gap-2.5 bg-zinc-900/90 border border-zinc-800 p-3 rounded-2xl">
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-950/50">
            <span className="text-[10px] uppercase font-bold text-zinc-400">EN YÜKSEK SKOR</span>
            <span className="text-base font-black text-amber-400">{highScore}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-950/50">
            <span className="text-[10px] uppercase font-bold text-zinc-400">KAZANILAN ALTIN</span>
            <span className="text-base font-black text-yellow-300 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 fill-yellow-400" />
              +{coinsEarned}
            </span>
          </div>
        </div>

        {/* Next Global Rival Motivator */}
        {board.nextRival ? (
          <button
            onClick={() => {
              sound.playClick();
              onOpenLeaderboard();
            }}
            className="w-full px-3 py-2 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between text-left hover:border-amber-400/60 transition"
          >
            <div className="flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px] font-bold text-zinc-200">
                Sıradaki Rakip: <strong className="text-amber-300">#{board.nextRival.rank} {board.nextRival.name}</strong>
              </span>
            </div>
            <span className="text-[11px] font-black text-amber-400 whitespace-nowrap">
              +{board.nextRival.pointsNeeded} puan!
            </span>
          </button>
        ) : (
          <div className="w-full px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 text-[11px] font-black">
            👑 Küresel Liderlik Tablosunda #1 Sırasındasın!
          </div>
        )}

        {/* Monetization Hook: 2X COINS (Watch Rewarded Ad) */}
        {coinsEarned > 0 && (
          coinsDoubled ? (
            <div className="w-full py-3 rounded-2xl bg-zinc-900 border border-emerald-500/40 text-emerald-400 font-black text-xs flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              2X ÖDÜLÜ ALINDI (+{coinsEarned} ALTIN EKLENDİ)
            </div>
          ) : (
            <button
              onClick={() => {
                sound.playCash();
                onDoubleCoins();
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Tv className="w-4 h-4 fill-zinc-950" />
              REKLAMLA 2X YAP (+{coinsEarned * 2} ALTIN KAZAN)
            </button>
          )
        )}

        {/* Main Action Buttons */}
        <div className="w-full space-y-2 pt-1">
          {/* Play Again (Primary CTA) */}
          <button
            id="play-again-btn"
            onClick={() => {
              sound.playTap();
              onPlayAgain();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 text-zinc-950 font-black text-sm shadow-xl shadow-cyan-500/30 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            TEKRAR OYNA
          </button>

          {/* Social Viral Share & Shop */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onOpenShare();
              }}
              className="py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              SKORU PAYLAŞ
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenShop();
              }}
              className="py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
              MAĞAZA
            </button>
          </div>

          {/* Quick Guide & Pro Tips Link */}
          {onOpenHowToPlay && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenHowToPlay();
              }}
              className="w-full py-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 text-xs font-bold text-zinc-300 hover:text-cyan-300 transition flex items-center justify-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              Nasıl Oynanır? & Şampiyon Taktikleri
            </button>
          )}
        </div>
      </div>

      {/* Bottom AdMob Banner Slot (Replaced by native AdMob SDK banner in Android build) */}
      {!noAdsOwned ? (
        <div className="w-full max-w-sm mt-auto">
          <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded">
                REKLAM
              </span>
              <span className="text-[11px] font-semibold text-zinc-400">
                AdMob Banner Alanı (320x50)
              </span>
            </div>
            <span className="text-[10px] font-bold text-zinc-500">Test Modu</span>
          </div>
        </div>
      ) : (
        <div className="text-[11px] font-bold text-emerald-400/80">
          ✨ Reklamsız VIP Aktif
        </div>
      )}
    </div>
  );
};
