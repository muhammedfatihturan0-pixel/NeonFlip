import React, { useEffect, useRef, useState } from 'react';
import { Skin, Obstacle, Collectible, Particle, FloatingText, ActivePowerup } from '../types';
import { sound } from '../utils/audio';
import { Pause, Play, Home, HelpCircle } from 'lucide-react';

interface GameCanvasProps {
  selectedSkin: Skin;
  activePowerup: ActivePowerup | null;
  onGameOver: (score: number, coinsEarned: number, gemsEarned: number, bestCombo: number) => void;
  onScoreUpdate: (score: number, coins: number, combo: number) => void;
  onReviveUsed: () => void;
  isReviving: boolean;
  powerupLevels: { shield: number; magnet: number; slowmo: number };
  highScore?: number;
  onExitToMenu?: () => void;
  onOpenHowToPlay?: () => void;
}

interface ThemePalette {
  name: string;
  bgGradStart: string;
  bgGradEnd: string;
  gridColor: string;
  floorCeilColor: string;
  floorCeilGlow: string;
  obstacleColor: string;
  obstacleGlow: string;
}

const THEMES: ThemePalette[] = [
  {
    name: 'Cyberpunk Neon',
    bgGradStart: '#090d16',
    bgGradEnd: '#05070c',
    gridColor: 'rgba(6, 182, 212, 0.08)',
    floorCeilColor: '#06b6d4',
    floorCeilGlow: '#22d3ee',
    obstacleColor: '#f43f5e',
    obstacleGlow: '#fb7185',
  },
  {
    name: 'Synthwave Purple',
    bgGradStart: '#14081f',
    bgGradEnd: '#0a0312',
    gridColor: 'rgba(168, 85, 247, 0.09)',
    floorCeilColor: '#a855f7',
    floorCeilGlow: '#c084fc',
    obstacleColor: '#eab308',
    obstacleGlow: '#fde047',
  },
  {
    name: 'Solar Flare',
    bgGradStart: '#180a06',
    bgGradEnd: '#0c0503',
    gridColor: 'rgba(249, 115, 22, 0.08)',
    floorCeilColor: '#f97316',
    floorCeilGlow: '#fb923c',
    obstacleColor: '#06b6d4',
    obstacleGlow: '#38bdf8',
  },
  {
    name: 'Emerald Matrix',
    bgGradStart: '#05140e',
    bgGradEnd: '#020a06',
    gridColor: 'rgba(16, 185, 129, 0.08)',
    floorCeilColor: '#10b981',
    floorCeilGlow: '#34d399',
    obstacleColor: '#ec4899',
    obstacleGlow: '#f472b6',
  },
  {
    name: 'Golden God',
    bgGradStart: '#161205',
    bgGradEnd: '#0a0802',
    gridColor: 'rgba(234, 179, 8, 0.09)',
    floorCeilColor: '#eab308',
    floorCeilGlow: '#facc15',
    obstacleColor: '#8b5cf6',
    obstacleGlow: '#a78bfa',
  },
];

