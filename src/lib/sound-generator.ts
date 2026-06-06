"use client";

// Web Audio API Procedural Sound Generator for GDR Master Room
// Generates high-quality, zero-latency RPG UI sound effects directly via browser oscillators.

let audioCtx: AudioContext | null = null;
let uiSoundsEnabled = true;

// Initialize state from localStorage if available
if (typeof window !== "undefined") {
  const saved = localStorage.getItem("gdr_ui_sounds_enabled");
  if (saved !== null) {
    uiSoundsEnabled = saved === "true";
  }
}

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isUiSoundsEnabled(): boolean {
  return uiSoundsEnabled;
}

export function toggleUiSounds(enabled: boolean): void {
  uiSoundsEnabled = enabled;
  if (typeof window !== "undefined") {
    localStorage.setItem("gdr_ui_sounds_enabled", enabled ? "true" : "false");
  }
}

// Sound 1: Click (Interazione pulsante - Tono pietra/legno morbido)
export function playUiClick() {
  if (!uiSoundsEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Connettiamo un oscillatore principale e uno di risonanza profonda
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(300, now);

    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);

    // Rumore percussivo ad alta frequenza per simulare l'impatto fisico
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = "sine";
    clickOsc.frequency.setValueAtTime(1200, now);
    clickOsc.frequency.exponentialRampToValueAtTime(600, now + 0.015);
    clickGain.gain.setValueAtTime(0.05, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.02);
  } catch (error) {
    console.warn("Failed to play UI click sound:", error);
  }
}

// Sound 2: Hover (Passaggio del mouse - Sottile fruscio o click delicato)
export function playUiHover() {
  if (!uiSoundsEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.linearRampToValueAtTime(320, now + 0.04);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(600, now);
    filter.Q.setValueAtTime(1.0, now);

    gainNode.gain.setValueAtTime(0.03, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch (error) {
    // Silently catch audio block exceptions
  }
}

// Sound 3: Dice Rolling (Sequenza di piccoli colpi fisici)
export function playUiDiceRoll() {
  if (!uiSoundsEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Generiamo 4 piccoli impatti ravvicinati ad intervalli casuali
    const delays = [0.0, 0.08, 0.15, 0.22, 0.32];
    delays.forEach((delay, idx) => {
      const hitTime = now + delay;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Pitch leggermente casuale per simulare la rotazione reale del dado
      const pitch = 220 + Math.random() * 180;
      osc.type = "triangle";
      osc.frequency.setValueAtTime(pitch, hitTime);
      osc.frequency.exponentialRampToValueAtTime(60, hitTime + 0.06);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(400, hitTime);

      // L'ultimo impatto è leggermente più rumoroso
      const volume = idx === delays.length - 1 ? 0.18 : 0.12;
      gainNode.gain.setValueAtTime(volume, hitTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.06);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(hitTime);
      osc.stop(hitTime + 0.07);
    });
  } catch (error) {
    console.warn("Failed to play dice roll sound:", error);
  }
}

// Sound 4: Whisper (Sussurro / Messaggio Segreto - Flusso magico)
export function playUiWhisper() {
  if (!uiSoundsEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(150, now);
    osc1.frequency.linearRampToValueAtTime(650, now + 0.65);

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(155, now);
    osc2.frequency.linearRampToValueAtTime(640, now + 0.65);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.linearRampToValueAtTime(1200, now + 0.65);
    filter.Q.setValueAtTime(1.5, now);

    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.12, now + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.7);
    osc2.stop(now + 0.7);
  } catch (error) {
    console.warn("Failed to play whisper sound:", error);
  }
}

// Sound 5: Successo Critico (Chime / Arpeggio magico solenne)
export function playUiCriticalSuccess() {
  if (!uiSoundsEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Arpeggio di 4 note in scala maggiore (C4, E4, G4, C5)
    const notes = [261.63, 329.63, 392.0, 523.25];
    const delays = [0.0, 0.08, 0.16, 0.24];

    delays.forEach((delay, idx) => {
      const noteTime = now + delay;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.setValueAtTime(notes[idx], noteTime);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2000, noteTime);

      gainNode.gain.setValueAtTime(0.08, noteTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.6);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.65);
    });

    // Risonanza solenne a bassa frequenza (gong)
    const gong = ctx.createOscillator();
    const gongGain = ctx.createGain();
    gong.type = "triangle";
    gong.frequency.setValueAtTime(130.81, now); // C3
    gongGain.gain.setValueAtTime(0.15, now);
    gongGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    gong.connect(gongGain);
    gongGain.connect(ctx.destination);
    gong.start(now);
    gong.stop(now + 1.25);
  } catch (error) {
    console.warn("Failed to play critical success sound:", error);
  }
}

