import React, { useEffect, useMemo, useRef } from "react";
import { useModoNocturno } from "../ModoNocturno.jsx";

function crearParticulas(movil) {
  const estrellas = Array.from({ length: movil ? 65 : 150 }, () => ({
    x: (Math.random() - 0.5) * 3.2,
    y: (Math.random() - 0.5) * 2.2,
    z: 0.8 + Math.random() * 1.8,
    radio: 0.5 + Math.random() * 1.15,
    brillo: 0.3 + Math.random() * 0.55,
  }));
  const nebulosa = Array.from({ length: movil ? 12 : 36 }, () => ({
    x: 0.45 + (Math.random() - 0.5) * 1.5,
    y: (Math.random() - 0.5) * 1.3,
    z: 1.2 + Math.random() * 1.2,
    radio: 30 + Math.random() * 70,
    color: Math.floor(Math.random() * 3),
    fase: Math.random() * Math.PI * 2,
  }));
  return { estrellas, nebulosa };
}

export default function StarfieldBackground({ puntero, movimientoReducido }) {
  const canvasRef = useRef(null);
  const movil = useMemo(() => window.matchMedia("(max-width: 720px)").matches, []);
  const particulas = useMemo(() => crearParticulas(movil), [movil]);
  const { modoNocturno } = useModoNocturno();

  useEffect(() => {
    const canvas = canvasRef.current;
    const contexto = canvas.getContext("2d");
    if (!contexto) {
      console.error("No se pudo iniciar el fondo de estrellas en Canvas.");
      return;
    }

    let ancho = 0;
    let alto = 0;
    let escala = 1;
    let fotograma = null;
    let tiempo = 0;
    let anterior = null;
    let visible = false;
    let desplazamiento = { x: 0, y: 0 };

    function dibujar() {
      contexto.clearRect(0, 0, ancho, alto);
      const proyectar = (particula) => ({
        x: ancho / 2 + (particula.x + desplazamiento.x / particula.z) * ancho / (2 * particula.z),
        y: alto / 2 + (particula.y + desplazamiento.y / particula.z) * alto / (2 * particula.z),
      });

      const colores = modoNocturno
        ? ["255, 42, 42", "180, 20, 20", "110, 0, 0"]
        : ["105, 117, 200", "69, 132, 177", "212, 150, 98"];

      particulas.nebulosa.forEach((particula) => {
        const fase = tiempo * 0.00012 + particula.fase;
        const posicion = {
          x: particula.x + Math.sin(fase) * 0.03,
          y: particula.y + Math.cos(fase) * 0.03,
          z: particula.z + Math.sin(fase * 0.7) * 0.04,
        };
        const { x, y } = proyectar(posicion);
        const radio = particula.radio / posicion.z;
        const gradiente = contexto.createRadialGradient(x, y, 0, x, y, radio);
        gradiente.addColorStop(0, `rgba(${colores[particula.color]}, ${modoNocturno ? 0.045 : 0.1})`);
        gradiente.addColorStop(1, `rgba(${colores[particula.color]}, 0)`);
        contexto.fillStyle = gradiente;
        contexto.fillRect(x - radio, y - radio, radio * 2, radio * 2);
      });

      particulas.estrellas.forEach((estrella) => {
        const z = 0.8 + ((estrella.z - 0.8 + tiempo * 0.000012) % 1.8);
        const { x, y } = proyectar({ ...estrella, z });
        const brillo = estrella.brillo * (modoNocturno ? 0.42 : 1);
        contexto.fillStyle = modoNocturno
          ? `rgba(255, 42, 42, ${brillo})`
          : `rgba(255, 247, 220, ${brillo})`;
        contexto.beginPath();
        contexto.arc(x, y, estrella.radio / z, 0, Math.PI * 2);
        contexto.fill();
      });
    }

    function animar(ahora) {
      if (anterior !== null && ahora - anterior < 1000 / 30) {
        fotograma = requestAnimationFrame(animar);
        return;
      }
      const delta = anterior === null ? 0 : Math.min(ahora - anterior, 50);
      anterior = ahora;
      tiempo += delta;
      const suavizado = 1 - Math.pow(0.94, delta / 16.67);
      desplazamiento.x += (puntero.current.x * 0.16 - desplazamiento.x) * suavizado;
      desplazamiento.y += (puntero.current.y * 0.16 - desplazamiento.y) * suavizado;
      dibujar();
      fotograma = requestAnimationFrame(animar);
    }

    function actualizarTamano() {
      const rect = canvas.getBoundingClientRect();
      ancho = rect.width;
      alto = rect.height;
      escala = Math.min(window.devicePixelRatio || 1, movil ? 1 : 2);
      canvas.width = Math.round(ancho * escala);
      canvas.height = Math.round(alto * escala);
      contexto.setTransform(escala, 0, 0, escala, 0, 0);
      dibujar();
    }

    const resizeObserver = new ResizeObserver(actualizarTamano);
    resizeObserver.observe(canvas);
    actualizarTamano();

    function actualizarAnimacion() {
      if (visible && !document.hidden && !movimientoReducido && fotograma === null) {
        anterior = null;
        fotograma = requestAnimationFrame(animar);
      } else if ((!visible || document.hidden) && fotograma !== null) {
        cancelAnimationFrame(fotograma);
        fotograma = null;
      }
    }

    const intersectionObserver = new IntersectionObserver(([entrada]) => {
      visible = entrada.isIntersecting;
      actualizarAnimacion();
    });
    intersectionObserver.observe(canvas);
    document.addEventListener("visibilitychange", actualizarAnimacion);

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", actualizarAnimacion);
      if (fotograma !== null) cancelAnimationFrame(fotograma);
    };
  }, [modoNocturno, movimientoReducido, movil, particulas, puntero]);

  return <canvas ref={canvasRef} className="starfield" aria-hidden="true" />;
}
