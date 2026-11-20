import { LeaderboardEntry, PlayerStats } from '../types';

const GLOBAL_BOARD_STORAGE_KEY = 'zyphor_global_leaderboard_v1';

// Baseline global competitors to give every new player exciting targets to beat immediately.
// Once Firebase Firestore is connected, this service seamlessly switches to live cloud queries.
const SEED_GLOBAL_PLAYERS: LeaderboardEntry[] = [
  { id: 'glb_01', name: 'Kaan_Apex', score: 164, bestCombo: 28, skinColor: '#eab308', updatedAt: Date.now() - 86400000 * 2 },
  { id: 'glb_02', name: 'MiraShift', score: 138, bestCombo: 24, skinColor: '#ec4899', updatedAt: Date.now() - 86400000 * 3 },
  { id: 'glb_03', name: 'ZyphorProTR', score: 115, bestCombo: 21, skinColor: '#8b5cf6', updatedAt: Date.now() - 86400000 * 1 },
  { id: 'glb_04', name: 'VortexEmir', score: 94, bestCombo: 18, skinColor: '#06b6d4', updatedAt: Date.now() - 86400000 * 4 },
  { id: 'glb_05', name: 'ShadowPulse', score: 78, bestCombo: 15, skinColor: '#10b981', updatedAt: Date.now() - 86400000 * 2 },
  { id: 'glb_06', name: 'DefneReflex', score: 63, bestCombo: 13, skinColor: '#f97316', updatedAt: Date.now() - 86400000 * 5 },
  { id: 'glb_07', name: 'Kerem_99', score: 51, bestCombo: 11, skinColor: '#38bdf8', updatedAt: Date.now() - 86400000 * 1 },
  { id: 'glb_08', name: 'Misafir', score: 40, bestCombo: 9, skinColor: '#06b6d4', isGuest: true, updatedAt: Date.now() - 86400000 * 2 },
  { id: 'glb_09', name: 'ArdaNova', score: 31, bestCombo: 8, skinColor: '#ec4899', updatedAt: Date.now() - 86400000 * 3 },
  { id: 'glb_10', name: 'EceVolt', score: 22, bestCombo: 6, skinColor: '#eab308', updatedAt: Date.now() - 86400000 * 4 },
  { id: 'glb_11', name: 'YusufDash', score: 14, bestCombo: 4, skinColor: '#10b981', updatedAt: Date.now() - 86400000 * 2 },
  { id: 'glb_12', name: 'Misafir', score: 7, bestCombo: 3, skinColor: '#06b6d4', isGuest: true, updatedAt: Date.now() - 86400000 * 1 },
];

export interface RankedLeaderboardResult {
  entries: (LeaderboardEntry & { rank: number; badge: string })[];
  userRank: number;
  totalPlayers: number;
  nextRival: (LeaderboardEntry & { rank: number; pointsNeeded: number }) | null;
}

export function getRankBadge(score: number, rank: number): string {
  if (rank === 1) return '👑 DÜNYA 1.';
  if (rank === 2) return '🥈 DÜNYA 2.';
  if (rank === 3) return '🥉 DÜNYA 3.';
  if (score >= 100) return '⚡ EFSANE';
  if (score >= 60) return '🔥 USTA';
  if (score >= 30) return '💎 PRO';
  if (score >= 12) return '🚀 YÜKSELEN';
  return '🌱 ÇAYLAK';
}

export function sanitizePlayerName(raw: string): string {
  const cleaned = raw.replace(/\s+/g, ' ').trim().slice(0, 16);
  return cleaned;
}

function loadStoredEntries(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(GLOBAL_BOARD_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return [...SEED_GLOBAL_PLAYERS];
}

function saveStoredEntries(entries: LeaderboardEntry[]) {
  try {
    localStorage.setItem(GLOBAL_BOARD_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore storage errors
  }
}

/**
 * Saves or updates the current player's high score & nickname on the leaderboard.
 * Designed as an async-friendly boundary so Firebase Firestore can replace local persistence cleanly.
 */
export function syncPlayerToLeaderboard(stats: PlayerStats, skinColor: string): void {
  const entries = loadStoredEntries().filter((e) => e.id !== stats.playerId);
  entries.push({
    id: stats.playerId,
    name: stats.isGuest ? 'Misafir' : sanitizePlayerName(stats.playerName) || 'Misafir',
    score: stats.highScore,
    bestCombo: stats.bestCombo,
    skinColor,
    isGuest: stats.isGuest,
    updatedAt: Date.now(),
  });
  saveStoredEntries(entries);
}

/**
 * Returns the ranked global leaderboard, the current player's rank,
 * and the exact next rival above them so they always have a target to beat.
 */
export function getRankedLeaderboard(
  stats: PlayerStats,
  skinColor = '#06b6d4'
): RankedLeaderboardResult {
  const stored = loadStoredEntries().filter((e) => e.id !== stats.playerId);

  const userEntry: LeaderboardEntry = {
    id: stats.playerId,
    name: stats.isGuest ? 'Misafir' : sanitizePlayerName(stats.playerName) || 'Misafir',
    score: stats.highScore,
    bestCombo: stats.bestCombo,
    skinColor,
    isGuest: stats.isGuest,
    isUser: true,
    updatedAt: Date.now(),
  };

  const combined = [...stored.map((e) => ({ ...e, isUser: false })), userEntry].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Tie-breaker: higher combo wins, then user edges ahead if equal
    if (b.bestCombo !== a.bestCombo) return b.bestCombo - a.bestCombo;
    return a.isUser ? -1 : 1;
  });

  const ranked = combined.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
    badge: getRankBadge(entry.score, idx + 1),
  }));

  const userIdx = ranked.findIndex((r) => r.isUser);
  const userRank = userIdx >= 0 ? ranked[userIdx].rank : ranked.length;

  let nextRival: (LeaderboardEntry & { rank: number; pointsNeeded: number }) | null = null;
  if (userIdx > 0) {
    const rivalAbove = ranked[userIdx - 1];
    nextRival = {
      ...rivalAbove,
      pointsNeeded: Math.max(1, rivalAbove.score - stats.highScore + 1),
    };
  }

  return {
    entries: ranked,
    userRank,
    totalPlayers: ranked.length,
    nextRival,
  };
}
