import React, { useState, useMemo } from 'react';
import { PlayerStats, DailyQuest } from '../types';
import { sound } from '../utils/audio';
import { getRankedLeaderboard } from '../utils/leaderboardService';
import {
  Trophy,
  CheckCircle2,
  ArrowLeft,
  Coins,
  Gem,
  Award,
  Edit3,
  Target,
  User,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LeaderboardModalProps {
  stats: PlayerStats;
  skinColor: string;
  quests: DailyQuest[];
  onClaimQuest: (questId: string) => void;
  onEditName: () => void;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  stats,
  skinColor,
  quests,
  onClaimQuest,
  onEditName,
  onClose,
}) => {
  const [tab, setTab] = useState<'ranks' | 'quests'>('ranks');

  const board = useMemo(
    () => getRankedLeaderboard(stats, skinColor),
    [stats, skinColor]
  );

  const displayName = stats.isGuest ? 'Misafir' : stats.playerName || 'Misafir';
  const userEntry = board.entries.find((e) => e.isUser);

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

        <div className="flex items-center gap-1.5 text-xs font-black text-yellow-400">
          <Trophy className="w-4 h-4" />
          KÜRESEL LİDERLİK & GÖREVLER
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 p-2 bg-zinc-900/60 border-b border-zinc-800 gap-1.5">
        <button
          onClick={() => {
            sound.playClick();
            setTab('ranks');
          }}
          className={`py-2 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
            tab === 'ranks'
              ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          KÜRESEL SIRALAMA
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setTab('quests');
          }}
          className={`py-2 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
            tab === 'quests'
              ? 'bg-cyan-400 text-zinc-950 shadow-md shadow-cyan-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          GÜNLÜK GÖREVLER
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-w-md mx-auto w-full">
        {tab === 'ranks' && (
          <div className="space-y-2.5">
            {/* Player Rank & Name Card */}
            <div className="p-3.5 rounded-2xl bg-cyan-950/50 border border-cyan-500/40 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-cyan-400 text-zinc-950 font-black text-xs flex items-center justify-center shadow-md shadow-cyan-500/30">
                    #{board.userRank}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-black text-white">{displayName}</p>
                      {stats.isGuest && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          MİSAFİR
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-cyan-300 font-bold">
                      {userEntry?.badge || '🌱 ÇAYLAK'} • Rekorun: {stats.highScore} Puan
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    onEditName();
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold transition active:scale-95"
                >
                  <Edit3 className="w-3 h-3" />
                  {stats.isGuest ? 'İsim Seç' : 'Değiştir'}
                </button>
              </div>

              {/* Next Rival To Beat Target */}
              {board.nextRival ? (
                <div className="px-3 py-2 rounded-xl bg-zinc-950/70 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-[11px] font-bold text-zinc-300">
                      Sıradaki Hedef:{' '}
                      <strong className="text-white">
                        #{board.nextRival.rank} {board.nextRival.name}
                      </strong>
                    </span>
                  </div>
                  <span className="text-[11px] font-black text-amber-400 whitespace-nowrap">
                    +{board.nextRival.pointsNeeded} puan geç!
                  </span>
                </div>
              ) : (
                <div className="px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 text-[11px] font-black text-center">
                  👑 ZİRVEDESİN! Dünya #1 koltuğunu koru!
                </div>
              )}
            </div>

            {/* Global Leaderboard List */}
            <div className="space-y-2">
              {board.entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                    entry.isUser
                      ? 'bg-cyan-950/80 border-cyan-400 shadow-lg shadow-cyan-500/20'
                      : 'bg-zinc-900 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                        entry.rank === 1
                          ? 'bg-yellow-400 text-zinc-950'
                          : entry.rank === 2
                          ? 'bg-slate-300 text-zinc-950'
                          : entry.rank === 3
                          ? 'bg-amber-600 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {entry.rank}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: entry.skinColor || '#06b6d4' }}
                      />
                      <div>
                        <h4
                          className={`text-xs font-black flex items-center gap-1.5 ${
                            entry.isUser ? 'text-cyan-300' : 'text-white'
                          }`}
                        >
                          {entry.name}
                          {entry.isUser && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                              SEN
                            </span>
                          )}
                          {!entry.isUser && entry.isGuest && (
                            <User className="w-3 h-3 text-zinc-500" />
                          )}
                        </h4>
                        <span className="text-[9px] font-bold text-zinc-500 uppercase">
                          {entry.badge} • {entry.bestCombo}x Kombo
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-white font-mono">
                      {entry.score}
                    </span>
                    <span className="text-[9px] text-zinc-400 block font-bold">PUAN</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'quests' && (
          <div className="space-y-3">
            {quests.map((q) => {
              const progressPct = Math.min(100, (q.current / q.target) * 100);
              const isCompleted = q.current >= q.target;

              return (
                <div
                  key={q.id}
                  className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-white">{q.title}</h4>
                      <p className="text-[10px] text-zinc-400">
                        İlerleme: {q.current} / {q.target}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                      {q.rewardType === 'coins' ? (
                        <Coins className="w-3.5 h-3.5 fill-amber-400" />
                      ) : (
                        <Gem className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
                      )}
                      +{q.rewardAmount}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  {/* Claim button */}
                  {q.claimed ? (
                    <div className="w-full py-1.5 rounded-xl bg-zinc-800 text-zinc-500 text-[11px] font-bold text-center flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />
                      ALINDI
                    </div>
                  ) : isCompleted ? (
                    <button
                      onClick={() => {
                        sound.playCash();
                        onClaimQuest(q.id);
                        try {
                          confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
                        } catch {
                          // safe
                        }
                      }}
                      className="w-full py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-[11px] font-black text-center transition animate-pulse"
                    >
                      ÖDÜLÜ AL! (+{q.rewardAmount}{' '}
                      {q.rewardType === 'coins' ? 'Altın' : 'Elmas'})
                    </button>
                  ) : (
                    <div className="text-[10px] text-zinc-500 text-center font-bold">
                      Henüz tamamlanmadı
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
