import React, { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { playFocusClick } from "../utils/spaceAudio.js";

const RADIO_VENTANA = 120; // unidades del viewBox (-200..200)
const MARCAS_ANILLO = Array.from({ length: 72 }, (_, i) => i * 5);
const MARCAS_FINAS = Array.from({ length: 24 }, (_, i) => i * 15);

export default function TelescopeIntro({ onComplete }) {
  const raiz = useRef(null);
  const hud = useRef(null);
  const anillo1 = useRef(null);
  const anillo2 = useRef(null);
  const destello = useRef(null);
  const bloqueado = useRef(false);
  const lineaTiempo = useRef(null);
  const reducido = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  useEffect(() => {
    const el = raiz.current;
    const lado = () => Math.min(window.innerWidth, window.innerHeight);
    const radioBase = () => Math.min(120, lado() * 0.3);
    const estado = { x: 0, y: 0, r: radioBase(), blur: 4, escala: 1, hud: 1, rot1: 0, rot2: 0, destello: 0, giro: 0 };
    let tamano = radioBase();

    // Un único ticker aplica el estado de GSAP a variables CSS y transforms (sin re-render de React).
    const dibujar = () => {
      if (!hud.current || !anillo1.current || !anillo2.current || !destello.current) return;
      el.style.setProperty("--cx", `calc(50% + ${estado.x}px)`);
      el.style.setProperty("--cy", `calc(50% + ${estado.y}px)`);
      el.style.setProperty("--r", `${estado.r}px`);
      el.style.setProperty("--blur", `${estado.blur}px`);
      hud.current.style.cssText = `width:${(tamano / RADIO_VENTANA) * 400}px;height:${(tamano / RADIO_VENTANA) * 400}px;opacity:${estado.hud};transform:translate(-50%,-50%) translate(${estado.x}px,${estado.y}px) scale(${estado.escala})`;
      anillo1.current.setAttribute("transform", `rotate(${estado.rot1})`);
      anillo2.current.setAttribute("transform", `rotate(${estado.rot2})`);
      destello.current.setAttribute("transform", `rotate(${estado.giro})`);
      destello.current.style.opacity = estado.destello;
    };
    gsap.ticker.add(dibujar);
    dibujar();

    const mover = reducido ? null : {
      x: gsap.quickTo(estado, "x", { duration: 0.7, ease: "power3.out" }),
      y: gsap.quickTo(estado, "y", { duration: 0.7, ease: "power3.out" }),
    };
    const alMover = (evento) => {
      if (!mover || evento.pointerType !== "mouse" || bloqueado.current) return;
      mover.x((evento.clientX / window.innerWidth - 0.5) * 36);
      mover.y((evento.clientY / window.innerHeight - 0.5) * 36);
    };
    const alRedimensionar = () => {
      if (bloqueado.current) return;
      estado.r = tamano = radioBase();
    };
    window.addEventListener("pointermove", alMover, { passive: true });
    window.addEventListener("resize", alRedimensionar);
    el.focus({ preventScroll: true });

    lineaTiempo.current = { estado };

    return () => {
      window.removeEventListener("pointermove", alMover);
      window.removeEventListener("resize", alRedimensionar);
      gsap.ticker.remove(dibujar);
      gsap.killTweensOf(estado);
      lineaTiempo.current?.timeline?.kill();
    };
  }, [reducido]);

  function enfocar() {
    if (bloqueado.current) return;
    bloqueado.current = true;
    playFocusClick();
    const { estado } = lineaTiempo.current;

    if (reducido) {
      gsap.to(raiz.current, { opacity: 0, duration: 0.3, onComplete: () => onComplete?.() });
      return;
    }

    const radioFinal = Math.hypot(window.innerWidth, window.innerHeight) * 0.75;
    const tl = gsap.timeline({ onComplete: () => onComplete?.() });
    lineaTiempo.current.timeline = tl;
    gsap.killTweensOf(estado, "x,y");

    tl.to(estado, { x: 0, y: 0, duration: 0.4, ease: "power2.out" }, 0)
      .to(estado, { rot1: 110, duration: 0.75, ease: "power2.inOut" }, 0)
      .to(estado, { rot2: -150, duration: 0.75, ease: "power2.inOut" }, 0)
      .to(estado, { blur: 0, duration: 0.7, ease: "power2.out" }, 0)
      .to(estado, { destello: 1, duration: 0.15, ease: "none" }, 0.2)
      .to(estado, { giro: 360, duration: 0.6, ease: "power1.inOut" }, 0.2)
      .to(estado, { destello: 0, duration: 0.25, ease: "none" }, 0.55)
      .to(estado, { r: radioFinal, duration: 0.65, ease: "power4.inOut" }, 0.55)
      .to(estado, { escala: 2.6, hud: 0, duration: 0.5, ease: "power2.in" }, 0.55);
  }

  function alTeclear(evento) {
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      enfocar();
    }
  }

  return (
    <div
      ref={raiz}
      className="telescope-intro"
      role="button"
      tabIndex={0}
      aria-label="Hacé clic para enfocar el cielo y entrar a la página"
      onClick={enfocar}
      onKeyDown={alTeclear}
    >
      <div className="telescope-shade" />
      <div className="telescope-lens" />
      <div ref={hud} className="telescope-hud" aria-hidden="true">
        <svg viewBox="-200 -200 400 400">
          <defs>
            <linearGradient id="ti-destello" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="currentColor" stopOpacity="0" />
              <stop offset="1" stopColor="currentColor" stopOpacity="1" />
            </linearGradient>
          </defs>
          <circle className="ti-lente" r={RADIO_VENTANA} />
          <g ref={destello} style={{ opacity: 0 }}>
            <circle className="ti-destello" r={RADIO_VENTANA} stroke="url(#ti-destello)" strokeDasharray="230 525" />
          </g>
          <g ref={anillo1}>
            <circle className="ti-anillo" r="138" />
            {MARCAS_ANILLO.map((grados) => (
              <line
                key={grados}
                className="ti-marca"
                x1="0" x2="0" y1="-138" y2={grados % 30 === 0 ? -150 : -144}
                transform={`rotate(${grados})`}
              />
            ))}
          </g>
          <g ref={anillo2}>
            <circle className="ti-anillo ti-anillo-fino" r="162" strokeDasharray="2 6" />
            {MARCAS_FINAS.map((grados) => (
              <line key={grados} className="ti-marca ti-marca-fina" x1="0" x2="0" y1="-162" y2="-168" transform={`rotate(${grados})`} />
            ))}
          </g>
          {[0, 90, 180, 270].map((grados) => (
            <line key={grados} className="ti-cruz" x1="0" x2="0" y1="-112" y2="-128" transform={`rotate(${grados})`} />
          ))}
          <text className="ti-texto" x="-188" y="-178">RA 05h 35m</text>
          <text className="ti-texto" x="188" y="-178" textAnchor="end">DEC −05° 23′</text>
          <text className="ti-texto" x="-188" y="188">M42 · ORIÓN</text>
          <text className="ti-texto" x="188" y="188" textAnchor="end">FOCO 0.0</text>
        </svg>
        <p className="telescope-hint">Hacé clic para enfocar el cielo</p>
      </div>
    </div>
  );
}
