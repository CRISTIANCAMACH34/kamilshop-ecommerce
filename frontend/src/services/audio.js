/**
 * TITULO - Síntesis de Sonido Ambiental & Efectos de Clic
 */
class SoundEngine {
  constructor() {
    this.isPlaying = false;
    this.audioCtx = null;
    this.gainNode = null;
    this.oscillators = [];
  }

  init() {
    const saved = localStorage.getItem('titulo_audio_react');
    if (saved === 'true') {
      const onFirstInteract = () => {
        if (!this.isPlaying) this.toggle(true);
        window.removeEventListener('click', onFirstInteract);
      };
      window.addEventListener('click', onFirstInteract, { once: true });
    }
  }

  createSynth() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(0.04, this.audioCtx.currentTime);

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, this.audioCtx.currentTime);

      this.gainNode.connect(filter);
      filter.connect(this.audioCtx.destination);

      [110, 164.81].forEach(f => {
        const osc = this.audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, this.audioCtx.currentTime);
        osc.connect(this.gainNode);
        osc.start();
        this.oscillators.push(osc);
      });
    } catch (e) {}
  }

  playClick() {
    if (!this.isPlaying || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const clickGain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, this.audioCtx.currentTime + 0.04);

      clickGain.gain.setValueAtTime(0.03, this.audioCtx.currentTime);
      clickGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);

      osc.connect(clickGain);
      clickGain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {}
  }

  toggle(forceState) {
    this.isPlaying = forceState !== undefined ? forceState : !this.isPlaying;
    if (this.isPlaying) {
      if (!this.audioCtx) {
        this.createSynth();
      } else if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      if (this.gainNode) {
        this.gainNode.gain.setTargetAtTime(0.04, this.audioCtx.currentTime, 0.5);
      }
    } else {
      if (this.gainNode && this.audioCtx) {
        this.gainNode.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.3);
      }
    }
    localStorage.setItem('titulo_audio_react', String(this.isPlaying));
    return this.isPlaying;
  }
}

export const soundEngine = new SoundEngine();
