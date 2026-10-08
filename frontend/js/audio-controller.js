/**
 * TITULO E-Commerce - Controlador de Audio Ambiental & Efectos de Interfaz
 * Utiliza Web Audio API para generar un paisaje sonoro atmosférico y sutiles efectos de clic.
 */

const AudioController = {
  isPlaying: false,
  audioCtx: null,
  gainNode: null,
  oscillators: [],

  init() {
    this.bindEvents();
    const saved = localStorage.getItem("titulo_audio_enabled");
    if (saved === "true") {
      // Esperar primera interacción del usuario para cumplir con políticas de autoplay del navegador
      const onFirstClick = () => {
        if (!this.isPlaying) this.toggle(true);
        window.removeEventListener("click", onFirstClick);
      };
      window.addEventListener("click", onFirstClick, { once: true });
    }
  },

  createAmbientSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(0.05, this.audioCtx.currentTime);

      // Filtro pasa-bajos cálido
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(420, this.audioCtx.currentTime);

      this.gainNode.connect(filter);
      filter.connect(this.audioCtx.destination);

      // Dos osciladores sutiles desfasados para generar una atmósfera minimalista y profunda
      const freqs = [110, 164.81]; // A2 y E3
      freqs.forEach(freq => {
        const osc = this.audioCtx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        osc.connect(this.gainNode);
        osc.start();
        this.oscillators.push(osc);
      });
    } catch (e) {
      console.warn("Web Audio API no soportado o bloqueado", e);
    }
  },

  playClick() {
    if (!this.isPlaying || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const clickGain = this.audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, this.audioCtx.currentTime + 0.04);

      clickGain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
      clickGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);

      osc.connect(clickGain);
      clickGain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {}
  },

  toggle(forceState) {
    this.isPlaying = forceState !== undefined ? forceState : !this.isPlaying;

    if (this.isPlaying) {
      if (!this.audioCtx) {
        this.createAmbientSound();
      } else if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
      if (this.gainNode) {
        this.gainNode.gain.setTargetAtTime(0.05, this.audioCtx.currentTime, 0.5);
      }
    } else {
      if (this.gainNode && this.audioCtx) {
        this.gainNode.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.3);
      }
    }

    localStorage.setItem("titulo_audio_enabled", String(this.isPlaying));
    this.updateUI();
  },

  updateUI() {
    const onLabel = document.querySelector(".sound-state-on");
    const offLabel = document.querySelector(".sound-state-off");
    const button = document.getElementById("headerMusicButton");

    if (button) button.classList.toggle("is-active", this.isPlaying);
    if (onLabel) onLabel.style.display = this.isPlaying ? "inline" : "none";
    if (offLabel) offLabel.style.display = this.isPlaying ? "none" : "inline";
  },

  bindEvents() {
    const button = document.getElementById("headerMusicButton");
    if (button) {
      button.addEventListener("click", () => this.toggle());
    }

    // Efecto de sonido sutil al hacer clic en botones de compra si el sonido está encendido
    document.addEventListener("click", (e) => {
      if (e.target.closest("button") || e.target.closest(".apparel-card")) {
        this.playClick();
      }
    });
  }
};

window.AudioController = AudioController;
