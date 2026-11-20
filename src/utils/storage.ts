import { PlayerStats, Skin, DailyQuest } from '../types';

export const INITIAL_SKINS: Skin[] = [
  {
    id: 'skin_neon_cyan',
    name: 'Siber Turkuaz',
    type: 'sphere',
    color: '#06b6d4',
    glowColor: '#22d3ee',
    trailColor: 'rgba(6, 182, 212, 0.6)',
    price: 0,
    currency: 'coins',
    unlocked: true,
    tag: 'BAŞLANGIÇ',
  },
  {
    id: 'skin_plasma_pink',
    name: 'Plazma Pembe',
    type: 'core',
    color: '#ec4899',
    glowColor: '#f472b6',
    trailColor: 'rgba(236, 72, 153, 0.6)',
    price: 250,
    currency: 'coins',
    unlocked: false,
    tag: 'POPÜLER',
    perk: '+%20 ekstra altın şansı',
  },
  {
    id: 'skin_electric_gold',
    name: 'Midas Çekirdek',
    type: 'shuriken',
    color: '#eab308',
    glowColor: '#facc15',
    trailColor: 'rgba(234, 179, 8, 0.8)',
    price: 600,
    currency: 'coins',
    unlocked: false,
    tag: 'EFSANEVİ',
    perk: '+%25 mıknatıs menzili',
  },
  {
    id: 'skin_emerald_matrix',
    name: 'Glitch Koşucu',
    type: 'pixel',
    color: '#10b981',
    glowColor: '#34d399',
    trailColor: 'rgba(16, 185, 129, 0.7)',
    price: 400,
    currency: 'coins',
    unlocked: false,
    perk: 'Siber piksel izi',
  },
  {
    id: 'skin_quantum_void',
    name: 'Karanlık Madde',
    type: 'ghost',
    color: '#8b5cf6',
    glowColor: '#a78bfa',
    trailColor: 'rgba(139, 92, 246, 0.8)',
    price: 15,
    currency: 'gems',
    unlocked: false,
    tag: 'ELİT',
    perk: '2X Fever Modu süresi',
  },
  {
    id: 'skin_inferno',
    name: 'Güneş Patlaması',
    type: 'cube',
    color: '#f97316',
    glowColor: '#fb923c',
    trailColor: 'rgba(249, 115, 22, 0.7)',
    price: 800,
    currency: 'coins',
    unlocked: false,
    perk: 'Alev çekirdeği',
  },
  {
    id: 'skin_ad_master',
    name: 'Kronos Hükümdarı',
    type: 'core',
    color: '#38bdf8',
    glowColor: '#bae6fd',
    trailColor: 'rgba(56, 189, 248, 0.8)',
    price: 3,
    currency: 'ads',
    requiredAds: 3,
    unlocked: false,
    tag: 'ÜCRETSİZ ÖDÜL',
    perk: '3 reklam izle ücretsiz aç',
  },
];

export const INITIAL_QUESTS: DailyQuest[] = [
  {
    id: 'q_play_3',
    title: '3 Oyun Oyna',
    target: 3,
    current: 0,
    rewardType: 'coins',
    rewardAmount: 100,
    claimed: false,
  },
  {
    id: 'q_score_25',
    title: 'Tek Elde 25 Puana Ulaş',
    target: 25,
    current: 0,
    rewardType: 'coins',
    rewardAmount: 250,
    claimed: false,
  },
  {
    id: 'q_collect_gems',
    title: '5 Elmas Topla',
    target: 5,
    current: 0,
    rewardType: 'gems',
    rewardAmount: 3,
    claimed: false,
  },
  {
    id: 'q_combo_4',
    title: '4x Kombo Serisi Yakala',
    target: 4,
    current: 0,
    rewardType: 'coins',
    rewardAmount: 150,
    claimed: false,
  },
];

