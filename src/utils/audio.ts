/**
 * Zero-dependency Web Audio API synthesizer for instant retro/arcade sound effects.
 * Works 100% offline with zero latency on Android and modern browsers.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public hapticsEnabled: boolean = true;

  constructor() {
    // Initialized lazily on first user interaction to satisfy browser autoplay policies
  }

  private initCtx() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // Audio context may be restricted in sandbox
    }
  }

  public triggerHaptic(pattern: number | number[] = 15) {
    if (!this.hapticsEnabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors if blocked by iframe or browser
    }
  }

  // Tap / Gravity flip sound
  public playTap() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      this.triggerHaptic(10);

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.05);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.055);
    } catch {
      // Safe fallback
    }
  }

  // Tap / Gravity flip sound
  public playFlip(direction: 'up' | 'down') {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      this.triggerHaptic(12);

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      if (direction === 'up') {
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.08);
      } else {
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(240, now + 0.08);
      }

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Safe fallback
    }
  }

  // Coin collected with dynamic pitch scale for streaks
  public playCoin(streak: number = 0) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      this.triggerHaptic(10);

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pitch slightly rises as player collects more coins in sequence!
      const pitchFactor = Math.min(1.8, 1 + (streak % 8) * 0.08);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77 * pitchFactor, now); // B5
      osc.frequency.setValueAtTime(1318.51 * pitchFactor, now + 0.05); // E6

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.19);
    } catch {
      // Safe fallback
    }
  }

  // Diamond collected
  public playDiamond() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      this.triggerHaptic([10, 30, 15]);

      const now = this.ctx.currentTime;
      [1046.50, 1318.51, 1567.98, 2093.00].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const time = now + idx * 0.035;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.13);
      });
    } catch {
      // Safe fallback
    }
  }

  // Combo milestone
  public playCombo(combo: number) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      this.triggerHaptic(20);

      const now = this.ctx.currentTime;
      const baseFreq = 440;
      const notes = [0, 4, 7, 11, 12, 16]; // Major 7th pentatonic steps
      const step = notes[Math.min(combo, notes.length - 1)];
      const freq = baseFreq * Math.pow(2, step / 12);

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.1);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // Safe fallback
    }
  }

  // Fever mode activated
  public playFever() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      this.triggerHaptic([30, 50, 30, 50, 60]);

      const now = this.ctx.currentTime;
      const chord = [523.25, 659.25, 783.99, 1046.50]; // C Major
      chord.forEach((f) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now);
        osc.frequency.exponentialRampToValueAtTime(f * 1.2, now + 0.3);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.36);
      });
    } catch {
      // Safe fallback
    }
  }

  // Crash / Game Over
  public playCrash() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      this.triggerHaptic([60, 40, 90]);

      const now = this.ctx.currentTime;
      // Sub bass drop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.42);

      // Noise buffer for explosion crunch
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      noise.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(now);
    } catch {
      // Safe fallback
    }
  }

  // Revive sound
  public playRevive() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      this.triggerHaptic([30, 30, 50]);

      const now = this.ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const time = now + idx * 0.05;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.26);
      });
    } catch {
      // Safe fallback
    }
  }

  // Click UI
  public playClick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      this.triggerHaptic(8);

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Safe fallback
    }
  }

  // Spin Wheel Tick
  public playSpinTick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      this.triggerHaptic(6);

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(600, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.025);
    } catch {
      // Safe fallback
    }
  }

  // Cash / Purchase chime
  public playCash() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      this.triggerHaptic([20, 20, 40]);

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(1200, now);
      osc2.frequency.setValueAtTime(1600, now + 0.08);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.29);
      osc2.stop(now + 0.29);
    } catch {
      // Safe fallback
    }
  }

  // Milestone / High score fanfar
  public playMilestone() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      this.triggerHaptic([30, 40, 50, 60]);

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const time = now + idx * 0.06;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.22, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.23);
      });
    } catch {
      // Safe fallback
    }
  }
}

export const sound = new SoundEngine();
