import { useSyncExternalStore } from 'react';
import {
  collection,
  doc,
  getCountFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Timestamp,
} from 'firebase/firestore';
import { db, ensureUser } from '../firebase';
import { LeaderboardEntry, PlayerStats } from '../types';

/**
 * Canlı küresel liderlik tablosu (Firebase Firestore, koleksiyon: `leaderboard`, belge kimliği = anonim uid).
 * Bileşenler senkron `getRankedLeaderboard` çağırır; bulut verisi geldikçe `useLeaderboardVersion` yeniden çizdirir.
 * Çevrimdışıyken son görülen liste (localStorage önbelleği) kullanılır.
 */

const COLLECTION = 'leaderboard';
const TOP_N = 100;
const CACHE_KEY = 'zyphor_global_leaderboard_cache_v2';

let cloudEntries: LeaderboardEntry[] = loadCache();
let myUid: string | null = null;
let totalCount: number | null = null; // tablodaki toplam oyuncu
let aboveCount: number | null = null; // benden yüksek skorlu oyuncu sayısı
let countedForScore = -1;
let version = 0;
const listeners = new Set<() => void>();

function emit() {
  version++;
  listeners.forEach((l) => l());
}

export function useLeaderboardVersion(): number {
  startLiveLeaderboard();
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => version
  );
}

function loadCache(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCache(entries: LeaderboardEntry[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
  } catch {
    // depolama hatası önemsiz
  }
}

let started = false;
/** Canlı dinlemeyi bir kez başlatır (ilk 100 skor). */
export function startLiveLeaderboard() {
  if (started) return;
  started = true;
  ensureUser()
    .then((user) => {
      myUid = user.uid;
      const q = query(collection(db, COLLECTION), orderBy('score', 'desc'), limit(TOP_N));
      onSnapshot(
        q,
        (snap) => {
          cloudEntries = snap.docs.map((d) => {
            const v = d.data();
            const ts = v.updatedAt as Timestamp | null;
            return {
              id: d.id,
              name: String(v.name ?? 'Misafir'),
              score: Number(v.score ?? 0),
              bestCombo: Number(v.bestCombo ?? 0),
              skinColor: typeof v.skinColor === 'string' ? v.skinColor : undefined,
              isGuest: Boolean(v.isGuest),
              updatedAt: ts?.toMillis?.() ?? Date.now(),
            };
          });
          saveCache(cloudEntries);
          countedForScore = -1; // sıralama değişmiş olabilir
          emit();
        },
        () => {
          // bağlantı yok / izin hatası: önbellekle devam
        }
      );
    })
    .catch(() => {
      started = false; // giriş başarısız (çevrimdışı): bir sonraki çağrıda tekrar dene
    });
}

/** Tablo ilk 100'den uzunsa gerçek sırayı ve toplam oyuncu sayısını sunucudan sayar. */
function refreshCounts(score: number) {
  if (countedForScore === score) return;
  countedForScore = score;
  const col = collection(db, COLLECTION);
  Promise.all([getCountFromServer(col), getCountFromServer(query(col, where('score', '>', score)))])
    .then(([all, above]) => {
      totalCount = all.data().count;
      aboveCount = above.data().count;
      emit();
    })
    .catch(() => {
      countedForScore = -1;
    });
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
  return raw.replace(/\s+/g, ' ').trim().slice(0, 16);
}

function displayName(stats: PlayerStats): string {
  return stats.isGuest ? 'Misafir' : sanitizePlayerName(stats.playerName) || 'Misafir';
}

// Bulut yazmalarını azalt: sadece rekor/isim/görünüm değişince ve 1.5 sn biriktirerek yaz.
const LAST_SENT_KEY = 'zyphor_leaderboard_last_sent_v1';
let pendingTimer: ReturnType<typeof setTimeout> | null = null;

/** Oyuncunun rekorunu ve takma adını küresel tabloya yazar. */
export function syncPlayerToLeaderboard(stats: PlayerStats, skinColor: string): void {
  const score = Math.max(0, Math.floor(stats.highScore || 0));
  if (score <= 0) return; // henüz skoru olmayanı tabloya koyma
  const payload = {
    name: displayName(stats),
    score,
    bestCombo: Math.max(0, Math.floor(stats.bestCombo || 0)),
    skinColor: String(skinColor).slice(0, 16),
    isGuest: Boolean(stats.isGuest),
  };
  const signature = JSON.stringify(payload);
  let last: string | null = null;
  try {
    last = localStorage.getItem(LAST_SENT_KEY);
  } catch {
    // yok say
  }
  if (last === signature) return;

  if (pendingTimer) clearTimeout(pendingTimer);
  pendingTimer = setTimeout(() => {
    pendingTimer = null;
    ensureUser()
      .then((user) =>
        setDoc(doc(db, COLLECTION, user.uid), { ...payload, updatedAt: serverTimestamp() })
      )
      .then(() => {
        try {
          localStorage.setItem(LAST_SENT_KEY, signature);
        } catch {
          // yok say
        }
      })
      .catch(() => {
        // çevrimdışı: bir sonraki istatistik değişiminde yeniden denenir
      });
  }, 1500);
}

export interface RankedLeaderboardResult {
  entries: (LeaderboardEntry & { rank: number; badge: string })[];
  userRank: number;
  totalPlayers: number;
  nextRival: (LeaderboardEntry & { rank: number; pointsNeeded: number }) | null;
}

/** Sıralı küresel tablo, oyuncunun sırası ve hemen üstündeki rakip. */
export function getRankedLeaderboard(stats: PlayerStats, skinColor = '#06b6d4'): RankedLeaderboardResult {
  startLiveLeaderboard();

  const others = cloudEntries.filter((e) => e.id !== myUid && e.id !== stats.playerId);

  const userEntry: LeaderboardEntry = {
    id: stats.playerId,
    name: displayName(stats),
    score: stats.highScore,
    bestCombo: stats.bestCombo,
    skinColor,
    isGuest: stats.isGuest,
    isUser: true,
    updatedAt: Date.now(),
  };

  const combined = [...others.map((e) => ({ ...e, isUser: false })), userEntry].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.bestCombo !== a.bestCombo) return b.bestCombo - a.bestCombo;
    return a.isUser ? -1 : 1;
  });

  const ranked = combined.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
    badge: getRankBadge(entry.score, idx + 1),
  }));

  const userIdx = ranked.findIndex((r) => r.isUser);
  let userRank = userIdx >= 0 ? ranked[userIdx].rank : ranked.length;
  let totalPlayers = ranked.length;

  // Tablo dolu (ilk 100'ün dışında oyuncular var): gerçek sıra ve toplamı sunucudan say.
  if (cloudEntries.length >= TOP_N && myUid) {
    refreshCounts(stats.highScore);
    if (aboveCount !== null && countedForScore === stats.highScore) userRank = aboveCount + 1;
    if (totalCount !== null) totalPlayers = Math.max(totalCount, totalPlayers);
  }

  let nextRival: (LeaderboardEntry & { rank: number; pointsNeeded: number }) | null = null;
  if (userIdx > 0) {
    const rivalAbove = ranked[userIdx - 1];
    nextRival = {
      ...rivalAbove,
      pointsNeeded: Math.max(1, rivalAbove.score - stats.highScore + 1),
    };
  }

  return { entries: ranked, userRank, totalPlayers, nextRival };
}
