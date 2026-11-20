import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { sanitizePlayerName } from '../utils/leaderboardService';
import { User, Trophy, Sparkles, ArrowRight, X } from 'lucide-react';

interface PlayerNameModalProps {
  currentName: string;
  isGuest: boolean;
  canClose: boolean;
  onSaveName: (name: string, isGuest: boolean) => void;
  onClose?: () => void;
}

export const PlayerNameModal: React.FC<PlayerNameModalProps> = ({
  currentName,
  isGuest,
  canClose,
  onSaveName,
  onClose,
}) => {
  const [inputName, setInputName] = useState(isGuest ? '' : currentName);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmName = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = sanitizePlayerName(inputName);
    if (cleaned.length < 2) {
      sound.playCrash();
      setError('Lütfen en az 2 karakterli bir oyuncu adı gir veya Misafir olarak devam et.');
      return;
    }
    sound.playCash();
    onSaveName(cleaned, false);
  };

  const handleContinueAsGuest = () => {
    sound.playClick();
    onSaveName('Misafir', true);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-cyan-500/40 p-6 shadow-2xl">
        {canClose && onClose && (
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* App Icon + Title */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl shadow-cyan-500/25 border border-cyan-400/40 mb-3">
            <img
              src="/pwa-192x192.png"
              alt="ZYPHOR"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-black tracking-wider uppercase mb-1.5">
            <Trophy className="w-3 h-3 text-amber-400" />
            KÜRESEL LİDERLİK TABLOSU
          </div>
          <h2 className="text-xl font-black text-white font-['Space_Grotesk']">
            {canClose ? 'Oyuncu Adını Düzenle' : 'ZYPHOR Arenasına Hoş Geldin!'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Küresel sıralamada görünmek için bir takma ad seç. İstemezsen doğrudan{' '}
            <strong className="text-zinc-200">Misafir</strong> olarak başlayabilirsin.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleConfirmName} className="space-y-3">
          <div>
            <label
              htmlFor="player-nickname-input"
              className="block text-[11px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider"
            >
              Oyuncu Adı (2-16 Karakter)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="player-nickname-input"
                type="text"
                maxLength={16}
                value={inputName}
                onChange={(e) => {
                  setInputName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Örn: KaanPro, ZyphorKing..."
                autoComplete="off"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-cyan-400 focus:outline-none text-sm font-bold text-white placeholder:text-zinc-600 transition"
              />
            </div>
            {error && (
              <p className="text-[11px] font-semibold text-rose-400 mt-1.5">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-zinc-950 font-black text-sm shadow-xl shadow-cyan-500/25 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            İSİMLE DEVAM ET
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Guest Option */}
        <div className="mt-3 pt-3 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={handleContinueAsGuest}
            className="w-full py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/70 text-zinc-300 hover:text-white text-xs font-bold transition active:scale-95"
          >
            Misafir Olarak Devam Et
          </button>
          <p className="text-[10px] text-zinc-500 text-center mt-2">
            İsmini istediğin zaman ana menüden veya liderlik tablosundan değiştirebilirsin.
          </p>
        </div>
      </div>
    </div>
  );
};
