import React, { useRef, useEffect, useState } from 'react';
import { sound } from '../../utils/audio';
import { Share2, Download, Copy, Check, X, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScoreShareModalProps {
  playerName: string;
  score: number;
  highScore: number;
  bestCombo: number;
  onClose: () => void;
}

export const ScoreShareModal: React.FC<ScoreShareModalProps> = ({
  playerName,
  score,
  highScore,
  bestCombo,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);

  // Derive Rank & Percentile
  let rankTitle = 'YENİ BAŞLAYAN';
  let percentile = 'İLK %90';
  let badgeColor = '#94a3b8';

  if (score >= 70) {
    rankTitle = 'REFLEKS TANRISI ⚡👑';
    percentile = 'EN İYİ %0.4 OYUNCU';
    badgeColor = '#facc15';
  } else if (score >= 45) {
    rankTitle = 'YERÇEKİMİ USTASI 🕶️';
    percentile = 'EN İYİ %3 OYUNCU';
    badgeColor = '#c084fc';
  } else if (score >= 25) {
    rankTitle = 'SİBER REFLEKS PRO 🔥';
    percentile = 'EN İYİ %12 OYUNCU';
    badgeColor = '#38bdf8';
  } else if (score >= 12) {
    rankTitle = 'HIZLI KOŞUCU 🏃';
    percentile = 'EN İYİ %45 OYUNCU';
    badgeColor = '#34d399';
  }

  // Generate the viral image on an HTML5 canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 800;

    // 1. Dark futuristic background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 800);
    bgGrad.addColorStop(0, '#070b14');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#05070c');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 600, 800);

    // 2. Cyber grid lines
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 600; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 800);
      ctx.stroke();
    }
    for (let y = 0; y < 800; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(600, y);
      ctx.stroke();
    }

    // 3. Neon border framing
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 6;
    ctx.strokeRect(16, 16, 568, 768);

    // 4. Game Title
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 18;
    ctx.font = "900 36px 'Space Grotesk', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText('ZYPHOR: GRAVITY SHIFT', 300, 82);
    ctx.shadowBlur = 0;

    // Player Name subtitle
    ctx.fillStyle = '#e2e8f0';
    ctx.font = "700 20px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(`OYUNCU: ${playerName.toUpperCase()}`, 300, 118);

    // 5. Percentile Pill
    ctx.fillStyle = 'rgba(234, 179, 8, 0.15)';
    ctx.strokeStyle = badgeColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(120, 140, 360, 44, 22);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = badgeColor;
    ctx.font = "800 18px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(percentile, 300, 168);

    // 6. Score Circle
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 25;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(300, 325, 110, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.font = "900 96px 'Teko', sans-serif";
    ctx.fillText(`${score}`, 300, 350);

    ctx.fillStyle = '#94a3b8';
    ctx.font = "700 18px 'Space Grotesk', sans-serif";
    ctx.fillText('PUAN', 300, 395);

    // 7. Rank Title
    ctx.fillStyle = '#f8fafc';
    ctx.font = "800 28px 'Space Grotesk', sans-serif";
    ctx.fillText(rankTitle, 300, 490);

    // 8. Stats Row
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect(80, 525, 440, 80, 16);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = "600 15px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText('EN YÜKSEK REKOR', 190, 555);
    ctx.fillText('EN İYİ KOMBO', 410, 555);

    ctx.fillStyle = '#facc15';
    ctx.font = "800 24px 'Space Grotesk', sans-serif";
    ctx.fillText(`${highScore}`, 190, 585);
    ctx.fillText(`${bestCombo}x KOMBO`, 410, 585);

    // 9. Provocative Challenge Slogan
    ctx.fillStyle = '#f43f5e';
    ctx.font = "800 20px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText('⚡ OYUNCULARIN %99\'U 30 PUANI GEÇEMİYOR!', 300, 655);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = "600 16px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText('Skorumu geçebilir misin? Hemen ZYPHOR oyna!', 300, 686);

    // 10. Watermark tag
    ctx.fillStyle = '#64748b';
    ctx.font = "700 14px 'Space Grotesk', sans-serif";
    ctx.fillText('ZYPHOR: GRAVITY SHIFT • #ZyphorChallenge', 300, 742);

    try {
      confetti({ particleCount: 35, spread: 70, origin: { y: 0.4 } });
    } catch {
      // safe
    }
  }, [playerName, score, highScore, bestCombo, rankTitle, percentile, badgeColor]);

  const shareText = `🔥 ZYPHOR'da skorum ${score}! (${playerName}) — ${rankTitle} oldum. Beni geçebilir misin? 🎮👇\n${window.location.href}`;

  const handleShare = async () => {
    sound.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ZYPHOR - Gravity Shift Skor Meydan Okuması',
          text: shareText,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopyText();
    }
  };

  const handleCopyText = () => {
    sound.playCoin();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText).catch(() => {});
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadImage = () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      sound.playCash();
      const link = document.createElement('a');
      link.download = `zyphor-skor-${score}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      // Safe fallback
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-zinc-900 border border-zinc-700 shadow-2xl p-5 flex flex-col items-center">
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 mb-2">
          <Flame className="w-4 h-4 fill-amber-400" />
          SKOR MEYDAN OKUMA KARTI
        </div>
        <h3 className="text-lg font-black text-white mb-3 text-center">
          Arkadaşlarına Meydan Oku!
        </h3>

        <div className="w-full rounded-2xl overflow-hidden shadow-xl border border-cyan-500/40 mb-4 bg-zinc-950">
          <canvas ref={canvasRef} className="w-full h-auto block" />
        </div>

        <div className="w-full space-y-2">
          <button
            onClick={handleShare}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 hover:from-cyan-400 hover:to-blue-500 active:scale-95 transition"
          >
            <Share2 className="w-4 h-4" />
            PAYLAŞ / HİKAYEDE YAYINLA
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadImage}
              className="py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Görseli İndir
            </button>

            <button
              onClick={handleCopyText}
              className="py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Kopyalandı!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Mesajı Kopyala
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
