import React, { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { playHoverTick } from "../utils/spaceAudio.js";

const LIMITE_CUERPO = 12;
const LIMITE_INTERIOR = 6;

function limitar(valor, limite) {
  return Math.max(-limite, Math.min(limite, valor));
}

export default function FloatingButton({
  as: Etiqueta = "button",
  children,
  onClick,
  type = "button",
  icon = null,
  iconPosition = "start",
  dot = true,
  variant = "primary",
  className = "",
  disabled = false,
  delay,
  ...resto
}) {
  const raiz = useRef(null);
  const cuerpo = useRef(null);
  const interior = useRef(null);
  const imanes = useRef(null);
  const retraso = useMemo(() => (Number.isFinite(delay) ? delay : -Math.random() * 4), [delay]);
  const esBoton = Etiqueta === "button";
  const inactivo = disabled && esBoton;

  useEffect(() => () => gsap.killTweensOf([cuerpo.current, interior.current]), []);

  function permitido(evento) {
    return !inactivo && evento.pointerType === "mouse" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function entrar(evento) {
    if (!inactivo && evento.pointerType === "mouse") playHoverTick();
    if (!permitido(evento)) return;
    const opciones = { duration: 0.45, ease: "power3.out" };
    imanes.current = {
      cx: gsap.quickTo(cuerpo.current, "x", opciones),
      cy: gsap.quickTo(cuerpo.current, "y", opciones),
      ix: gsap.quickTo(interior.current, "x", opciones),
      iy: gsap.quickTo(interior.current, "y", opciones),
    };
  }

  function mover(evento) {
    if (!imanes.current || !permitido(evento)) return;
    const rect = raiz.current.getBoundingClientRect();
    const dx = evento.clientX - (rect.left + rect.width / 2);
    const dy = evento.clientY - (rect.top + rect.height / 2);
    imanes.current.cx(limitar(dx * 0.3, LIMITE_CUERPO));
    imanes.current.cy(limitar(dy * 0.3, LIMITE_CUERPO));
    imanes.current.ix(limitar(dx * 0.15, LIMITE_INTERIOR));
    imanes.current.iy(limitar(dy * 0.15, LIMITE_INTERIOR));
  }

  function salir() {
    if (!imanes.current) return;
    imanes.current = null;
    gsap.to([cuerpo.current, interior.current], {
      x: 0,
      y: 0,
      duration: 1.2,
      ease: "elastic.out(1, 0.4)",
      overwrite: true,
    });
  }

  const propiedades = esBoton ? { type, disabled } : { "aria-disabled": inactivo || undefined };
  const clases = ["floating-btn", `floating-btn--${variant}`, className].filter(Boolean).join(" ");

  return (
    <Etiqueta
      ref={raiz}
      className={clases}
      style={{ "--float-delay": `${retraso}s` }}
      onClick={onClick}
      onPointerEnter={entrar}
      onPointerMove={mover}
      onPointerLeave={salir}
      {...propiedades}
      {...resto}
    >
      <span ref={cuerpo} className="fb-body">
        <span className="fb-glow" aria-hidden="true" />
        <span ref={interior} className="fb-inner">
          {dot && <span className="fb-dot" aria-hidden="true" />}
          {icon && iconPosition === "start" && <span className="fb-icon" aria-hidden="true">{icon}</span>}
          <span className="fb-text">{children}</span>
          {icon && iconPosition === "end" && <span className="fb-icon" aria-hidden="true">{icon}</span>}
        </span>
        <span className="fb-beam" aria-hidden="true" />
      </span>
    </Etiqueta>
  );
}
