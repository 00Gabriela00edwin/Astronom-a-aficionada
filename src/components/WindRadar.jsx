import React, { useEffect, useRef } from "react";

const PARTICULAS = 40;
const PUNTOS = [["N", 0], ["E", 90], ["S", 180], ["O", 270]];

function colorPorViento(velocidad, nocturno) {
  if (nocturno) return "255, 42, 42";
  if (velocidad < 15) return "140, 205, 255";
  if (velocidad <= 28) return "255, 184, 64";
  return "255, 112, 92";
}

function vectorFlujo(direccion) {
  // La dirección meteorológica indica de dónde sopla; el flujo va hacia el lado opuesto.
  const rad = ((direccion + 180) * Math.PI) / 180;
  return { x: Math.sin(rad), y: -Math.cos(rad) };
}

function nuevaParticula(flujo, inicial) {
  if (inicial) {
    const radio = Math.sqrt(Math.random());
    const angulo = Math.random() * Math.PI * 2;
    return { x: Math.cos(angulo) * radio, y: Math.sin(angulo) * radio, vida: Math.random() };
  }
  const t = Math.random() * 2 - 1;
  const eje = Math.sqrt(1 - t * t);
  return { x: -flujo.x * eje - flujo.y * t, y: -flujo.y * eje + flujo.x * t, vida: 0 };
}

export default function WindRadar({ speed = 0, direction = 0, isNightVision = false }) {
  const canvasRef = useRef(null);
  const redibujar = useRef(null);
  const velocidad = Number.isFinite(speed) ? Math.max(speed, 0) : 0;
  const rumbo = Number.isFinite(direction) ? direction : 0;
  const props = useRef({ speed: velocidad, direction: rumbo, isNightVision });
  props.current = { speed: velocidad, direction: rumbo, isNightVision };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("No se pudo iniciar el radar de viento en Canvas.");
      return;
    }

    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const particulas = Array.from({ length: PARTICULAS }, () => nuevaParticula(vectorFlujo(props.current.direction), true));
    let lado = 0;
    let frame = null;
    let anterior = null;
    let visible = false;

    function dibujar(dt) {
      if (!lado) return;
      const { speed: viento, direction: direccion, isNightVision: nocturno } = props.current;
      const color = colorPorViento(viento, nocturno);
      const flujo = vectorFlujo(direccion);
      const centro = lado / 2;
      const radio = centro - 14;

      ctx.clearRect(0, 0, lado, lado);
      ctx.save();
      ctx.translate(centro, centro);

      ctx.strokeStyle = `rgba(${color}, 0.16)`;
      ctx.lineWidth = 1;
      [0.66, 0.33].forEach((escala) => {
        ctx.beginPath();
        ctx.arc(0, 0, radio * escala, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.strokeStyle = `rgba(${color}, 0.5)`;
      ctx.beginPath();
      ctx.arc(0, 0, radio, 0, Math.PI * 2);
      ctx.stroke();

      for (let grados = 0; grados < 360; grados += 30) {
        const rad = (grados * Math.PI) / 180;
        const mayor = grados % 90 === 0;
        const interior = radio - (mayor ? 9 : 5);
        ctx.strokeStyle = `rgba(${color}, ${mayor ? 0.55 : 0.3})`;
        ctx.beginPath();
        ctx.moveTo(Math.sin(rad) * interior, -Math.cos(rad) * interior);
        ctx.lineTo(Math.sin(rad) * radio, -Math.cos(rad) * radio);
        ctx.stroke();
      }

      ctx.fillStyle = `rgba(${color}, 0.85)`;
      ctx.font = `600 ${Math.max(9, lado * 0.07)}px Orbitron, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      PUNTOS.forEach(([texto, grados]) => {
        const rad = (grados * Math.PI) / 180;
        ctx.fillText(texto, Math.sin(rad) * (radio + 8), -Math.cos(rad) * (radio + 8));
      });

      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, radio - 1, 0, Math.PI * 2);
      ctx.clip();

      const proporcion = Math.min(viento, 60) / 60;
      const avance = Math.max(0.06, proporcion) * 0.9 * dt;
      const estela = 0.12 + proporcion * 0.5;
      ctx.lineCap = "round";
      ctx.lineWidth = 1.2;
      particulas.forEach((particula, i) => {
        particula.x += flujo.x * avance;
        particula.y += flujo.y * avance;
        particula.vida += dt * 0.5;
        if (particula.x * particula.x + particula.y * particula.y > 1) {
          particulas[i] = nuevaParticula(flujo, false);
          return;
        }
        const alfa = Math.min(1, particula.vida * 2) * 0.9;
        const x = particula.x * radio;
        const y = particula.y * radio;
        const cx = (particula.x - flujo.x * estela) * radio;
        const cy = (particula.y - flujo.y * estela) * radio;
        const gradiente = ctx.createLinearGradient(cx, cy, x, y);
        gradiente.addColorStop(0, `rgba(${color}, 0)`);
        gradiente.addColorStop(1, `rgba(${color}, ${alfa})`);
        ctx.strokeStyle = gradiente;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();
      });
      ctx.restore();

      const largo = radio * 0.62;
      const punta = { x: flujo.x * largo, y: flujo.y * largo };
      const perpendicular = { x: -flujo.y, y: flujo.x };
      ctx.strokeStyle = `rgba(${color}, 0.75)`;
      ctx.fillStyle = `rgba(${color}, 0.75)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(punta.x, punta.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(punta.x, punta.y);
      ctx.lineTo(punta.x - flujo.x * 9 + perpendicular.x * 4.5, punta.y - flujo.y * 9 + perpendicular.y * 4.5);
      ctx.lineTo(punta.x - flujo.x * 9 - perpendicular.x * 4.5, punta.y - flujo.y * 9 - perpendicular.y * 4.5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function animar(ahora) {
      const dt = anterior === null ? 0 : Math.min((ahora - anterior) / 1000, 0.05);
      anterior = ahora;
      dibujar(dt);
      frame = requestAnimationFrame(animar);
    }

    function actualizar() {
      if (!reducido && visible && !document.hidden) {
        if (frame === null) {
          anterior = null;
          frame = requestAnimationFrame(animar);
        }
      } else if (frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
    }

    function ajustarTamano() {
      const rect = canvas.getBoundingClientRect();
      lado = rect.width;
      const escala = window.devicePixelRatio || 1;
      canvas.width = Math.round(lado * escala);
      canvas.height = Math.round(lado * escala);
      ctx.setTransform(escala, 0, 0, escala, 0, 0);
      dibujar(0);
    }

    redibujar.current = () => dibujar(0);
    const resizeObserver = new ResizeObserver(ajustarTamano);
    resizeObserver.observe(canvas);
    const intersectionObserver = new IntersectionObserver(([entrada]) => {
      visible = entrada.isIntersecting;
      actualizar();
    });
    intersectionObserver.observe(canvas);
    document.addEventListener("visibilitychange", actualizar);

    return () => {
      redibujar.current = null;
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", actualizar);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  // Con animación pausada (movimiento reducido) hay que redibujar al cambiar los datos.
  useEffect(() => {
    redibujar.current?.();
  }, [velocidad, rumbo, isNightVision]);

  return (
    <div className="wind-radar">
      <canvas ref={canvasRef} role="img" aria-label={`Radar de viento: ${Math.round(velocidad)} km/h desde ${Math.round(rumbo)}°`} />
    </div>
  );
}
