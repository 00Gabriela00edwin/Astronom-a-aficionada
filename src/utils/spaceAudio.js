const CLAVE = "astronomia-audio-silenciado";

let contexto = null;
let maestro = null;
let ruido = null;
let silenciado = leerSilencio();

function leerSilencio() {
  try {
    return localStorage.getItem(CLAVE) === "true";
  } catch {
    return false;
  }
}

// El AudioContext se crea de forma perezosa; solo funciona tras un gesto del usuario.
function obtenerContexto() {
  if (typeof window === "undefined") return null;
  try {
    if (!contexto) {
      const Contexto = window.AudioContext || window.webkitAudioContext;
      if (!Contexto) return null;
      contexto = new Contexto();
      maestro = contexto.createGain();
      maestro.gain.value = silenciado ? 0 : 1;
      maestro.connect(contexto.destination);
    }
    if (contexto.state === "suspended") contexto.resume().catch(() => {});
    return contexto.state === "closed" ? null : contexto;
  } catch {
    return null;
  }
}

function bufferRuido(ctx) {
  if (!ruido) {
    ruido = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const datos = ruido.getChannelData(0);
    for (let i = 0; i < datos.length; i++) datos[i] = Math.random() * 2 - 1;
  }
  return ruido;
}

let activado = false;

if (typeof window !== "undefined") {
  const activar = () => {
    activado = true;
    window.removeEventListener("pointerdown", activar, true);
    window.removeEventListener("keydown", activar, true);
  };
  window.addEventListener("pointerdown", activar, true);
  window.addEventListener("keydown", activar, true);
}

function sonar(fn) {
  if (silenciado || !activado) return;
  try {
    const ctx = obtenerContexto();
    if (ctx) fn(ctx, ctx.currentTime);
  } catch {
    // El navegador puede bloquear el audio: se ignora en silencio.
  }
}

function envolvente(ctx, t, pico, ataque, duracion) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(pico, t + ataque);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
  g.connect(maestro);
  return g;
}

function tono(ctx, t, { tipo = "sine", desde, hasta, pico, ataque = 0.01, duracion }) {
  const osc = ctx.createOscillator();
  osc.type = tipo;
  osc.frequency.setValueAtTime(desde, t);
  if (hasta) osc.frequency.exponentialRampToValueAtTime(hasta, t + duracion);
  osc.connect(envolvente(ctx, t, pico, ataque, duracion));
  osc.start(t);
  osc.stop(t + duracion + 0.05);
}

export function getMuted() {
  return silenciado;
}

export function toggleMute() {
  silenciado = !silenciado;
  try {
    localStorage.setItem(CLAVE, String(silenciado));
  } catch {
    // Almacenamiento no disponible.
  }
  if (maestro && contexto) maestro.gain.setTargetAtTime(silenciado ? 0 : 1, contexto.currentTime, 0.02);
  return silenciado;
}

export function playFocusClick() {
  sonar((ctx, t) => {
    const fuente = ctx.createBufferSource();
    fuente.buffer = bufferRuido(ctx);
    const filtro = ctx.createBiquadFilter();
    filtro.type = "bandpass";
    filtro.frequency.value = 2400;
    filtro.Q.value = 1.2;
    fuente.connect(filtro);
    filtro.connect(envolvente(ctx, t, 0.08, 0.002, 0.04));
    fuente.start(t);
    fuente.stop(t + 0.06);

    tono(ctx, t + 0.05, { desde: 392, hasta: 784, pico: 0.04, ataque: 0.08, duracion: 0.4 });
    tono(ctx, t + 0.05, { desde: 588, hasta: 1176, pico: 0.015, ataque: 0.08, duracion: 0.4 });
  });
}

export function playWarp() {
  sonar((ctx, t) => {
    const filtro = ctx.createBiquadFilter();
    filtro.type = "lowpass";
    filtro.Q.value = 4;
    filtro.frequency.setValueAtTime(120, t);
    filtro.frequency.exponentialRampToValueAtTime(900, t + 0.45);
    filtro.frequency.exponentialRampToValueAtTime(150, t + 0.9);
    filtro.connect(envolvente(ctx, t, 0.09, 0.3, 0.9));

    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(55, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.45);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.9);
    osc.connect(filtro);
    osc.start(t);
    osc.stop(t + 0.95);
  });
}

export function playHoverTick() {
  sonar((ctx, t) => {
    tono(ctx, t, { desde: 880, pico: 0.03, ataque: 0.005, duracion: 0.04 });
  });
}

export function playPulse() {
  sonar((ctx, t) => {
    tono(ctx, t, { desde: 110, hasta: 55, pico: 0.1, ataque: 0.01, duracion: 0.25 });
    tono(ctx, t + 0.09, { desde: 110, hasta: 55, pico: 0.04, ataque: 0.01, duracion: 0.2 });
  });
}
