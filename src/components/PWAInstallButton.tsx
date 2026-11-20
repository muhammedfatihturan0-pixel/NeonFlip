import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Play Store uygulamasının içinde "uygulamayı yükle" düğmesi anlamsız.
  if (isInstalled || Capacitor.isNativePlatform()) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-full bg-cyan-500 hover:bg-cyan-400 px-3.5 py-1.5 text-xs font-black text-zinc-950 shadow-md shadow-cyan-500/25 transition active:scale-95"
      >
        <img src="/favicon.png" alt="ZYPHOR" className="w-4 h-4 rounded-sm" />
        <Download className="w-3.5 h-3.5" />
        ZYPHOR'u Yükle
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-[11px] font-bold text-zinc-200 hover:bg-zinc-700 transition"
        >
          <img src="/favicon.png" alt="ZYPHOR" className="w-4 h-4 rounded-sm" />
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          Ana Ekrana Ekle (iOS)
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
            <div className="w-full max-w-xs rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-xl text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl overflow-hidden border border-cyan-500/40">
                <img src="/pwa-192x192.png" alt="ZYPHOR" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-base font-black text-white mb-2">ZYPHOR'u iPhone'a Ekle</h3>
              <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
                1. Safari alt menüsündeki <strong>Paylaş</strong> ikonuna dokunun.<br />
                2. Aşağı kaydırıp <strong>Ana Ekrana Ekle</strong>'yi seçin.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-cyan-500 py-2.5 text-xs font-black text-zinc-950"
              >
                Tamam
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
