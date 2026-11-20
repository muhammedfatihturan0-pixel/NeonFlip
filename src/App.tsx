import React, { useState, useEffect, useCallback } from 'react';
import { GameState, AdModalConfig, Skin } from './types';
import {
  loadPlayerStats,
  savePlayerStats,
  loadDailyQuests,
  saveDailyQuests,
  INITIAL_SKINS,
} from './utils/storage';
import { syncPlayerToLeaderboard } from './utils/leaderboardService';
import { sound } from './utils/audio';
import { GameCanvas } from './components/GameCanvas';
import { StartMenuView } from './components/StartMenuView';
import { GameOverView } from './components/GameOverView';
import { RevivePrompt } from './components/RevivePrompt';
import { ShopModal } from './components/Monetization/ShopModal';
import { AdModal } from './components/Monetization/AdModal';
import { ScoreShareModal } from './components/Viral/ScoreShareModal';
import { DailySpinModal } from './components/Viral/DailySpinModal';
import { MobileFrame } from './components/MobileFrame';
import { LeaderboardModal } from './components/LeaderboardModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { PlayerNameModal } from './components/PlayerNameModal';

export default function App() {
  const [stats, setStats] = useState(loadPlayerStats);
  const [quests, setQuests] = useState(loadDailyQuests);
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [gameRunId, setGameRunId] = useState(1);

  // Active run state
  const [currentScore, setCurrentScore] = useState(0);
  const [currentCoins, setCurrentCoins] = useState(0);
  const [currentGems, setCurrentGems] = useState(0);
  const [bestComboInRun, setBestComboInRun] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [reviveUsedThisRun, setReviveUsedThisRun] = useState(false);
  const [isReviving, setIsReviving] = useState(false);
  const [coinsDoubledThisRun, setCoinsDoubledThisRun] = useState(false);
  const [gamesSinceLastAd, setGamesSinceLastAd] = useState(0);

  // Overlay Modals (kept separate from gameState so opening them never destroys an active game!)
  const [adConfig, setAdConfig] = useState<AdModalConfig | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showNameModal, setShowNameModal] = useState(() => !loadPlayerStats().hasSetProfile);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  // Selected skin
  const selectedSkin: Skin =
    INITIAL_SKINS.find((s) => s.id === stats.selectedSkinId) || INITIAL_SKINS[0];

  // Persist stats, quests, and sync to Global Leaderboard
  useEffect(() => {
    savePlayerStats(stats);
    syncPlayerToLeaderboard(stats, selectedSkin.color);
  }, [stats, selectedSkin.color]);

  useEffect(() => {
    saveDailyQuests(quests);
  }, [quests]);

  // Quest progress helper
  const updateQuestProgress = useCallback(
    (questId: string, value: number, mode: 'add' | 'max' = 'add') => {
      setQuests((prev) =>
        prev.map((q) => {
          if (q.id === questId) {
            const nextVal = mode === 'max' ? Math.max(q.current, value) : q.current + value;
            return { ...q, current: Math.min(q.target, nextVal) };
          }
          return q;
        })
      );
    },
    []
  );

  // Save player nickname or Guest mode
  const handleSavePlayerName = (name: string, isGuest: boolean) => {
    setStats((prev) => ({
      ...prev,
      playerName: isGuest ? 'Misafir' : name,
      isGuest,
      hasSetProfile: true,
    }));
    setShowNameModal(false);
  };

  // Start new game
  const handleStartGame = () => {
    setShowHowToPlay(false);
    setCurrentScore(0);
    setCurrentCoins(0);
    setCurrentGems(0);
    setBestComboInRun(0);
    setIsNewRecord(false);
    setReviveUsedThisRun(false);
    setIsReviving(false);
    setCoinsDoubledThisRun(false);
    setGameRunId((prev) => prev + 1);
    setGameState('PLAYING');

    updateQuestProgress('q_play_3', 1, 'add');
  };

  // Live score update from Canvas
  const handleScoreUpdate = useCallback(
    (score: number, coins: number, combo: number) => {
      setCurrentScore(score);
      setCurrentCoins(coins);
      setBestComboInRun((prev) => Math.max(prev, combo));

      if (score > stats.highScore) {
        setIsNewRecord(true);
      }

      if (combo > 0) {
        updateQuestProgress('q_combo_4', combo, 'max');
      }
      if (score > 0) {
        updateQuestProgress('q_score_25', score, 'max');
      }
    },
    [stats.highScore, updateQuestProgress]
  );

  const finalizeGameOver = useCallback(
    (finalScore: number, finalCoins: number, finalGems: number, finalCombo: number) => {
      const isNewBest = finalScore > stats.highScore;
      setIsNewRecord(isNewBest);

      setStats((prev) => ({
        ...prev,
        highScore: Math.max(prev.highScore, finalScore),
        totalCoins: prev.totalCoins + finalCoins,
        totalGems: prev.totalGems + finalGems,
        totalGames: prev.totalGames + 1,
        bestCombo: Math.max(prev.bestCombo, finalCombo),
      }));

      if (finalGems > 0) {
        updateQuestProgress('q_collect_gems', finalGems, 'add');
      }

      // Interstitial Ad Trigger (every 3 games, unless VIP noAdsOwned)
      const nextGameCount = gamesSinceLastAd + 1;
      setGamesSinceLastAd(nextGameCount);

      if (!stats.noAdsOwned && nextGameCount >= 3) {
        setGamesSinceLastAd(0);
        setAdConfig({
          type: 'INTERSTITIAL',
          title: 'Geçiş Reklamı',
          rewardDescription: 'Oyun Devam Ediyor...',
          durationSeconds: 5,
          onReward: () => {
            setAdConfig(null);
            setGameState('GAMEOVER');
          },
          onClose: () => {
            setGameState('GAMEOVER');
          },
        });
      } else {
        setGameState('GAMEOVER');
      }
    },
    [gamesSinceLastAd, stats.highScore, stats.noAdsOwned, updateQuestProgress]
  );

  // Player died in canvas
  const handleGameOver = useCallback(
    (finalScore: number, finalCoins: number, finalGems: number, finalCombo: number) => {
      setCurrentScore(finalScore);
      setCurrentCoins(finalCoins);
      setCurrentGems(finalGems);
      setBestComboInRun(finalCombo);

      if (finalScore >= 5 && !reviveUsedThisRun) {
        setGameState('REVIVE_PROMPT');
      } else {
        finalizeGameOver(finalScore, finalCoins, finalGems, finalCombo);
      }
    },
    [reviveUsedThisRun, finalizeGameOver]
  );

  // Revive Flow: Watch ad to resurrect
  const handleTriggerReviveAd = () => {
    setAdConfig({
      type: 'REWARDED_REVIVE',
      title: 'Yeniden Canlanma Ödülü',
      rewardDescription: 'Ücretsiz Kalkan + 1 Can',
      durationSeconds: 5,
      onReward: () => {
        setAdConfig(null);
        setReviveUsedThisRun(true);
        setIsReviving(true);
        setGameState('PLAYING');
        setStats((prev) => ({ ...prev, adsWatched: prev.adsWatched + 1 }));
      },
      onClose: () => {
        finalizeGameOver(currentScore, currentCoins, currentGems, bestComboInRun);
      },
    });
  };

  // 2X Coins Flow: Watch ad to double run coins
  const handleDoubleCoins = () => {
    if (coinsDoubledThisRun || currentCoins <= 0) return;
    setAdConfig({
      type: 'REWARDED_2X_COINS',
      title: '2X Altın Katlayıcı',
      rewardDescription: `+${currentCoins} Ekstra Altın`,
      durationSeconds: 5,
      onReward: () => {
        setAdConfig(null);
        setCoinsDoubledThisRun(true);
        setStats((prev) => ({
          ...prev,
          totalCoins: prev.totalCoins + currentCoins,
          adsWatched: prev.adsWatched + 1,
        }));
        setCurrentCoins((c) => c * 2);
      },
    });
  };

  // Watch Ad for Free Coins in Shop
  const handleWatchAdForCoins = () => {
    setAdConfig({
      type: 'REWARDED_2X_COINS',
      title: 'Ücretsiz Altın Ödülü',
      rewardDescription: '+100 Altın',
      durationSeconds: 5,
      onReward: () => {
        setAdConfig(null);
        setStats((prev) => ({
          ...prev,
          totalCoins: prev.totalCoins + 100,
          adsWatched: prev.adsWatched + 1,
        }));
      },
    });
  };

  // Watch Ad for Free Skin
  const handleWatchAdForSkin = (skinId: string) => {
    setAdConfig({
      type: 'REWARDED_SKIN',
      title: 'Özel Görünüm Ödülü',
      rewardDescription: 'Görünüm için +1 Reklam Puanı',
      durationSeconds: 5,
      onReward: () => {
        setAdConfig(null);
        setStats((prev) => {
          const newAdsCount = prev.adsWatched + 1;
          const currentProgress = (prev.skinAdProgress?.[skinId] || 0) + 1;
          const targetSkin = INITIAL_SKINS.find((s) => s.id === skinId);
          const required = targetSkin?.requiredAds || 3;
          const newUnlocked = [...prev.unlockedSkins];
          let newSelected = prev.selectedSkinId;

          if (currentProgress >= required && !newUnlocked.includes(skinId)) {
            newUnlocked.push(skinId);
            newSelected = skinId;
          }

          return {
            ...prev,
            adsWatched: newAdsCount,
            skinAdProgress: {
              ...(prev.skinAdProgress || {}),
              [skinId]: currentProgress,
            },
            unlockedSkins: newUnlocked,
            selectedSkinId: newSelected,
          };
        });
      },
    });
  };

  // Watch Ad for Extra Daily Spin
  const handleWatchAdForExtraSpin = () => {
    setAdConfig({
      type: 'REWARDED_DAILY_SPIN',
      title: 'Ekstra Şans Çarkı Hakkı',
      rewardDescription: '+1 Ücretsiz Çevirme Hakkı',
      durationSeconds: 5,
      onReward: () => {
        setAdConfig(null);
        setStats((prev) => ({
          ...prev,
          lastSpinTimestamp: 0,
          adsWatched: prev.adsWatched + 1,
        }));
      },
    });
  };

  // Claim quest
  const handleClaimQuest = (questId: string) => {
    const q = quests.find((item) => item.id === questId);
    if (!q || q.claimed) return;

    setQuests((prev) =>
      prev.map((item) => (item.id === questId ? { ...item, claimed: true } : item))
    );

    if (q.rewardType === 'coins') {
      setStats((prev) => ({ ...prev, totalCoins: prev.totalCoins + q.rewardAmount }));
    } else {
      setStats((prev) => ({ ...prev, totalGems: prev.totalGems + q.rewardAmount }));
    }
  };

  // Audio toggles
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
  };

  const handleToggleHaptics = () => {
    const next = !hapticsEnabled;
    setHapticsEnabled(next);
    sound.hapticsEnabled = next;
  };

  const displayName = stats.isGuest ? 'Misafir' : stats.playerName || 'Misafir';

  return (
    <MobileFrame>
      <div className="relative w-full h-full bg-zinc-950 overflow-hidden select-none font-sans">
        {/* Game Canvas (Active when PLAYING, REVIVE_PROMPT or GAMEOVER) */}
        {(gameState === 'PLAYING' ||
          gameState === 'REVIVE_PROMPT' ||
          gameState === 'GAMEOVER') && (
          <GameCanvas
            key={gameRunId}
            selectedSkin={selectedSkin}
            activePowerup={null}
            onGameOver={handleGameOver}
            onScoreUpdate={handleScoreUpdate}
            onReviveUsed={() => setIsReviving(false)}
            isReviving={isReviving}
            powerupLevels={stats.powerupLevels}
            highScore={stats.highScore}
            onExitToMenu={() => setGameState('MENU')}
            onOpenHowToPlay={() => setShowHowToPlay(true)}
          />
        )}

        {/* In-Game Live Score HUD */}
        {gameState === 'PLAYING' && (
          <div className="absolute top-10 left-0 right-0 flex flex-col items-center pointer-events-none z-10">
            <span className="text-5xl font-black text-white font-['Space_Grotesk'] drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]">
              {currentScore}
            </span>
            {bestComboInRun >= 3 && (
              <span className="text-xs font-black text-cyan-300 uppercase tracking-wider bg-cyan-950/70 px-2.5 py-0.5 rounded-full border border-cyan-500/40 mt-1 animate-pulse">
                {bestComboInRun}X KOMBO
              </span>
            )}
          </div>
        )}

        {/* Start Menu View */}
        {gameState === 'MENU' && (
          <StartMenuView
            stats={stats}
            selectedSkin={selectedSkin}
            soundEnabled={soundEnabled}
            hapticsEnabled={hapticsEnabled}
            onToggleSound={handleToggleSound}
            onToggleHaptics={handleToggleHaptics}
            onStartGame={handleStartGame}
            onOpenShop={() => setGameState('SHOP')}
            onOpenSpin={() => setGameState('DAILY_SPIN')}
            onOpenLeaderboard={() => setGameState('LEADERBOARD')}
            onOpenHowToPlay={() => setShowHowToPlay(true)}
            onEditPlayerName={() => setShowNameModal(true)}
          />
        )}

        {/* Revive Ad Prompt */}
        {gameState === 'REVIVE_PROMPT' && (
          <RevivePrompt
            score={currentScore}
            onWatchAdRevive={handleTriggerReviveAd}
            onSkipRevive={() =>
              finalizeGameOver(currentScore, currentCoins, currentGems, bestComboInRun)
            }
          />
        )}

        {/* Game Over Screen */}
        {gameState === 'GAMEOVER' && (
          <GameOverView
            stats={stats}
            skinColor={selectedSkin.color}
            score={currentScore}
            highScore={stats.highScore}
            coinsEarned={currentCoins}
            isNewHigh={isNewRecord}
            bestCombo={bestComboInRun}
            noAdsOwned={stats.noAdsOwned}
            coinsDoubled={coinsDoubledThisRun}
            onPlayAgain={handleStartGame}
            onDoubleCoins={handleDoubleCoins}
            onOpenShop={() => setGameState('SHOP')}
            onOpenShare={() => setShowShareModal(true)}
            onOpenLeaderboard={() => setGameState('LEADERBOARD')}
            onOpenSpin={() => setGameState('DAILY_SPIN')}
            onOpenHowToPlay={() => setShowHowToPlay(true)}
          />
        )}

        {/* Shop Modal */}
        {gameState === 'SHOP' && (
          <ShopModal
            stats={stats}
            onUpdateStats={setStats}
            onClose={() => setGameState('MENU')}
            onWatchAdForSkin={handleWatchAdForSkin}
            onWatchAdForCoins={handleWatchAdForCoins}
          />
        )}

        {/* Daily Spin Modal */}
        {gameState === 'DAILY_SPIN' && (
          <DailySpinModal
            stats={stats}
            onUpdateStats={setStats}
            onWatchAdForExtraSpin={handleWatchAdForExtraSpin}
            onClose={() => setGameState('MENU')}
          />
        )}

        {/* Leaderboard Modal */}
        {gameState === 'LEADERBOARD' && (
          <LeaderboardModal
            stats={stats}
            skinColor={selectedSkin.color}
            quests={quests}
            onClaimQuest={handleClaimQuest}
            onEditName={() => setShowNameModal(true)}
            onClose={() => setGameState('MENU')}
          />
        )}

        {/* How to Play Overlay (Never unmounts active GameCanvas!) */}
        {showHowToPlay && (
          <HowToPlayModal
            onClose={() => setShowHowToPlay(false)}
            onStartGame={() => {
              setShowHowToPlay(false);
              if (gameState !== 'PLAYING') {
                handleStartGame();
              }
            }}
          />
        )}

        {/* Player Nickname / Guest Selection Modal */}
        {showNameModal && (
          <PlayerNameModal
            currentName={stats.playerName}
            isGuest={stats.isGuest}
            canClose={stats.hasSetProfile}
            onSaveName={handleSavePlayerName}
            onClose={() => setShowNameModal(false)}
          />
        )}

        {/* Score Share Card Modal */}
        {showShareModal && (
          <ScoreShareModal
            playerName={displayName}
            score={currentScore}
            highScore={stats.highScore}
            bestCombo={bestComboInRun}
            onClose={() => setShowShareModal(false)}
          />
        )}

        {/* Ad Modal (Rewarded / Interstitial) */}
        {adConfig && (
          <AdModal
            config={adConfig}
            onRewardClaimed={adConfig.onReward}
            onDismiss={() => {
              adConfig.onClose?.();
              setAdConfig(null);
            }}
          />
        )}
      </div>
    </MobileFrame>
  );
}
