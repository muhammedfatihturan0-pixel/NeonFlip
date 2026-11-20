export type GameState =
  | 'MENU'
  | 'PLAYING'
  | 'REVIVE_PROMPT'
  | 'GAMEOVER'
  | 'SHOP'
  | 'DAILY_SPIN'
  | 'LEADERBOARD';

export interface Skin {
  id: string;
  name: string;
  type: 'sphere' | 'shuriken' | 'cube' | 'core' | 'ghost' | 'pixel';
  color: string;
  glowColor: string;
  trailColor: string;
  price: number;
  currency: 'coins' | 'gems' | 'ads';
  requiredAds?: number;
  unlocked: boolean;
  tag?: string;
  perk?: string;
}

export type PowerupType = 'shield' | 'magnet' | 'slowmo';

export interface ActivePowerup {
  type: PowerupType;
  duration: number; // in seconds remaining
  maxDuration: number;
}

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'SPIKE_FLOOR' | 'SPIKE_CEILING' | 'DUAL_SPIKE' | 'LASER_BARRIER' | 'MOVING_SAW';
  speedY?: number;
  minY?: number;
  maxY?: number;
  passed?: boolean;
  nearMissAwarded?: boolean;
}

export interface Collectible {
  id: number;
  x: number;
  y: number;
  radius: number;
  type: 'COIN' | 'DIAMOND' | 'POWERUP_SHIELD' | 'POWERUP_MAGNET' | 'POWERUP_SLOWMO';
  value: number;
  collected?: boolean;
  pulsePhase: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'square' | 'spark';
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  scale: number;
}

export interface AdModalConfig {
  type: 'REWARDED_REVIVE' | 'REWARDED_2X_COINS' | 'REWARDED_DAILY_SPIN' | 'REWARDED_SKIN' | 'INTERSTITIAL';
  title: string;
  rewardDescription: string;
  durationSeconds: number;
  onReward: () => void;
  onClose?: () => void;
  skinId?: string;
}

export interface DailyQuest {
  id: string;
  title: string;
  target: number;
  current: number;
  rewardType: 'coins' | 'gems';
  rewardAmount: number;
  claimed: boolean;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  bestCombo: number;
  skinColor?: string;
  isGuest?: boolean;
  isUser?: boolean;
  updatedAt: number;
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  isGuest: boolean;
  hasSetProfile: boolean;
  highScore: number;
  totalGames: number;
  totalCoins: number;
  totalGems: number;
  totalJumps: number;
  bestCombo: number;
  adsWatched: number;
  noAdsOwned: boolean;
  selectedSkinId: string;
  unlockedSkins: string[];
  skinAdProgress?: Record<string, number>;
  powerupLevels: {
    shield: number;
    magnet: number;
    slowmo: number;
  };
  lastSpinTimestamp: number;
}
