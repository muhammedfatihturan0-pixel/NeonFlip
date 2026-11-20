import React, { useMemo } from 'react';
import { Skin, PlayerStats } from '../types';
import { sound } from '../utils/audio';
import { getRankedLeaderboard } from '../utils/leaderboardService';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Play,
  ShoppingBag,
  Gift,
  Trophy,
  Volume2,
  VolumeX,
  Vibrate,
  Coins,
  Gem,
  HelpCircle,
  BookOpen,
  User,
  Edit3,
  Target,
} from 'lucide-react';

interface StartMenuViewProps {
  stats: PlayerStats;
  selectedSkin: Skin;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  onToggleSound: () => void;
  onToggleHaptics: () => void;
  onStartGame: () => void;
  onOpenShop: () => void;
  onOpenSpin: () => void;
  onOpenLeaderboard: () => void;
  onOpenHowToPlay: () => void;
  onEditPlayerName: () => void;
}

export const StartMenuView: React.FC<StartMenuViewProps> = ({
  stats,
  selectedSkin,
  soundEnabled,
  hapticsEnabled,
  onToggleSound,
  onToggleHaptics,
  onStartGame,
  onOpenShop,
  onOpenSpin,
  onOpenLeaderboard,
  onOpenHowToPlay,
  onEditPlayerName,
}) => {
  const board = useMemo(
    () => getRankedLeaderboard(stats, selectedSkin.color),
    [stats, selectedSkin.color]
  );

  const displayName = stats.isGuest ? 'Misafir' : stats.playerName || 'Misafir';

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-between p-5 bg-gradient-to-b from-[#070b14] via-zinc-900 to-[#05070c]">
      {/* Top Header: Currencies & Settings */}
      <div className="w-full max-w-sm flex items-center justify-between pt-1">
        {/* Currencies */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-500/30 text-amber-300 text-xs font-black">
            <Coins className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {stats.totalCoins}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/30 text-purple-300 text-xs font-black">
            <Gem className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
            {stats.totalGems}
          </div>
        </div>

        {/* Audio / Haptic Toggles & How to Play */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sound.playClick();
              onOpenHowToPlay();
            }}
            className="p-2 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 transition"
            title="Nasıl Oynanır?"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
            title="Ses"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-500" />
            )}
          </button>
          <button
            onClick={onToggleHaptics}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
            title="Titreşim"
          >
            <Vibrate className={`w-4 h-4 ${hapticsEnabled ? 'text-amber-400' : 'text-zinc-500'}`} />
          </button>
        </div>
      </div>

      {/* Center Branding & Character Preview */}
      <div className="w-full max-w-sm flex flex-col items-center text-center my-auto space-y-3.5">
        {/* App Emblem + Unique Play Store Brand Title */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/30 border border-cyan-400/40 mb-2.5">
            <img
              src="/pwa-192x192.png"
              alt="ZYPHOR"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-5xl font-black tracking-wider text-white font-['Space_Grotesk'] drop-shadow-[0_0_25px_rgba(6,182,212,0.55)]">
            ZYPHOR
          </h1>
          <p className="text-xs font-bold tracking-[0.3em] text-cyan-400 uppercase mt-0.5">
            GRAVITY SHIFT
          </p>
        </div>

        {/* Active Player Profile & Skin Pill */}
        <div className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shrink-0"
              style={{
                backgroundColor: selectedSkin.color,
                boxShadow: `0 0 16px ${selectedSkin.glowColor}`,
              }}
            >
              <div className="w-3 h-3 rounded-full bg-white" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <User className="w-3 h-3 text-cyan-400" />
                <span className="text-xs font-black text-white">{displayName}</span>
                {stats.isGuest && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    MİSAFİR
                  </span>
                )}
              </div>
              <p className="text-[10px] font-bold text-amber-400">
                🏆 Rekor: {stats.highScore} • Küresel Sıra: #{board.userRank}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onEditPlayerName();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-cyan-300 text-[11px] font-bold transition active:scale-95"
            title="Oyuncu Adını Düzenle"
          >
            <Edit3 className="w-3 h-3" />
            {stats.isGuest ? 'İsim Seç' : 'Düzenle'}
          </button>
        </div>

        {/* Primary Play Button */}
        <button
          id="play-game-button"
          onClick={() => {
            sound.playTap();
            onStartGame();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-zinc-950 font-black text-lg tracking-wider shadow-2xl shadow-cyan-500/35 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-zinc-950" />
          BAŞLA (TEK DOKUNUŞ)
        </button>

        {/* How to Play Guide Prompt Button */}
        <button
          id="how-to-play-button"
          onClick={() => {
            sound.playClick();
            onOpenHowToPlay();
          }}
          className="w-full py-2.5 px-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-cyan-500/40 hover:border-cyan-400/80 text-cyan-300 text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          Nasıl Oynanır? (Kontroller & Taktikler)
        </button>

        {/* Quick Nav Grid */}
        <div className="w-full grid grid-cols-4 gap-1.5 pt-1">
          <button
            onClick={() => {
              sound.playClick();
              onOpenShop();
            }}
            className="p-2.5 rounded-2xl bg-zinc-800/90 hover:bg-zinc-700/90 border border-zinc-700/60 flex flex-col items-center justify-center gap-1 transition active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] font-black text-zinc-200">MAĞAZA</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenSpin();
            }}
            className="p-2.5 rounded-2xl bg-zinc-800/90 hover:bg-zinc-700/90 border border-zinc-700/60 flex flex-col items-center justify-center gap-1 transition active:scale-95"
          >
            <Gift className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-black text-zinc-200">ÇARK</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenLeaderboard();
            }}
            className="p-2.5 rounded-2xl bg-zinc-800/90 hover:bg-zinc-700/90 border border-zinc-700/60 flex flex-col items-center justify-center gap-1 transition active:scale-95"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-[10px] font-black text-zinc-200">LİDER</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenHowToPlay();
            }}
            className="p-2.5 rounded-2xl bg-zinc-800/90 hover:bg-zinc-700/90 border border-zinc-700/60 flex flex-col items-center justify-center gap-1 transition active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-black text-zinc-200">REHBER</span>
          </button>
        </div>

        {/* Mobile PWA Install Button (Visible when installable on Android/iOS) */}
        <div className="flex justify-center pt-0.5">
          <PWAInstallButton />
        </div>
      </div>

      {/* Bottom Global Rival Challenge Card */}
      <div className="w-full max-w-sm">
        <button
          onClick={() => {
            sound.playClick();
            onOpenLeaderboard();
          }}
          className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-950/60 via-zinc-900 to-zinc-900 border border-amber-500/35 hover:border-amber-400 text-left flex items-center justify-between transition shadow-lg"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              {board.nextRival ? (
                <>
                  <p className="text-xs font-black text-amber-300">
                    Sıradaki Rakip: #{board.nextRival.rank} {board.nextRival.name}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    Geçmek için {board.nextRival.score + 1} puana ulaş (+{board.nextRival.pointsNeeded} puan)
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-black text-amber-300">
                    👑 Küresel Lider: {displayName}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    Zirvedesin! Yeni rekor kırarak yerini sağlamlaştır
                  </p>
                </>
              )}
            </div>
          </div>
          <span className="text-xs font-bold text-amber-400">Sıralama →</span>
        </button>
      </div>
    </div>
  );
};