export const GameCanvas: React.FC<GameCanvasProps> = ({
  selectedSkin,
  onGameOver,
  onScoreUpdate,
  isReviving,
  onReviveUsed,
  powerupLevels,
  highScore = 0,
  onExitToMenu,
  onOpenHowToPlay,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Keep latest callbacks & props in refs so the 60fps loop NEVER restarts on score ticks
  const onGameOverRef = useRef(onGameOver);
  const onScoreUpdateRef = useRef(onScoreUpdate);
  const selectedSkinRef = useRef(selectedSkin);
  const powerupLevelsRef = useRef(powerupLevels);
  const highScoreRef = useRef(highScore);

  onGameOverRef.current = onGameOver;
  onScoreUpdateRef.current = onScoreUpdate;
  selectedSkinRef.current = selectedSkin;
  powerupLevelsRef.current = powerupLevels;
  highScoreRef.current = highScore;

  // Gameplay state
  const [feverActive, setFeverActive] = useState(false);
  const [shieldActive, setShieldActive] = useState(powerupLevels.shield > 1);
  const [isPaused, setIsPaused] = useState(false);
  const [firstJumpDone, setFirstJumpDone] = useState(false);

  // High performance game state refs (avoids React render lag in 60fps loop)
  const stateRef = useRef({
    running: true,
    paused: false,
    score: 0,
    coinsEarned: 0,
    gemsEarned: 0,
    combo: 0,
    bestCombo: 0,
    feverPoints: 0,
    feverTimeRemaining: 0,
    shakeTime: 0,
    shakeIntensity: 0,
    coinStreak: 0,
    milestonesPassed: [] as number[],
    highScoreBroken: false,

    // Active powerups
    shield: powerupLevels.shield > 1,
    magnetTime: 0,
    slowmoTime: 0,

    // Player physics
    player: {
      x: 90,
      y: 350,
      radius: 14,
      vy: 0,
      gravityDir: 1 as 1 | -1, // 1 = down towards floor, -1 = up towards ceiling
      angle: 0,
      squashX: 1,
      squashY: 1,
      trail: [] as { x: number; y: number; alpha: number; size: number }[],
    },

    // World speed - Smooth, gradual progression for maximum player satisfaction
    baseSpeed: 230,
    speedMultiplier: 1,
    lastTime: 0,
    distanceTraveled: 0,

    // Entities
    obstacles: [] as Obstacle[],
    collectibles: [] as Collectible[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],

    // Spawner timers (generous initial spacing so game starts fun and readable)
    nextObstacleDist: 430,
    lastObstacleDist: 0,
    nextCollectibleDist: 140,
    lastCollectibleDist: 0,

    // Canvas size
    width: 400,
    height: 700,
    floorY: 630,
    ceilY: 70,
    themeIdx: 0,
  });

  // Handle revive state change
  useEffect(() => {
    if (isReviving) {
      const s = stateRef.current;
      s.running = true;
      s.shield = true;
      setShieldActive(true);
      // Clear nearby obstacles to give player safe entry
      s.obstacles = s.obstacles.filter((obs) => obs.x > s.player.x + 380);
      s.player.vy = 0;
      s.player.y = (s.floorY + s.ceilY) / 2;
      s.feverTimeRemaining = 2.5; // 2.5 seconds invincibility grace
      setFeverActive(true);
      sound.playRevive();
      onReviveUsed();
    }
  }, [isReviving, onReviveUsed]);

  // Main input handler: Tap anywhere to flip gravity!
  const handleTap = () => {
    const s = stateRef.current;
    if (!s.running || s.paused) return;

    if (!firstJumpDone) {
      setFirstJumpDone(true);
    }

    // Flip gravity direction
    s.player.gravityDir = s.player.gravityDir === 1 ? -1 : 1;
    s.player.vy = s.player.gravityDir * 275; // Crisp, responsive, satisfying boost
    s.player.squashX = 0.8;
    s.player.squashY = 1.25;

    sound.playFlip(s.player.gravityDir === -1 ? 'up' : 'down');

    // Spawn tiny tap burst particles
    for (let i = 0; i < 6; i++) {
      s.particles.push({
        x: s.player.x,
        y: s.player.y,
        vx: (Math.random() - 0.5) * 120,
        vy: -s.player.gravityDir * (Math.random() * 80 + 30),
        size: Math.random() * 3 + 2,
        color: selectedSkin.glowColor,
        alpha: 0.8,
        life: 0,
        maxLife: 0.25,
        shape: 'spark',
      });
    }
  };

  const handlePause = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playClick();
    stateRef.current.paused = true;
    setIsPaused(true);
  };

  const handleResume = () => {
    sound.playTap();
    stateRef.current.paused = false;
    stateRef.current.lastTime = performance.now();
    setIsPaused(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;

    // Handle responsive sizing
    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);
      if (width <= 0 || height <= 0) return;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const s = stateRef.current;
      s.width = width;
      s.height = height;
      s.ceilY = Math.max(55, Math.floor(height * 0.1));
      s.floorY = Math.min(height - 55, Math.floor(height * 0.9));

      // Only position player on floor initially before gameplay starts
      if (s.score === 0 && s.distanceTraveled === 0) {
        s.player.y = s.floorY - s.player.radius;
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(() => updateDimensions());
    resizeObserver.observe(container);

    // Obstacle Generator - Gradual, fair, rhythmic difficulty curve
    const spawnObstacle = () => {
      const s = stateRef.current;
      const types: Obstacle['type'][] = ['SPIKE_FLOOR', 'SPIKE_CEILING', 'DUAL_SPIKE', 'LASER_BARRIER', 'MOVING_SAW'];
      
      // Select difficulty-weighted type with gentle learning curve
      let type: Obstacle['type'] = 'SPIKE_FLOOR';
      const r = Math.random();

      if (s.score < 8) {
        // Stage 1 (0-7): Introduction warm-up. Clean, single spikes with ample reaction time
        type = r < 0.55 ? 'SPIKE_FLOOR' : 'SPIKE_CEILING';
      } else if (s.score < 22) {
        // Stage 2 (8-21): Alternating floor/ceiling rhythm
        if (r < 0.45) type = 'SPIKE_FLOOR';
        else if (r < 0.88) type = 'SPIKE_CEILING';
        else type = 'DUAL_SPIKE';
      } else if (s.score < 45) {
        // Stage 3 (22-44): Introduce smooth moving saws & spaced dual spikes
        if (r < 0.35) type = 'SPIKE_FLOOR';
        else if (r < 0.65) type = 'SPIKE_CEILING';
        else if (r < 0.84) type = 'DUAL_SPIKE';
        else type = 'MOVING_SAW';
      } else if (s.score < 70) {
        // Stage 4 (45-69): Introduce laser barriers with clear openings
        if (r < 0.28) type = 'SPIKE_FLOOR';
        else if (r < 0.55) type = 'SPIKE_CEILING';
        else if (r < 0.72) type = 'DUAL_SPIKE';
        else if (r < 0.86) type = 'MOVING_SAW';
        else type = 'LASER_BARRIER';
      } else {
        // Mastery stage (70+): Full dynamic variety
        type = types[Math.floor(Math.random() * types.length)];
      }

      const spawnX = s.width + 80;
      const playHeight = s.floorY - s.ceilY;

      if (type === 'SPIKE_FLOOR') {
        const h = Math.random() * 16 + 32; // Fair height 32-48px
        s.obstacles.push({
          id: Math.random(),
          x: spawnX,
          y: s.floorY - h,
          width: 32,
          height: h,
          type,
        });
      } else if (type === 'SPIKE_CEILING') {
        const h = Math.random() * 16 + 32;
        s.obstacles.push({
          id: Math.random(),
          x: spawnX,
          y: s.ceilY,
          width: 32,
          height: h,
          type,
        });
      } else if (type === 'DUAL_SPIKE') {
        const h1 = 32;
        const h2 = 32;
        s.obstacles.push({
          id: Math.random(),
          x: spawnX,
          y: s.floorY - h1,
          width: 30,
          height: h1,
          type: 'SPIKE_FLOOR',
        });
        // 140px spacing gives the player comfortable room to flip in between
        s.obstacles.push({
          id: Math.random() + 0.1,
          x: spawnX + 140,
          y: s.ceilY,
          width: 30,
          height: h2,
          type: 'SPIKE_CEILING',
        });
      } else if (type === 'MOVING_SAW') {
        s.obstacles.push({
          id: Math.random(),
          x: spawnX,
          y: s.ceilY + playHeight * 0.35,
          width: 30,
          height: 30,
          type: 'MOVING_SAW',
          speedY: (Math.random() > 0.5 ? 1 : -1) * 58, // Smooth, readable speed
          minY: s.ceilY + 28,
          maxY: s.floorY - 28,
        });
      } else if (type === 'LASER_BARRIER') {
        // Safe opening either at top or bottom with generous clearance
        const gapAtBottom = Math.random() > 0.5;
        const h = playHeight * 0.52; // 48% open passage for comfortable dodging
        s.obstacles.push({
          id: Math.random(),
          x: spawnX,
          y: gapAtBottom ? s.ceilY : s.floorY - h,
          width: 20,
          height: h,
          type: 'LASER_BARRIER',
        });
      }

      // Next spawn distance shrinks gently as score grows (never crowded)
      s.nextObstacleDist = Math.max(280, 440 - Math.min(s.score * 2.2, 160));
    };

    // Collectible Spawner (Arc formations & frequent rewards)
    const spawnCollectible = () => {
      const s = stateRef.current;
      const spawnX = s.width + 90;
      const playHeight = s.floorY - s.ceilY;

      const r = Math.random();
      let type: Collectible['type'] = 'COIN';
      let value = 1;

      if (r < 0.68) {
        type = 'COIN';
        value = 1;
      } else if (r < 0.84) {
        type = 'DIAMOND';
        value = 5;
      } else {
        // Power-up
        const pTypes: Collectible['type'][] = ['POWERUP_SHIELD', 'POWERUP_MAGNET', 'POWERUP_SLOWMO'];
        type = pTypes[Math.floor(Math.random() * pTypes.length)];
        value = 10;
      }

      // Alternate heights to encourage flipping
      const heights = [
        s.floorY - 26,
        s.ceilY + 26,
        s.ceilY + playHeight * 0.5,
      ];
      const baseSpawnY = heights[Math.floor(Math.random() * heights.length)];

      if (type === 'COIN' && Math.random() < 0.55) {
        // Spawn a rewarding streak of 3 coins in a row!
        for (let k = 0; k < 3; k++) {
          s.collectibles.push({
            id: Math.random(),
            x: spawnX + k * 36,
            y: baseSpawnY,
            radius: 10,
            type: 'COIN',
            value: 1,
            pulsePhase: Math.random() * Math.PI * 2,
          });
        }
      } else {
        s.collectibles.push({
          id: Math.random(),
          x: spawnX,
          y: baseSpawnY,
          radius: type === 'COIN' ? 10 : 13,
          type,
          value,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }

      s.nextCollectibleDist = Math.random() * 100 + 110;
    };

    // Main Game Loop (Delta Time based)
    const tick = (now: number) => {
      if (!stateRef.current.lastTime) stateRef.current.lastTime = now;
      const dt = Math.min((now - stateRef.current.lastTime) / 1000, 0.05); // cap dt at 50ms to prevent jumping
      stateRef.current.lastTime = now;

      const s = stateRef.current;

      if (s.paused) {
        animId = requestAnimationFrame(tick);
        return;
      }

      if (s.running) {
        // Power-up timers
        if (s.magnetTime > 0) s.magnetTime -= dt;
        if (s.slowmoTime > 0) s.slowmoTime -= dt;

        // Fever mode timer
        if (s.feverTimeRemaining > 0) {
          s.feverTimeRemaining -= dt;
          if (s.feverTimeRemaining <= 0) {
            setFeverActive(false);
          }
        }

        // Screen Shake decay
        if (s.shakeTime > 0) {
          s.shakeTime -= dt;
        }

        // Speed calculation - Gentle, smooth progression so difficulty increases naturally
        const slowFactor = s.slowmoTime > 0 ? 0.65 : 1;
        const currentSpeed = (s.baseSpeed + Math.min(s.score * 1.65, 125)) * slowFactor;
        const deltaX = currentSpeed * dt;
        s.distanceTraveled += deltaX;

        // Theme shift check every 10 points
        const newThemeIdx = Math.floor(s.score / 10) % THEMES.length;
        if (newThemeIdx !== s.themeIdx) {
          s.themeIdx = newThemeIdx;
        }

        // Spawning triggers
        s.lastObstacleDist += deltaX;
        if (s.lastObstacleDist >= s.nextObstacleDist) {
          spawnObstacle();
          s.lastObstacleDist = 0;
        }

        s.lastCollectibleDist += deltaX;
        if (s.lastCollectibleDist >= s.nextCollectibleDist) {
          spawnCollectible();
          s.lastCollectibleDist = 0;
        }

        // --- Player Physics (Pleasantly floaty & responsive) ---
        const gravity = 1580 * s.player.gravityDir;
        s.player.vy += gravity * dt;
        // terminal velocity capped smoothly
        s.player.vy = Math.max(-580, Math.min(580, s.player.vy));
        s.player.y += s.player.vy * dt;

        // Rotation & Squash recovery
        s.player.angle += (s.player.vy * 0.007 + s.player.gravityDir * 0.035);
        s.player.squashX += (1 - s.player.squashX) * 12 * dt;
        s.player.squashY += (1 - s.player.squashY) * 12 * dt;

        // Floor / Ceiling Collision
        if (s.player.y >= s.floorY - s.player.radius) {
          s.player.y = s.floorY - s.player.radius;
          s.player.vy = 0;
        } else if (s.player.y <= s.ceilY + s.player.radius) {
          s.player.y = s.ceilY + s.player.radius;
          s.player.vy = 0;
        }

        // Trail emission
        s.player.trail.unshift({
          x: s.player.x,
          y: s.player.y,
          alpha: 0.6,
          size: s.player.radius * s.player.squashX,
        });
        if (s.player.trail.length > 14) s.player.trail.pop();
        s.player.trail.forEach((t) => (t.alpha -= dt * 2.2));

        // --- Collectibles update & collection ---
        for (let i = s.collectibles.length - 1; i >= 0; i--) {
          const c = s.collectibles[i];
          c.x -= deltaX;
          c.pulsePhase += dt * 4;

          // Magnet pull (Midas skin perk gives +25% pull radius)
          if (s.magnetTime > 0) {
            const dx = s.player.x - c.x;
            const dy = s.player.y - c.y;
            const dist = Math.hypot(dx, dy);
            const magnetRadius = selectedSkinRef.current.id === 'skin_electric_gold' ? 265 : 210;
            if (dist > 0.1 && dist < magnetRadius) {
              c.x += (dx / dist) * 480 * dt;
              c.y += (dy / dist) * 480 * dt;
            }
          }

          // Check pickup
          const distToPlayer = Math.hypot(s.player.x - c.x, s.player.y - c.y);
          if (distToPlayer < s.player.radius + c.radius + 4) {
            c.collected = true;

            // Trigger sound & rewards
            if (c.type === 'COIN') {
              s.coinStreak += 1;
              const pinkBonus =
                selectedSkinRef.current.id === 'skin_plasma_pink' && Math.random() < 0.2 ? 1 : 0;
              const coinVal = c.value * (s.feverTimeRemaining > 0 ? 2 : 1) + pinkBonus;
              s.coinsEarned += coinVal;
              sound.playCoin(s.coinStreak);
              s.floatingTexts.push({
                id: Math.random(),
                x: c.x,
                y: c.y,
                text: `+${coinVal}`,
                color: '#facc15',
                alpha: 1,
                vy: -80,
                scale: 1,
              });
            } else if (c.type === 'DIAMOND') {
              s.gemsEarned += c.value;
              sound.playDiamond();
              s.floatingTexts.push({
                id: Math.random(),
                x: c.x,
                y: c.y,
                text: `💎 +${c.value}`,
                color: '#a855f7',
                alpha: 1,
                vy: -90,
                scale: 1.2,
              });
            } else if (c.type === 'POWERUP_SHIELD') {
              s.shield = true;
              setShieldActive(true);
              sound.playRevive();
              s.floatingTexts.push({
                id: Math.random(),
                x: c.x,
                y: c.y,
                text: 'KALKAN! (SHIELD)',
                color: '#38bdf8',
                alpha: 1,
                vy: -85,
                scale: 1.25,
              });
            } else if (c.type === 'POWERUP_MAGNET') {
              s.magnetTime = 9 + powerupLevelsRef.current.magnet * 2;
              sound.playCoin(5);
              s.floatingTexts.push({
                id: Math.random(),
                x: c.x,
                y: c.y,
                text: 'MIKNATIS!',
                color: '#ec4899',
                alpha: 1,
                vy: -85,
                scale: 1.25,
              });
            } else if (c.type === 'POWERUP_SLOWMO') {
              s.slowmoTime = 7 + powerupLevelsRef.current.slowmo * 1.5;
              sound.playDiamond();
              s.floatingTexts.push({
                id: Math.random(),
                x: c.x,
                y: c.y,
                text: 'AĞIR ÇEKİM! (SLOW-MO)',
                color: '#34d399',
                alpha: 1,
                vy: -85,
                scale: 1.25,
              });
            }

            // Coin burst particles
            for (let p = 0; p < 8; p++) {
              s.particles.push({
                x: c.x,
                y: c.y,
                vx: (Math.random() - 0.5) * 160,
                vy: (Math.random() - 0.5) * 160,
                size: Math.random() * 3 + 2,
                color: c.type === 'DIAMOND' ? '#c084fc' : '#facc15',
                alpha: 1,
                life: 0,
                maxLife: 0.35,
                shape: 'spark',
              });
            }

            s.collectibles.splice(i, 1);
            continue;
          }

          // Offscreen removal
          if (c.x < -40) {
            s.collectibles.splice(i, 1);
          }
        }

        // --- Obstacles update & collision ---
        for (let i = s.obstacles.length - 1; i >= 0; i--) {
          const obs = s.obstacles[i];
          obs.x -= deltaX;

          // Moving saw logic
          if (obs.type === 'MOVING_SAW' && obs.speedY !== undefined && obs.minY !== undefined && obs.maxY !== undefined) {
            obs.y += obs.speedY * dt;
            if (obs.y > obs.maxY) {
              obs.y = obs.maxY;
              obs.speedY = -Math.abs(obs.speedY);
            } else if (obs.y < obs.minY) {
              obs.y = obs.minY;
              obs.speedY = Math.abs(obs.speedY);
            }
          }

          // Passing check (Score + Combo Increment)
          if (!obs.passed && obs.x + obs.width < s.player.x) {
            obs.passed = true;
            s.score += 1;
            s.combo += 1;
            s.bestCombo = Math.max(s.bestCombo, s.combo);

            // Combo sound milestone
            if (s.combo % 3 === 0) {
              sound.playCombo(Math.min(Math.floor(s.combo / 3), 6));
              s.floatingTexts.push({
                id: Math.random(),
                x: s.player.x + 30,
                y: s.player.y - 15,
                text: `${s.combo}x KOMBO!`,
                color: '#38bdf8',
                alpha: 1,
                vy: -60,
                scale: 1.15,
              });
            }

            // Fever Meter check (Dark Matter skin doubles Fever duration)
            if (s.combo > 0 && s.combo % 5 === 0) {
              s.feverTimeRemaining =
                selectedSkinRef.current.id === 'skin_quantum_void' ? 9.0 : 4.5;
              setFeverActive(true);
              sound.playFever();
              s.shakeTime = 0.35;
              s.shakeIntensity = 7;
              s.floatingTexts.push({
                id: Math.random(),
                x: s.width / 2,
                y: s.height * 0.35,
                text: '🔥 FEVER MODU! (2X) 🔥',
                color: '#f97316',
                alpha: 1,
                vy: -40,
                scale: 1.6,
              });
            }

            // Milestone celebrations (10, 25, 50, 100)
            const milestones = [10, 25, 50, 100];
            if (milestones.includes(s.score) && !s.milestonesPassed.includes(s.score)) {
              s.milestonesPassed.push(s.score);
              sound.playMilestone();
              const badgeName =
                s.score === 10 ? 'BRONZ KOŞU! 🥉' :
                s.score === 25 ? 'GÜMÜŞ KOŞU! 🥈' :
                s.score === 50 ? 'ALTIN KOŞU! 🥇' : 'SİBER EFSANE! 👑';
              s.floatingTexts.push({
                id: Math.random(),
                x: s.width / 2,
                y: s.height * 0.28,
                text: badgeName,
                color: '#facc15',
                alpha: 1,
                vy: -35,
                scale: 1.5,
              });
              // Celebration spark burst
              for (let pt = 0; pt < 16; pt++) {
                s.particles.push({
                  x: s.width / 2,
                  y: s.height * 0.28,
                  vx: (Math.random() - 0.5) * 260,
                  vy: (Math.random() - 0.5) * 260,
                  size: Math.random() * 4 + 2,
                  color: '#facc15',
                  alpha: 1,
                  life: 0,
                  maxLife: 0.5,
                  shape: 'spark',
                });
              }
            }

            // New High Score In-Game Celebration!
            if (highScoreRef.current > 0 && s.score > highScoreRef.current && !s.highScoreBroken) {
              s.highScoreBroken = true;
              sound.playMilestone();
              s.floatingTexts.push({
                id: Math.random(),
                x: s.width / 2,
                y: s.height * 0.22,
                text: `🏆 YENİ REKOR! (${s.score})`,
                color: '#f59e0b',
                alpha: 1,
                vy: -30,
                scale: 1.65,
              });
              // Golden fireworks particles
              for (let pt = 0; pt < 22; pt++) {
                s.particles.push({
                  x: s.width / 2,
                  y: s.height * 0.22,
                  vx: (Math.random() - 0.5) * 320,
                  vy: (Math.random() - 0.5) * 320,
                  size: Math.random() * 5 + 2,
                  color: '#38bdf8',
                  alpha: 1,
                  life: 0,
                  maxLife: 0.6,
                  shape: 'spark',
                });
              }
            }

            onScoreUpdateRef.current(s.score, s.coinsEarned, s.combo);
          }

          // Near Miss Detection (Thrilling adrenaline check!)
          const horizDist = Math.abs(obs.x + obs.width / 2 - s.player.x);
          const vertDist = Math.abs(obs.y + obs.height / 2 - s.player.y);
          if (!obs.passed && !obs.nearMissAwarded && horizDist < 25 && vertDist < obs.height / 2 + 25) {
            obs.nearMissAwarded = true;
            s.coinsEarned += 1;
            sound.playCoin();
            s.floatingTexts.push({
              id: Math.random(),
              x: s.player.x,
              y: s.player.y - 20,
              text: '⚡ TEĞET GEÇİŞ! +1 ALTIN',
              color: '#38bdf8',
              alpha: 1,
              vy: -70,
              scale: 1.1,
            });
            // Spark emission for close shave
            for (let pt = 0; pt < 6; pt++) {
              s.particles.push({
                x: s.player.x,
                y: s.player.y,
                vx: (Math.random() - 0.5) * 140,
                vy: (Math.random() - 0.5) * 140,
                size: Math.random() * 3 + 1,
                color: '#38bdf8',
                alpha: 0.9,
                life: 0,
                maxLife: 0.25,
                shape: 'spark',
              });
            }
            onScoreUpdateRef.current(s.score, s.coinsEarned, s.combo);
          }

          // Collision Check
          // Player circle vs Obstacle accurate shape geometry
          const p = s.player;
          // Core hitbox forgiving (9.5px radius vs visual 14px for maximum fairness)
          const hitRadius = p.radius - 4.5;
          let collided = false;

          if (obs.type === 'MOVING_SAW') {
            const sawRadius = obs.width / 2;
            const sawCenterX = obs.x + sawRadius;
            const sawCenterY = obs.y + sawRadius;
            const d = Math.hypot(p.x - sawCenterX, p.y - sawCenterY);
            if (d < hitRadius + sawRadius - 2) {
              collided = true;
            }
          } else if (obs.type === 'SPIKE_FLOOR') {
            // Triangle spike on floor: apex at top center (obs.x + width/2, obs.y), base at floorY
            const isYInRange = p.y + hitRadius > obs.y + 4 && p.y - hitRadius < s.floorY;
            if (isYInRange) {
              const t = Math.max(0, Math.min(1, (p.y - obs.y) / obs.height));
              const halfWidthAtY = (obs.width / 2) * t;
              const spikeCenterX = obs.x + obs.width / 2;
              const leftEdge = spikeCenterX - halfWidthAtY;
              const rightEdge = spikeCenterX + halfWidthAtY;

              if (p.x + hitRadius > leftEdge && p.x - hitRadius < rightEdge) {
                collided = true;
              }
            }
          } else if (obs.type === 'SPIKE_CEILING') {
            // Triangle spike on ceiling: apex at bottom center (obs.x + width/2, obs.y + height), base at ceilY
            const isYInRange = p.y - hitRadius < obs.y + obs.height - 4 && p.y + hitRadius > s.ceilY;
            if (isYInRange) {
              const t = Math.max(0, Math.min(1, (obs.y + obs.height - p.y) / obs.height));
              const halfWidthAtY = (obs.width / 2) * t;
              const spikeCenterX = obs.x + obs.width / 2;
              const leftEdge = spikeCenterX - halfWidthAtY;
              const rightEdge = spikeCenterX + halfWidthAtY;

              if (p.x + hitRadius > leftEdge && p.x - hitRadius < rightEdge) {
                collided = true;
              }
            }
          } else {
            // Rectangular laser barrier or box obstacle
            const closestX = Math.max(obs.x, Math.min(p.x, obs.x + obs.width));
            const closestY = Math.max(obs.y, Math.min(p.y, obs.y + obs.height));
            const distX = p.x - closestX;
            const distY = p.y - closestY;
            if (distX * distX + distY * distY < hitRadius * hitRadius) {
              collided = true;
            }
          }

          if (collided) {
            // If in FEVER mode: Player smashes through obstacle!
            if (s.feverTimeRemaining > 0) {
              // Destroy obstacle into particles!
              for (let pt = 0; pt < 14; pt++) {
                s.particles.push({
                  x: obs.x + obs.width / 2,
                  y: obs.y + obs.height / 2,
                  vx: (Math.random() - 0.5) * 280,
                  vy: (Math.random() - 0.5) * 280,
                  size: Math.random() * 4 + 2,
                  color: '#f97316',
                  alpha: 1,
                  life: 0,
                  maxLife: 0.35,
                  shape: 'spark',
                });
              }
              sound.playTap();
              s.obstacles.splice(i, 1);
              continue;
            }

            // If player has SHIELD: Shield shatters, saving the player!
            if (s.shield) {
              s.shield = false;
              setShieldActive(false);
              s.shakeTime = 0.35;
              s.shakeIntensity = 7;
              sound.playCrash();
              s.floatingTexts.push({
                id: Math.random(),
                x: s.player.x,
                y: s.player.y - 20,
                text: 'KALKAN KIRILDI!',
                color: '#38bdf8',
                alpha: 1,
                vy: -70,
                scale: 1.3,
              });

              // Blue shield shard explosion
              for (let pt = 0; pt < 20; pt++) {
                s.particles.push({
                  x: s.player.x,
                  y: s.player.y,
                  vx: (Math.random() - 0.5) * 240,
                  vy: (Math.random() - 0.5) * 240,
                  size: Math.random() * 4 + 2,
                  color: '#0284c7',
                  alpha: 1,
                  life: 0,
                  maxLife: 0.45,
                  shape: 'spark',
                });
              }

              // Remove the obstacle so player doesn't instantly die next frame
              s.obstacles.splice(i, 1);
              continue;
            }

            // Lethal Collision -> Game Over
            s.running = false;
            sound.playCrash();

            // Screen shake
            s.shakeTime = 0.5;
            s.shakeIntensity = 14;

            // Big player explosion burst
            for (let pt = 0; pt < 35; pt++) {
              s.particles.push({
                x: p.x,
                y: p.y,
                vx: (Math.random() - 0.5) * 350,
                vy: (Math.random() - 0.5) * 350,
                size: Math.random() * 5 + 2,
                color: selectedSkinRef.current.glowColor,
                alpha: 1,
                life: 0,
                maxLife: 0.6,
                shape: 'spark',
              });
            }

            // Callback to UI
            setTimeout(() => {
              onGameOverRef.current(s.score, s.coinsEarned, s.gemsEarned, s.bestCombo);
            }, 650);
            break;
          }

          // Remove offscreen
          if (obs.x + obs.width < -50) {
            s.obstacles.splice(i, 1);
          }
        }

        // Update Particles
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const pt = s.particles[i];
          pt.life += dt;
          pt.x += pt.vx * dt;
          pt.y += pt.vy * dt;
          pt.alpha = 1 - pt.life / pt.maxLife;
          if (pt.life >= pt.maxLife) {
            s.particles.splice(i, 1);
          }
        }

        // Update Floating Texts
        for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
          const ft = s.floatingTexts[i];
          ft.y += ft.vy * dt;
          ft.alpha -= dt * 1.5;
          if (ft.alpha <= 0) {
            s.floatingTexts.splice(i, 1);
          }
        }
      }

      // --- RENDERING PHASE (HTML5 Canvas) ---
      const theme = THEMES[s.themeIdx];

      ctx.save();

      // Screen Shake translation
      if (s.shakeTime > 0) {
        const shakeX = (Math.random() - 0.5) * s.shakeIntensity;
        const shakeY = (Math.random() - 0.5) * s.shakeIntensity;
        ctx.translate(shakeX, shakeY);
      }

      // 1. Background Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, s.height);
      bgGrad.addColorStop(0, theme.bgGradStart);
      bgGrad.addColorStop(1, theme.bgGradEnd);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, s.width, s.height);

      // 2. Parallax Cyber Grid
      ctx.strokeStyle = theme.gridColor;
      ctx.lineWidth = 1;
      const gridSize = 45;
      const offsetX = -(s.distanceTraveled % gridSize);
      for (let x = offsetX; x < s.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, s.ceilY);
        ctx.lineTo(x, s.floorY);
        ctx.stroke();
      }
      for (let y = s.ceilY; y <= s.floorY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(s.width, y);
        ctx.stroke();
      }

      // 3. Ceiling & Floor Neon Beams
      // Ceiling Beam
      ctx.shadowColor = theme.floorCeilGlow;
      ctx.shadowBlur = 15;
      ctx.fillStyle = theme.floorCeilColor;
      ctx.fillRect(0, s.ceilY - 8, s.width, 8);
      // Floor Beam
      ctx.fillRect(0, s.floorY, s.width, 8);
      ctx.shadowBlur = 0;

      // Dark borders above ceiling and below floor
      ctx.fillStyle = '#030508';
      ctx.fillRect(0, 0, s.width, s.ceilY - 8);
      ctx.fillRect(0, s.floorY + 8, s.width, s.height - s.floorY);

      // 4. Draw Collectibles
      s.collectibles.forEach((c) => {
        const pulse = Math.sin(c.pulsePhase) * 2;
        ctx.save();
        ctx.translate(c.x, c.y);

        if (c.type === 'COIN') {
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.arc(0, 0, c.radius + pulse, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(0, 0, (c.radius + pulse) * 0.65, 0, Math.PI * 2);
          ctx.fill();
        } else if (c.type === 'DIAMOND') {
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = 14;
          ctx.fillStyle = '#a855f7';
          ctx.beginPath();
          ctx.moveTo(0, -c.radius - pulse);
          ctx.lineTo(c.radius + pulse, 0);
          ctx.lineTo(0, c.radius + pulse);
          ctx.lineTo(-c.radius - pulse, 0);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#f3e8ff';
          ctx.beginPath();
          ctx.arc(0, 0, 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Power-up badge
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 14;
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(0, 0, c.radius + pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#bae6fd';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Icon letter
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const icon = c.type === 'POWERUP_SHIELD' ? 'S' : c.type === 'POWERUP_MAGNET' ? 'M' : 'T';
          ctx.fillText(icon, 0, 0);
        }

        ctx.restore();
      });

      // 5. Draw Obstacles
      s.obstacles.forEach((obs) => {
        ctx.save();
        ctx.shadowColor = theme.obstacleGlow;
        ctx.shadowBlur = 12;
        ctx.fillStyle = theme.obstacleColor;

        if (obs.type === 'SPIKE_FLOOR') {
          ctx.beginPath();
          ctx.moveTo(obs.x, s.floorY);
          ctx.lineTo(obs.x + obs.width / 2, obs.y);
          ctx.lineTo(obs.x + obs.width, s.floorY);
          ctx.closePath();
          ctx.fill();

          // Inner highlight line
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(obs.x + obs.width / 2, obs.y + 4);
          ctx.lineTo(obs.x + obs.width / 2, s.floorY - 2);
          ctx.stroke();
        } else if (obs.type === 'SPIKE_CEILING') {
          ctx.beginPath();
          ctx.moveTo(obs.x, s.ceilY);
          ctx.lineTo(obs.x + obs.width / 2, obs.y + obs.height);
          ctx.lineTo(obs.x + obs.width, s.ceilY);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(obs.x + obs.width / 2, obs.y + obs.height - 4);
          ctx.lineTo(obs.x + obs.width / 2, s.ceilY + 2);
          ctx.stroke();
        } else if (obs.type === 'MOVING_SAW') {
          const r = obs.width / 2;
          ctx.translate(obs.x + r, obs.y + r);
          ctx.rotate(s.distanceTraveled * 0.05);

          // Draw rotating spiky star
          ctx.beginPath();
          const spikes = 8;
          for (let sp = 0; sp < spikes * 2; sp++) {
            const rad = sp % 2 === 0 ? r : r * 0.55;
            const ang = (sp * Math.PI) / spikes;
            const px = Math.cos(ang) * rad;
            const py = Math.sin(ang) * rad;
            if (sp === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (obs.type === 'LASER_BARRIER') {
          // Pulsing laser beam
          const alpha = 0.7 + Math.sin(now * 0.01) * 0.25;
          ctx.fillStyle = `rgba(244, 63, 94, ${alpha})`;
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

          // Energy core
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(obs.x + obs.width / 2 - 2, obs.y, 4, obs.height);
        }

        ctx.restore();
      });

      // 6. Draw Player Trail
      const activeSkin = selectedSkinRef.current;
      s.player.trail.forEach((t) => {
        if (t.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = t.alpha * 0.6;
        ctx.fillStyle = activeSkin.trailColor;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 7. Draw Player
      if (s.running) {
        ctx.save();
        ctx.translate(s.player.x, s.player.y);
        ctx.scale(s.player.squashX, s.player.squashY);
        ctx.rotate(s.player.angle);

        // Neon Glow
        ctx.shadowColor = s.feverTimeRemaining > 0 ? '#f97316' : activeSkin.glowColor;
        ctx.shadowBlur = s.feverTimeRemaining > 0 ? 25 : 18;
        ctx.fillStyle = s.feverTimeRemaining > 0 ? '#ffedd5' : activeSkin.color;

        // Custom Skin Renderers
        if (activeSkin.type === 'shuriken') {
          ctx.beginPath();
          for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            const r1 = s.player.radius * 1.3;
            const r2 = s.player.radius * 0.4;
            ctx.lineTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
            ctx.lineTo(Math.cos(angle + Math.PI / 4) * r2, Math.sin(angle + Math.PI / 4) * r2);
          }
          ctx.closePath();
          ctx.fill();
        } else if (activeSkin.type === 'cube') {
          ctx.fillRect(-s.player.radius, -s.player.radius, s.player.radius * 2, s.player.radius * 2);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.strokeRect(-s.player.radius * 0.6, -s.player.radius * 0.6, s.player.radius * 1.2, s.player.radius * 1.2);
        } else if (activeSkin.type === 'pixel') {
          // Retro 8-bit stepped diamond
          ctx.fillRect(-10, -10, 20, 20);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-4, -4, 8, 8);
        } else {
          // Default Sphere / Core
          ctx.beginPath();
          ctx.arc(0, 0, s.player.radius, 0, Math.PI * 2);
          ctx.fill();

          // Inner Core Eye / Pupil
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(s.player.radius * 0.25, 0, s.player.radius * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Shield Bubble Overlay
        if (s.shield) {
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 16;
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, s.player.radius + 8 + Math.sin(now * 0.008) * 2, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      }

      // 8. Draw Particles
      s.particles.forEach((pt) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillStyle = pt.color;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 9. Draw Floating Combat/Combo Texts
      s.floatingTexts.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.fillStyle = ft.color;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 10;
        ctx.font = `800 ${Math.floor(16 * ft.scale)}px 'Space Grotesk', sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // 10. Fever Border Effect
      if (s.feverTimeRemaining > 0) {
        ctx.strokeStyle = `rgba(249, 115, 22, ${0.4 + Math.sin(now * 0.02) * 0.3})`;
        ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, s.width - 6, s.height - 6);
      }

      ctx.restore();

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    // Keyboard support for desktop / browser testing
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        if (stateRef.current.paused) {
          handleResume();
        } else {
          handlePause();
        }
        return;
      }

      if (
        e.code === 'Space' ||
        e.code === 'ArrowUp' ||
        e.code === 'ArrowDown' ||
        e.code === 'KeyW' ||
        e.code === 'KeyS'
      ) {
        e.preventDefault();
        handleTap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="game-canvas-container"
      onPointerDown={(e) => {
        e.preventDefault();
        handleTap();
      }}
      className="relative w-full h-full touch-none select-none cursor-pointer overflow-hidden"
    >
      <canvas ref={canvasRef} id="game-canvas" className="w-full h-full block" />

      {/* Floating in-game HUD indicators */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        {/* Active Powerups badges */}
        <div className="flex items-center gap-2">
          {shieldActive && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-400 text-cyan-300 text-xs font-bold shadow-lg shadow-cyan-500/20 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              KALKAN
            </div>
          )}
          {feverActive && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-950/80 border border-orange-400 text-orange-300 text-xs font-black shadow-lg shadow-orange-500/30 animate-bounce">
              🔥 2X FEVER!
            </div>
          )}
        </div>

        {/* Top-Right Action Controls (Pause & How to Play) */}
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="flex items-center gap-2 pointer-events-auto"
        >
          {onOpenHowToPlay && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                sound.playClick();
                stateRef.current.paused = true;
                setIsPaused(true);
                onOpenHowToPlay();
              }}
              className="p-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-cyan-500/40 text-cyan-300 backdrop-blur-md transition shadow-md active:scale-95"
              title="Nasıl Oynanır?"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handlePause}
            className="p-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 backdrop-blur-md transition shadow-md active:scale-95"
            title="Duraklat"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* First-Jump Animated Helper Guide */}
      {!firstJumpDone && (
        <div className="absolute bottom-16 left-0 right-0 flex justify-center pointer-events-none z-10 animate-bounce">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-400 text-cyan-300 text-xs font-black shadow-lg shadow-cyan-500/30 backdrop-blur-md">
            <span>👆 Ekrana Dokun (Yerçekimini Değiştir)</span>
          </div>
        </div>
      )}

      {/* Pause Menu Overlay */}
      {isPaused && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute inset-0 z-40 flex flex-col items-center justify-center p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div className="w-full max-w-xs flex flex-col items-center text-center space-y-4 bg-zinc-950/95 border border-zinc-800 p-5 rounded-3xl shadow-2xl">
            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Pause className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white font-['Space_Grotesk'] tracking-wide">
                OYUN DURAKLATILDI
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Kısa bir mola veya taktik rehberi
              </p>
            </div>

            <div className="w-full space-y-2 pt-2">
              <button
                onClick={handleResume}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-zinc-950 font-black text-xs tracking-wider shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-zinc-950" />
                DEVAM ET
              </button>

              {onOpenHowToPlay && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenHowToPlay();
                  }}
                  className="w-full py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-cyan-500/40 text-cyan-300 font-bold text-xs tracking-wide transition flex items-center justify-center gap-2"
                >
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  NASIL OYNANIR? (REHBER)
                </button>
              )}

              {onExitToMenu && (
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsPaused(false);
                    onExitToMenu();
                  }}
                  className="w-full py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white font-bold text-xs tracking-wide transition flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  ANA MENÜ
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