// Sound 6: Fallimento Critico (Ominoso calo di pitch cupo)
export function playUiCriticalFailure() {
  if (!uiSoundsEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const oscLow = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(50, now + 0.9);

    oscLow.type = "sine";
    oscLow.frequency.setValueAtTime(90, now);
    oscLow.frequency.linearRampToValueAtTime(30, now + 0.9);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(250, now);
    filter.frequency.linearRampToValueAtTime(80, now + 0.9);

    gainNode.gain.setValueAtTime(0.18, now);
    gainNode.gain.linearRampToValueAtTime(0.1, now + 0.3);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

    osc.connect(filter);
    oscLow.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    oscLow.start(now);
    osc.stop(now + 1.0);
    oscLow.stop(now + 1.0);
  } catch (error) {
    console.warn("Failed to play critical failure sound:", error);
  }
}

// Sound 7: Modal Open (Swell d'ingresso olografico o magico)
export function playUiModalOpen() {
  if (!uiSoundsEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.22);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1000, now);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  } catch (error) {
    // Blocked or not supported
  }
}

// Sound 8: Modal Close (Fading rapido)
export function playUiModalClose() {
  if (!uiSoundsEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.15);

    gainNode.gain.setValueAtTime(0.06, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  } catch (error) {
    // Blocked
  }
}

// Sound 9: Damage (Impatto cupo e battito cardiaco per feedback perdita HP)
export function playUiDamage() {
  if (!uiSoundsEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Impatto sordo e cupo (frequenze molto basse)
    const impactOsc = ctx.createOscillator();
    const impactGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    impactOsc.type = "sine";
    impactOsc.frequency.setValueAtTime(90, now);
    impactOsc.frequency.exponentialRampToValueAtTime(30, now + 0.3);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(120, now);

    impactGain.gain.setValueAtTime(0.35, now);
    impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    impactOsc.connect(filter);
    filter.connect(impactGain);
    impactGain.connect(ctx.destination);

    impactOsc.start(now);
    impactOsc.stop(now + 0.35);

    // Doppio battito cardiaco accelerato (0.05s e 0.25s)
    const beats = [0.05, 0.25];
    beats.forEach((delay) => {
      const beatTime = now + delay;
      const beatOsc = ctx.createOscillator();
      const beatGain = ctx.createGain();
      const beatFilter = ctx.createBiquadFilter();

      beatOsc.type = "triangle";
      beatOsc.frequency.setValueAtTime(55, beatTime);
      beatOsc.frequency.exponentialRampToValueAtTime(25, beatTime + 0.15);

      beatFilter.type = "lowpass";
      beatFilter.frequency.setValueAtTime(80, beatTime);

      beatGain.gain.setValueAtTime(0.3, beatTime);
      beatGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.15);

      beatOsc.connect(beatFilter);
      beatFilter.connect(beatGain);
      beatGain.connect(ctx.destination);

      beatOsc.start(beatTime);
      beatOsc.stop(beatTime + 0.18);
    });
  } catch (error) {
    console.warn("Failed to play damage sound:", error);
  }
}

