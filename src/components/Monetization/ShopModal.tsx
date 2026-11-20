import React, { useState } from 'react';
import { Skin, PlayerStats } from '../../types';
import { INITIAL_SKINS } from '../../utils/storage';
import { sound } from '../../utils/audio';
import {
  Coins,
  Gem,
  Check,
  Lock,
  Zap,
  Shield,
  Magnet,
  Hourglass,
  Sparkles,
  Tv,
  ArrowLeft,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShopModalProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  onClose: () => void;
  onWatchAdForSkin: (skinId: string) => void;
  onWatchAdForCoins: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  stats,
  onUpdateStats,
  onClose,
  onWatchAdForSkin,
  onWatchAdForCoins,
}) => {
  const [tab, setTab] = useState<'skins' | 'upgrades' | 'rewards'>('skins');
  const [purchaseSuccessMessage, setPurchaseSuccessMessage] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    sound.playCash();
    setPurchaseSuccessMessage(msg);
    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.5 } });
    } catch {
      // safe
    }
    setTimeout(() => setPurchaseSuccessMessage(null), 3000);
  };

  const handleSelectSkin = (skinId: string) => {
    sound.playClick();
    onUpdateStats({
      ...stats,
      selectedSkinId: skinId,
    });
  };

  const handleBuySkin = (skin: Skin) => {
    if (skin.currency === 'coins') {
      if (stats.totalCoins < skin.price) {
        sound.playCrash();
        return;
      }
      const newCoins = stats.totalCoins - skin.price;
      const newUnlocked = [...stats.unlockedSkins, skin.id];
      onUpdateStats({
        ...stats,
        totalCoins: newCoins,
        unlockedSkins: newUnlocked,
        selectedSkinId: skin.id,
      });
      showSuccess(`${skin.name} açıldı!`);
    } else if (skin.currency === 'gems') {
      if (stats.totalGems < skin.price) {
        sound.playCrash();
        return;
      }
      const newGems = stats.totalGems - skin.price;
      const newUnlocked = [...stats.unlockedSkins, skin.id];
      onUpdateStats({
        ...stats,
        totalGems: newGems,
        unlockedSkins: newUnlocked,
        selectedSkinId: skin.id,
      });
      showSuccess(`${skin.name} açıldı!`);
    } else if (skin.currency === 'ads') {
      onWatchAdForSkin(skin.id);
    }
  };

  const handleUpgradePowerup = (type: 'shield' | 'magnet' | 'slowmo', label: string, cost: number) => {
    if (stats.totalCoins < cost) {
      sound.playCrash();
      return;
    }
    const currentLvl = stats.powerupLevels[type];
    onUpdateStats({
      ...stats,
      totalCoins: stats.totalCoins - cost,
      powerupLevels: {
        ...stats.powerupLevels,
        [type]: currentLvl + 1,
      },
    });
    showSuccess(`${label} Seviye ${currentLvl + 1} oldu!`);
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-zinc-950 text-white animate-in fade-in duration-200">
      {/* Top Header Bar */}
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

        {/* Currency balances */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-black">
            <Coins className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {stats.totalCoins}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/40 text-purple-300 text-xs font-black">
            <Gem className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
            {stats.totalGems}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 p-2 bg-zinc-900/60 border-b border-zinc-800 gap-1.5">
        <button
          onClick={() => {
            sound.playClick();
            setTab('skins');
          }}
          className={`py-2 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
            tab === 'skins'
              ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          GÖRÜNÜM
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setTab('upgrades');
          }}
          className={`py-2 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
            tab === 'upgrades'
              ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          GÜÇLENDİR
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setTab('rewards');
          }}
          className={`py-2 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
            tab === 'rewards'
              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'text-amber-400 hover:text-amber-300'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          ÜCRETSİZ
        </button>
      </div>

      {/* Purchase Notification Banner */}
      {purchaseSuccessMessage && (
        <div className="bg-emerald-500 text-zinc-950 text-xs font-black py-2 text-center animate-bounce">
          {purchaseSuccessMessage}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-lg mx-auto w-full">
        {/* SKINS TAB */}
        {tab === 'skins' && (
          <div className="grid grid-cols-2 gap-3">
            {INITIAL_SKINS.map((skin) => {
              const isUnlocked = stats.unlockedSkins.includes(skin.id);
              const isSelected = stats.selectedSkinId === skin.id;

              return (
                <div
                  key={skin.id}
                  className={`relative p-3.5 rounded-2xl border transition flex flex-col items-center text-center ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-400 shadow-lg shadow-cyan-500/20'
                      : isUnlocked
                      ? 'bg-zinc-900 border-zinc-700'
                      : 'bg-zinc-900/60 border-zinc-800 opacity-95'
                  }`}
                >
                  {/* Tag */}
                  {skin.tag && (
                    <span className="absolute top-2 right-2 text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-cyan-300 border border-cyan-500/30">
                      {skin.tag}
                    </span>
                  )}

                  {/* Visual Preview */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center my-2 shadow-lg"
                    style={{
                      backgroundColor: skin.color,
                      boxShadow: `0 0 16px ${skin.glowColor}`,
                    }}
                  >
                    <div className="w-4 h-4 rounded-full bg-white/90" />
                  </div>

                  <h4 className="text-sm font-black text-white">{skin.name}</h4>
                  {skin.perk ? (
                    <p className="text-[10px] text-zinc-400 mb-3">{skin.perk}</p>
                  ) : (
                    <p className="text-[10px] text-zinc-500 mb-3">Standart Çekirdek</p>
                  )}

                  {/* Actions */}
                  {isSelected ? (
                    <button
                      disabled
                      className="w-full py-2 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-black flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> SEÇİLİ
                    </button>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => handleSelectSkin(skin.id)}
                      className="w-full py-2 rounded-xl bg-zinc-700 hover:bg-cyan-500 hover:text-zinc-950 text-white text-xs font-black transition"
                    >
                      KULLAN
                    </button>
                  ) : skin.currency === 'ads' ? (
                    <button
                      onClick={() => handleBuySkin(skin)}
                      className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black flex items-center justify-center gap-1 transition shadow-md shadow-sky-600/30"
                    >
                      <Tv className="w-3.5 h-3.5" /> REKLAM ({stats.skinAdProgress?.[skin.id] || 0}/{skin.requiredAds || 3})
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuySkin(skin)}
                      className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black flex items-center justify-center gap-1 transition"
                    >
                      <Lock className="w-3 h-3" />
                      {skin.price} {skin.currency === 'coins' ? 'Altın' : 'Elmas'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* UPGRADES TAB */}
        {tab === 'upgrades' && (
          <div className="space-y-3">
            {/* Shield Upgrade */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Enerji Kalkanı</h4>
                  <p className="text-xs text-zinc-400">
                    Oyuna enerji kalkanıyla başla (Seviye {stats.powerupLevels.shield})
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  handleUpgradePowerup('shield', 'Enerji Kalkanı', stats.powerupLevels.shield * 300)
                }
                className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-black transition whitespace-nowrap"
              >
                {stats.powerupLevels.shield * 300} Altın
              </button>
            </div>

            {/* Magnet Upgrade */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-pink-950 border border-pink-500/40 text-pink-400">
                  <Magnet className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Altın Mıknatısı</h4>
                  <p className="text-xs text-zinc-400">
                    Mıknatıs süresi: {9 + stats.powerupLevels.magnet * 2} sn (Seviye{' '}
                    {stats.powerupLevels.magnet})
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  handleUpgradePowerup('magnet', 'Altın Mıknatısı', stats.powerupLevels.magnet * 250)
                }
                className="px-3.5 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-zinc-950 text-xs font-black transition whitespace-nowrap"
              >
                {stats.powerupLevels.magnet * 250} Altın
              </button>
            </div>

            {/* Slow-Mo Upgrade */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-400">
                  <Hourglass className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Zaman Yavaşlatıcı</h4>
                  <p className="text-xs text-zinc-400">
                    Ağır çekim süresi: {7 + stats.powerupLevels.slowmo * 1.5} sn (Seviye{' '}
                    {stats.powerupLevels.slowmo})
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  handleUpgradePowerup('slowmo', 'Zaman Yavaşlatıcı', stats.powerupLevels.slowmo * 200)
                }
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black transition whitespace-nowrap"
              >
                {stats.powerupLevels.slowmo * 200} Altın
              </button>
            </div>
          </div>
        )}

        {/* FREE REWARDED ADS TAB (Real ad-revenue driver, safe for Play Store review) */}
        {tab === 'rewards' && (
          <div className="space-y-3.5">
            {/* Watch Ad for Bonus Coins */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 to-zinc-900 border border-amber-500/40 flex items-center justify-between gap-3 shadow-xl">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                  ÖDÜLLÜ REKLAM
                </span>
                <h4 className="text-base font-black text-white">+100 Ücretsiz Altın</h4>
                <p className="text-xs text-zinc-400">
                  Kısa bir reklam izle, anında 100 Altın kazan!
                </p>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onWatchAdForCoins();
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 text-xs font-black hover:brightness-110 active:scale-95 transition shadow-lg shadow-amber-500/25 flex items-center gap-1.5 whitespace-nowrap"
              >
                <Tv className="w-3.5 h-3.5" />
                İZLE
              </button>
            </div>

            {/* Watch Ad for Exclusive Skin Progress */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-sky-500/35 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider">
                  ÖZEL GÖRÜNÜM
                </span>
                <h4 className="text-base font-black text-white">Kronos Hükümdarı</h4>
                <p className="text-xs text-zinc-400">
                  3 ödüllü reklam izle, bu özel görünümü ücretsiz aç ({stats.skinAdProgress?.skin_ad_master || 0}/3)
                </p>
              </div>
              {stats.unlockedSkins.includes('skin_ad_master') ? (
                <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-black border border-emerald-500/40">
                  AÇILDI
                </span>
              ) : (
                <button
                  onClick={() => {
                    sound.playClick();
                    onWatchAdForSkin('skin_ad_master');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 text-xs font-black active:scale-95 transition flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Tv className="w-3.5 h-3.5" />
                  İZLE
                </button>
              )}
            </div>

            {/* Play Billing Notice */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex items-start gap-2.5 text-zinc-400 text-xs">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Tüm görünümler ve güçlendirmeler oyun içi Altın, Elmas veya ödüllü reklamlarla tamamen ücretsiz açılabilir.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
