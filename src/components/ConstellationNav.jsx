import React, { useEffect, useState } from "react";
import { playHoverTick } from "../utils/spaceAudio.js";

const SECCIONES = [
  { id: "ubicacion", nombre: "Ubicación", x: 20, y: 24 },
  { id: "clima", nombre: "Atmósfera", x: 38, y: 84 },
  { id: "bitacora", nombre: "Bitácora", x: 16, y: 146 },
  { id: "planificador", nombre: "Planificador", x: 40, y: 208 },
  { id: "equipos", nombre: "Óptica y equipos", x: 18, y: 268 },
];

export default function ConstellationNav() {
  const [activa, setActiva] = useState(SECCIONES[0].id);

  useEffect(() => {
    const visibles = new Map();
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => visibles.set(entrada.target.id, entrada.isIntersecting));
        const actual = SECCIONES.find((seccion) => visibles.get(seccion.id));
        if (actual) setActiva(actual.id);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    SECCIONES.forEach(({ id }) => {
      const elemento = document.getElementById(id);
      if (elemento) observador.observe(elemento);
    });
    return () => observador.disconnect();
  }, []);

  function ir(event, id) {
    event.preventDefault();
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reducido ? "auto" : "smooth", block: "start" });
  }

  const lineas = SECCIONES.slice(1).map((seccion, i) => [SECCIONES[i], seccion]);

  return (
    <nav className="constellation-nav" aria-label="Secciones de la página">
      <svg viewBox="0 0 170 292" role="presentation">
        {lineas.map(([a, b]) => (
          <line
            key={b.id}
            className={`cn-line${activa === a.id || activa === b.id ? " is-active" : ""}`}
            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
          />
        ))}
        {SECCIONES.map((seccion) => (
          <a
            key={seccion.id}
            href={`#${seccion.id}`}
            className={`cn-star${activa === seccion.id ? " is-active" : ""}`}
            aria-label={seccion.nombre}
            aria-current={activa === seccion.id ? "location" : undefined}
            onMouseEnter={playHoverTick}
            onClick={(event) => ir(event, seccion.id)}
          >
            <circle className="cn-hit" cx={seccion.x} cy={seccion.y} r="16" />
            <circle className="cn-glow" cx={seccion.x} cy={seccion.y} r="11" />
            <circle className="cn-core" cx={seccion.x} cy={seccion.y} r="3.2" />
            <text className="cn-label" x={seccion.x + 18} y={seccion.y + 4} textAnchor="start">{seccion.nombre}</text>
          </a>
        ))}
      </svg>
    </nav>
  );
}
