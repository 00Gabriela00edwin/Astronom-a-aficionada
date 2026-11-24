import { calcularFaseLunar } from "./astronomia.js";

const ANCHO = 1080;
const ALTO = 1350;

function aleatorio(semilla) {
  let s = [...String(semilla)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function formatearCoordenadas(latitud, longitud) {
  if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) return "";
  const grados = (valor, positivo, negativo) => `${Math.abs(valor).toFixed(2)}° ${valor >= 0 ? positivo : negativo}`;
  return `${grados(latitud, "N", "S")}  ·  ${grados(longitud, "E", "O")}`;
}

function fechaLarga(observacion) {
  const fecha = new Date(`${observacion.fecha}T12:00:00`);
  if (Number.isNaN(fecha.getTime())) return observacion.fecha;
  return fecha.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" }).toUpperCase();
}

export function faseDeObservacion(observacion) {
  const fecha = new Date(`${observacion.fecha}T${observacion.hora || "22:00"}:00`);
  return calcularFaseLunar(Number.isNaN(fecha.getTime()) ? new Date() : fecha);
}

function dibujarFondo(ctx, paleta, semilla) {
  const fondo = ctx.createLinearGradient(0, 0, 0, ALTO);
  fondo.addColorStop(0, paleta.fondoA);
  fondo.addColorStop(1, paleta.fondoB);
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, ANCHO, ALTO);

  const brillo = ctx.createRadialGradient(ANCHO / 2, 520, 40, ANCHO / 2, 520, 620);
  brillo.addColorStop(0, paleta.halo);
  brillo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = brillo;
  ctx.fillRect(0, 0, ANCHO, ALTO);

  const azar = aleatorio(semilla);
  for (let i = 0; i < 260; i++) {
    const x = azar() * ANCHO;
    const y = azar() * ALTO;
    const radio = azar() < 0.06 ? 1.8 : 0.4 + azar() * 1.0;
    ctx.globalAlpha = 0.25 + azar() * 0.7;
    ctx.fillStyle = paleta.estrellas[Math.floor(azar() * paleta.estrellas.length)];
    ctx.beginPath();
    ctx.arc(x, y, radio, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function dibujarLuna(ctx, cx, cy, R, fase, volteo, paleta, semilla) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();

  const base = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
  base.addColorStop(0, paleta.lunaClara);
  base.addColorStop(1, paleta.lunaOscura);
  ctx.fillStyle = base;
  ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

  const azar = aleatorio(`luna-${semilla}`);
  for (let i = 0; i < 7; i++) {
    const a = azar() * Math.PI * 2;
    const d = Math.sqrt(azar()) * R * 0.7;
    const radio = R * (0.14 + azar() * 0.2);
    const mar = ctx.createRadialGradient(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 0, cx + Math.cos(a) * d, cy + Math.sin(a) * d, radio);
    mar.addColorStop(0, paleta.mar);
    mar.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = mar;
    ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
  }
  for (let i = 0; i < 40; i++) {
    const a = azar() * Math.PI * 2;
    const d = Math.sqrt(azar()) * R * 0.92;
    const radio = R * (0.012 + azar() * 0.035);
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, radio, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fill();
  }

  // Sombra: se pinta todo el disco menos la zona iluminada (limbo + terminador elíptico).
  ctx.beginPath();
  ctx.rect(cx - R - 2, cy - R - 2, R * 2 + 4, R * 2 + 4);
  const pasos = 60;
  for (let i = 0; i <= pasos; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / pasos;
    const x = cx + volteo * R * Math.cos(a);
    const y = cy + R * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  for (let i = 0; i <= pasos; i++) {
    const a = Math.PI / 2 - (Math.PI * i) / pasos;
    ctx.lineTo(cx + volteo * R * fase.coseno * Math.cos(a), cy + R * Math.sin(a));
  }
  ctx.closePath();
  ctx.fillStyle = paleta.sombra;
  ctx.fill("evenodd");
  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.strokeStyle = paleta.linea;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function texto(ctx, contenido, x, y, { tamano, peso = 400, color, espaciado = 0, alinear = "left", familia = "'DM Sans', system-ui, sans-serif" }) {
  ctx.font = `${peso} ${tamano}px ${familia}`;
  ctx.fillStyle = color;
  ctx.textAlign = alinear;
  ctx.letterSpacing = `${espaciado}px`;
  ctx.fillText(contenido, x, y);
}

function ajustarTexto(ctx, contenido, maxAncho) {
  if (ctx.measureText(contenido).width <= maxAncho) return contenido;
  let corto = contenido;
  while (corto.length > 1 && ctx.measureText(`${corto}…`).width > maxAncho) corto = corto.slice(0, -1);
  return `${corto}…`;
}

export async function generarPostal(observacion, { nocturno = false, latitud = -34 } = {}) {
  if (document.fonts?.load) {
    await Promise.allSettled([document.fonts.load("400 24px 'DM Sans'"), document.fonts.load("700 24px 'DM Sans'")]);
  }
  const canvas = document.createElement("canvas");
  canvas.width = ANCHO;
  canvas.height = ALTO;
  const ctx = canvas.getContext("2d");

  const paleta = nocturno
    ? { fondoA: "#0a0204", fondoB: "#1a0507", halo: "rgba(255,42,42,0.16)", estrellas: ["#ff5a4a", "#ff2a2a", "#d41f1f"],
        lunaClara: "#c46a62", lunaOscura: "#6f2a27", mar: "rgba(60,10,10,0.55)", sombra: "rgba(10,2,3,0.94)",
        linea: "rgba(255,90,74,0.45)", acento: "#ff5a4a", texto: "#ffd5d0", suave: "rgba(255,170,160,0.7)" }
    : { fondoA: "#02040a", fondoB: "#0a1226", halo: "rgba(120,170,255,0.16)", estrellas: ["#ffffff", "#a9c8ff", "#ffd27a"],
        lunaClara: "#e9e6dc", lunaOscura: "#8d8a84", mar: "rgba(70,72,80,0.55)", sombra: "rgba(2,4,10,0.93)",
        linea: "rgba(255,255,255,0.35)", acento: "#ffc400", texto: "#f1f3fa", suave: "rgba(200,210,235,0.7)" };

  const fase = faseDeObservacion(observacion);
  const creciente = fase.progreso < 0.5;
  const volteo = (creciente ? 1 : -1) * (latitud < 0 ? -1 : 1);
  const semilla = observacion.id || observacion.fecha;

  dibujarFondo(ctx, paleta, semilla);

  ctx.strokeStyle = paleta.linea;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1;
  ctx.strokeRect(48, 48, ANCHO - 96, ALTO - 96);
  ctx.globalAlpha = 1;

  texto(ctx, "POSTAL CÓSMICA", ANCHO / 2, 120, { tamano: 26, peso: 700, color: paleta.acento, espaciado: 10, alinear: "center" });
  texto(ctx, fechaLarga(observacion), ANCHO / 2, 164, { tamano: 22, color: paleta.suave, espaciado: 5, alinear: "center" });

  dibujarLuna(ctx, ANCHO / 2, 540, 250, fase, volteo, paleta, semilla);

  texto(ctx, fase.nombre.toUpperCase(), ANCHO / 2, 880, { tamano: 44, peso: 700, color: paleta.texto, espaciado: 8, alinear: "center" });
  texto(ctx, `ILUMINACIÓN ${fase.iluminacion} %`, ANCHO / 2, 926, { tamano: 22, color: paleta.acento, espaciado: 6, alinear: "center" });

  ctx.fillStyle = paleta.linea;
  ctx.fillRect(140, 972, ANCHO - 280, 1);

  const filas = [
    ["LUGAR", observacion.lugar || ""],
    ["COORDENADAS", formatearCoordenadas(observacion.latitud, observacion.longitud)],
    ["HORA", observacion.hora],
    ["CLIMA", observacion.clima],
    ["TELESCOPIO", [observacion.telescopio, observacion.ocular && `ocular ${observacion.ocular}`].filter(Boolean).join(" · ")],
  ].filter(([, valor]) => valor);

  filas.forEach(([etiqueta, valor], i) => {
    const y = 1030 + i * 50;
    texto(ctx, etiqueta, 140, y, { tamano: 17, peso: 700, color: paleta.acento, espaciado: 4 });
    ctx.font = "400 25px 'DM Sans', system-ui, sans-serif";
    ctx.letterSpacing = "0px";
    texto(ctx, ajustarTexto(ctx, valor, ANCHO - 280 - 220), 360, y, { tamano: 25, color: paleta.texto });
  });

  texto(ctx, "ASTRONOMÍA AFICIONADA", ANCHO / 2, ALTO - 84, { tamano: 16, peso: 700, color: paleta.suave, espaciado: 6, alinear: "center" });

  return new Promise((resolver, rechazar) => {
    canvas.toBlob((blob) => (blob ? resolver(blob) : rechazar(new Error("No se pudo generar la imagen."))), "image/png");
  });
}