const STATS_STORAGE_KEY = 'zyphor_stats_v1';
const LEGACY_STATS_KEY = 'neon_flip_stats_v1';
const QUESTS_STORAGE_KEY = 'zyphor_quests_v1';
const QUESTS_DATE_KEY = 'zyphor_quests_date_v1';

function generatePlayerId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `zp_${crypto.randomUUID().slice(0, 12)}`;
    }
  } catch {
    // fallback
  }
  return `zp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function getTodayDateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function loadPlayerStats(): PlayerStats {
  try {
    const data = localStorage.getItem(STATS_STORAGE_KEY) || localStorage.getItem(LEGACY_STATS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        playerId: parsed.playerId || generatePlayerId(),
        playerName: typeof parsed.playerName === 'string' && parsed.playerName.trim() ? parsed.playerName.trim() : 'Misafir',
        isGuest: parsed.isGuest !== undefined ? !!parsed.isGuest : true,
        hasSetProfile: !!parsed.hasSetProfile,
        highScore: parsed.highScore || 0,
        totalGames: parsed.totalGames || 0,
        totalCoins: parsed.totalCoins ?? 150,
        totalGems: parsed.totalGems ?? 5,
        totalJumps: parsed.totalJumps || 0,
        bestCombo: parsed.bestCombo || 0,
        adsWatched: parsed.adsWatched || 0,
        noAdsOwned: !!parsed.noAdsOwned,
        selectedSkinId: parsed.selectedSkinId || 'skin_neon_cyan',
        unlockedSkins: parsed.unlockedSkins || ['skin_neon_cyan'],
        skinAdProgress: parsed.skinAdProgress || {},
        powerupLevels: parsed.powerupLevels || { shield: 1, magnet: 1, slowmo: 1 },
        lastSpinTimestamp: parsed.lastSpinTimestamp || 0,
      };
    }
  } catch {
    // Default fallback
  }

  return {
    playerId: generatePlayerId(),
    playerName: 'Misafir',
    isGuest: true,
    hasSetProfile: false,
    highScore: 0,
    totalGames: 0,
    totalCoins: 150,
    totalGems: 5,
    totalJumps: 0,
    bestCombo: 0,
    adsWatched: 0,
    noAdsOwned: false,
    selectedSkinId: 'skin_neon_cyan',
    unlockedSkins: ['skin_neon_cyan'],
    skinAdProgress: {},
    powerupLevels: { shield: 1, magnet: 1, slowmo: 1 },
    lastSpinTimestamp: 0,
  };
}

export function savePlayerStats(stats: PlayerStats) {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Storage quota or iframe restriction
  }
}

export function loadDailyQuests(): DailyQuest[] {
  try {
    const today = getTodayDateKey();
    const savedDate = localStorage.getItem(QUESTS_DATE_KEY);
    if (savedDate !== today) {
      localStorage.setItem(QUESTS_DATE_KEY, today);
      localStorage.setItem(QUESTS_STORAGE_KEY, JSON.stringify(INITIAL_QUESTS));
      return INITIAL_QUESTS.map((q) => ({ ...q }));
    }

    const data = localStorage.getItem(QUESTS_STORAGE_KEY);
    if (data) {
      const parsed: DailyQuest[] = JSON.parse(data);
      // Merge localized Turkish titles in case an older English copy was cached
      return INITIAL_QUESTS.map((base) => {
        const match = parsed.find((p) => p.id === base.id);
        return match ? { ...base, current: match.current, claimed: match.claimed } : { ...base };
      });
    }
  } catch {
    // Fallback
  }
  return INITIAL_QUESTS.map((q) => ({ ...q }));
}

export function saveDailyQuests(quests: DailyQuest[]) {
  try {
    localStorage.setItem(QUESTS_DATE_KEY, getTodayDateKey());
    localStorage.setItem(QUESTS_STORAGE_KEY, JSON.stringify(quests));
  } catch {
    // Fallback
  }
}
