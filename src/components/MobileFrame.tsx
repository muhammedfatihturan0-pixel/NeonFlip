import React, { useState, useEffect } from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { Maximize2, Minimize2, Smartphone, Monitor } from 'lucide-react';
import { sound } from '../utils/audio';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const [isFrameEmulated, setIsFrameEmulated] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState('12:00');

  useEffect(() => {
    // Update mobile frame clock
    const updateClock = () => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      setCurrentTime(`${h}:${m}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    sound.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="w-full h-screen max-h-screen bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden select-none p-0 md:p-3">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Desktop Helper Bar (visible only on desktop md+ screens) */}
      <div className="hidden md:flex items-center justify-between w-full max-w-4xl px-4 py-1.5 mb-1 z-20 text-xs">
        <div className="flex items-center gap-3">
          <img src="/favicon.png" alt="ZYPHOR" className="w-5 h-5 rounded-md" />
          <span className="font-black tracking-wider text-cyan-400">
            ZYPHOR • MOBİL ÖNİZLEME
          </span>
          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] font-bold">
            60 FPS MOTOR
          </span>
        </div>

        <div className="flex items-center gap-3">
          <PWAInstallButton />

          <button
            onClick={() => {
              sound.playClick();
              setIsFrameEmulated(!isFrameEmulated);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition"
            title="Telefon Çerçevesini Aç/Kapat"
          >
            {isFrameEmulated ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                Geniş Görünüm
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                Mobil Çerçeve
              </>
            )}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
            title="Tam Ekran"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Container: Emulated Device Frame or Full Screen */}
      <div
        className={`relative transition-all duration-300 ${
          isFrameEmulated
            ? 'w-full h-full md:w-[390px] md:h-[90vh] md:max-h-[760px] md:rounded-[40px] md:border-[8px] md:border-zinc-800 md:shadow-[0_0_60px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden bg-black'
            : 'w-full h-full flex flex-col overflow-hidden bg-black'
        }`}
      >
        {/* Mobile Device Status Bar (Mock Android Header on desktop) */}
        {isFrameEmulated && (
          <div className="hidden md:flex h-7 px-6 bg-zinc-950 text-zinc-400 text-[11px] font-bold items-center justify-between z-30 select-none border-b border-zinc-900/60">
            <span>{currentTime}</span>

            {/* Android Punch Hole Camera */}
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-zinc-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
            </div>

            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <div className="w-4 h-2.5 rounded-xs border border-zinc-400 flex items-center p-0.5">
                <div className="h-full w-3/4 bg-zinc-300 rounded-xs" />
              </div>
            </div>
          </div>
        )}

        {/* Screen Content Viewport */}
        <div className="relative flex-1 w-full h-full overflow-hidden">{children}</div>

        {/* Mock Android Home Navigation Bar */}
        {isFrameEmulated && (
          <div className="hidden md:flex h-5 bg-zinc-950 items-center justify-center z-30">
            <div className="w-32 h-1 bg-zinc-600/60 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};
