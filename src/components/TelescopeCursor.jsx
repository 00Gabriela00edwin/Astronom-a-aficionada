import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const INTERACTIVO = "a, button, input, select, textarea, label, summary, [role='button'], [role='slider'], .rs-cohete";

export default function TelescopeCursor() {
  const raiz = useRef(null);
  const reticulo = useRef(null);
  const [activo] = useState(() => window.matchMedia("(pointer: fine)").matches);

  useEffect(() => {
    if (!activo) return undefined;
    const el = raiz.current;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.set(el, { xPercent: -50, yPercent: -50 });
    const opciones = { duration: reducido ? 0 : 0.12, ease: "power3.out" };
    const x = gsap.quickTo(el, "x", opciones);
    const y = gsap.quickTo(el, "y", opciones);
    const escala = (valor) => { reticulo.current.style.transform = `scale(${valor})`; };
    let visible = false;

    const mostrar = (valor) => {
      if (visible === valor) return;
      visible = valor;
      el.style.opacity = valor ? "1" : "0";
    };
    const mover = (evento) => {
      if (evento.pointerType !== "mouse") return;
      if (!visible) {
        gsap.set(el, { x: evento.clientX, y: evento.clientY });
        mostrar(true);
      }
      x(evento.clientX);
      y(evento.clientY);
      escala(evento.target.closest?.(INTERACTIVO) ? 1.35 : 1);
    };
    const bajar = () => escala(0.8);
    const subir = (evento) => escala(evento.target?.closest?.(INTERACTIVO) ? 1.35 : 1);
    const salir = () => mostrar(false);

    window.addEventListener("pointermove", mover, { passive: true });
    window.addEventListener("pointerdown", bajar, { passive: true });
    window.addEventListener("pointerup", subir, { passive: true });
    document.documentElement.addEventListener("pointerleave", salir);
    window.addEventListener("blur", salir);
    return () => {
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerdown", bajar);
      window.removeEventListener("pointerup", subir);
      document.documentElement.removeEventListener("pointerleave", salir);
      window.removeEventListener("blur", salir);
      gsap.killTweensOf(el);
    };
  }, [activo]);

  if (!activo) return null;

  return (
    <div ref={raiz} className="telescope-cursor" aria-hidden="true">
      <span ref={reticulo} className="tc-escala">
        <svg viewBox="-16 -16 32 32" width="28" height="28">
          <circle className="tc-anillo" r="9" />
          <path className="tc-cruz" d="M0 -15V-6M0 6V15M-15 0H-6M6 0H15" />
          <circle className="tc-punto" r="1.1" />
        </svg>
      </span>
    </div>
  );
}
