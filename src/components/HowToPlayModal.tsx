import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/audio';
import {
  X,
  Gamepad2,
  Shield,
  Magnet,
  Hourglass,
  Flame,
  Zap,
  Sparkles,
  HelpCircle,
  Coins,
  Gem,
  AlertTriangle,
  Play,
  ArrowUpDown,
  CheckCircle2,
} from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
  onStartGame?: () => void;
}

type TabType = 'CONTROLS' | 'OBSTACLES' | 'POWERUPS' | 'PRO_TIPS';

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  onClose,
  onStartGame,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('CONTROLS');

  // Mini Interactive Flip Playground State
  const [ballPosition, setBallPosition] = useState<'bottom' | 'top'>('bottom');
  const [testFlips, setTestFlips] = useState(0);
  const [sparkleVisible, setSparkleVisible] = useState(false);

  const handleTestFlip = () => {
    const nextPos = ballPosition === 'bottom' ? 'top' : 'bottom';
    setBallPosition(nextPos);
    setTestFlips((prev) => prev + 1);
    sound.playFlip(nextPos === 'top' ? 'up' : 'down');
    setSparkleVisible(true);
    setTimeout(() => setSparkleVisible(false), 300);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-sm max-h-[92vh] flex flex-col rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-4 border-b border-zinc-800/80 flex items-center justify-between bg-gradient-to-r from-cyan-950/40 via-zinc-900/60 to-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-wide">
                NASIL OYNANIR?
              </h2>
              <p className="text-[11px] text-cyan-400/90 font-semibold">
                Oyun Rehberi & Şampiyon Taktikleri
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-zinc-900/90 border-b border-zinc-800/70 text-center">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('CONTROLS');
            }}
            className={`py-2 px-1 rounded-xl text-[11px] font-black transition flex flex-col items-center gap-1 ${
              activeTab === 'CONTROLS'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            Kontrol
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('OBSTACLES');
            }}
            className={`py-2 px-1 rounded-xl text-[11px] font-black transition flex flex-col items-center gap-1 ${
              activeTab === 'OBSTACLES'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Engeller
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('POWERUPS');
            }}
            className={`py-2 px-1 rounded-xl text-[11px] font-black transition flex flex-col items-center gap-1 ${
              activeTab === 'POWERUPS'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Güçler
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('PRO_TIPS');
            }}
            className={`py-2 px-1 rounded-xl text-[11px] font-black transition flex flex-col items-center gap-1 ${
              activeTab === 'PRO_TIPS'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Taktikler
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-zinc-300 text-xs">
          {/* TAB 1: CONTROLS & MINI DEMO */}
          {activeTab === 'CONTROLS' && (
            <div className="space-y-4">
              {/* Interactive Playground Box */}
              <div
                onClick={handleTestFlip}
                className="cursor-pointer relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-dashed border-cyan-500/50 p-4 flex flex-col items-center justify-between h-36 select-none active:scale-[0.98] transition group"
              >
                {/* Ceiling Line */}
                <div className="w-full h-2 rounded-full bg-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.5)] flex items-center justify-center">
                  <span className="text-[9px] uppercase tracking-wider text-cyan-300 font-bold opacity-75">
                    Tavan Sınırı
                  </span>
                </div>

                {/* Animated / Interactive Ball */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                    ballPosition === 'bottom'
                      ? 'translate-y-5 shadow-[0_0_20px_#06b6d4] bg-cyan-400'
                      : '-translate-y-5 shadow-[0_0_20px_#f43f5e] bg-rose-400'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-white animate-ping opacity-75" />
                  <div className="absolute w-2.5 h-2.5 rounded-full bg-white" />
                </div>

                {/* Floor Line */}
                <div className="w-full h-2 rounded-full bg-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.5)] flex items-center justify-center">
                  <span className="text-[9px] uppercase tracking-wider text-cyan-300 font-bold opacity-75">
                    Zemin Sınırı
                  </span>
                </div>

                {/* Tap Helper Hint */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/10">
                  <span className="px-2.5 py-1 rounded-full bg-zinc-900/90 border border-cyan-500/50 text-[10px] font-black text-cyan-300 shadow-md">
                    👆 BURAYA DOKUN VE DENE! ({testFlips} Takla)
                  </span>
                </div>
              </div>

              {/* Instructions List */}
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Tek Dokunuş Yerçekimi</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">
                      Ekranda <strong className="text-cyan-300">herhangi bir noktaya</strong> dokunduğunda karakterin taban ve tavan arasında anında yerçekimini tersine çevirir.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
                    <Gamepad2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Klavye & Masaüstü Desteği</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">
                      Bilgisayarda oynarken <strong className="text-indigo-300">Boşluk (Space)</strong>, <strong className="text-indigo-300">Yukarı/Aşağı</strong> yön veya <strong className="text-indigo-300">W / S</strong> tuşlarını kullanabilirsin.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Ritim ve Öngörü</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">
                      Engelleri son anda fark etmek yerine, yaklaşan objeyi görüp yerçekimini vaktinde tersine çevir.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OBSTACLES */}
          {activeTab === 'OBSTACLES' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                  <div className="w-3 h-3 border-b-4 border-l-4 border-rose-500 rotate-45" />
                  Zemin & Tavan Dikenleri
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Zeminde veya tavanda sabit duran neon dikenlerdir. Diken hangi yüzeydeyse hemen karşı yüzeye geçerek kaçın.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                  <div className="w-2.5 h-2.5 bg-rose-500 rounded-sm" />
                  İkili Dikenler (Dual Spikes)
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Biri zeminde, biri tavanda peş peşe gelir. Aralarındaki geniş boşlukta tam zamanında takla atarak ikisinin de üzerinden güvenle süzül.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-orange-400 font-bold text-xs">
                  <span className="text-base leading-none">⚙️</span>
                  Hareketli Testereler (Moving Saw)
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Yukarı ve aşağı yavaşça salınan dönen testerelerdir. Testerenin gittiği yönün tersindeki boşluğu kullanarak sıyrıl.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                  <span className="text-base leading-none">⚡</span>
                  Lazer Bariyeri (Laser Barrier)
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Yarı saydam kırmızı ışın bariyeri. Lazerin kapsamadığı açık koridoru (taban veya tavan) tercih et.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: POWER-UPS */}
          {activeTab === 'POWERUPS' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-cyan-300 text-xs">Kalkan Küresi (Shield)</h4>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    Etrafında koruyucu bir enerji kalkanı oluşturur. <strong className="text-cyan-300">1 ölümcül çarpmayı</strong> tamamen yutar ve seni hayatta tutar!
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-pink-950/40 border border-pink-500/30 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 shrink-0">
                  <Magnet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-pink-300 text-xs">Mıknatıs (Coin Magnet)</h4>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    Yakındaki tüm altın ve elmasları doğrudan üzerine çeker. Zahmetsizce kasa doldurmanın en iyi yoludur.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Hourglass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-300 text-xs">Ağır Çekim (Slow-Mo)</h4>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    Dünyayı yavaşlatarak sana Matrix tarzı refleks süresi verir. Yoğun engel koridorlarını tereyağından kıl çeker gibi geçersin.
                  </p>
                </div>
              </div>

              {/* Shop Upgrade Tip */}
              <div className="p-3 rounded-xl bg-zinc-900 border border-amber-500/30 text-[11px] text-amber-300/90 flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>İpucu:</strong> Mağazadan bu güçlendiricilerin sürelerini altınlarınla kalıcı olarak uzatabilirsin!
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: PRO TIPS & COMBOS */}
          {activeTab === 'PRO_TIPS' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-950/60 to-zinc-900 border border-orange-500/40 space-y-1.5">
                <div className="flex items-center gap-2 text-orange-400 font-black text-xs">
                  <Flame className="w-4 h-4" />
                  FEVER MODU (5x Kombo)
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Art arda 5 engeli atlattığında karakterin alev alır! FEVER süresince engellere çarpsan dahi onları yok edersin ve toplanan tüm altınlar <strong className="text-orange-400">2 Katı</strong> değer kazanır.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-cyan-500/30 space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                  <Zap className="w-4 h-4" />
                  Teğet Geçiş Bonusu (Close Call)
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Dikenlerin hemen yanından sıyrılarak geçtiğinde ekranda <em>⚡ TEĞET GEÇİŞ</em> uyarısı belirir ve sana <strong className="text-cyan-300">+1 Ekstra Altın</strong> kazandırır!
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-amber-500/30 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Coins className="w-4 h-4" />
                  2X Altın Katlayıcı
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Her koşunun sonunda topladığın tüm altınları tek bir ödüllü reklamla ikiye katlayabilir, yeni efsanevi skinleri çok daha hızlı açabilirsin.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-purple-500/30 space-y-1.5">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                  <Gem className="w-4 h-4" />
                  Günlük Çark ve Görevler
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Her gün şans çarkını çevirerek ve Liderlik panosundaki günlük görevleri tamamlayarak bedava elmas ve coin topla!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA Bar */}
        <div className="p-3.5 border-t border-zinc-800/80 bg-zinc-950 flex items-center gap-2">
          {onStartGame ? (
            <button
              onClick={() => {
                sound.playTap();
                onClose();
                onStartGame();
              }}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-zinc-950 font-black text-xs tracking-wider shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-zinc-950" />
              HEMEN OYNA
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="flex-1 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-black text-xs tracking-wider transition"
            >
              ANLADIM, KAPAT
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
