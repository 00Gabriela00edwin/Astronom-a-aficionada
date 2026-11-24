import React, { useEffect, useRef } from "react";

const ALTO_COHETE = 36;
const PASO_TECLADO = 90;

export default function RocketScrollbar() {
  const pista = useRef(null);
  const cohete = useRef(null);
  const giro = useRef(null);
  const progreso = useRef(null);

  useEffect(() => {
    const el = pista.current;
    const documento = document.documentElement;
    const maximo = () => Math.max(1, documento.scrollHeight - window.innerHeight);
    const recorrido = () => Math.max(1, el.clientHeight - ALTO_COHETE);
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let ultimo = window.scrollY;
    let cuadro = 0;
    let reposo = 0;
    let arrastrando = false;

    function dibujar() {
      cuadro = 0;
      const y = window.scrollY;
      const fraccion = Math.min(1, Math.max(0, y / maximo()));
      cohete.current.style.transform = `translate3d(0, ${fraccion * recorrido()}px, 0)`;
      progreso.current.style.transform = `scaleY(${fraccion})`;
      cohete.current.setAttribute("aria-valuenow", String(Math.round(fraccion * 100)));

      const delta = y - ultimo;
      if (delta !== 0) {
        ultimo = y;
        giro.current.style.transform = delta > 0 ? "rotate(180deg)" : "rotate(0deg)";
        el.classList.add("is-active");
        window.clearTimeout(reposo);
        reposo = window.setTimeout(() => el.classList.remove("is-active"), 150);
      }
    }

    const pedirCuadro = () => {
      if (!cuadro) cuadro = window.requestAnimationFrame(dibujar);
    };

    window.addEventListener("scroll", pedirCuadro, { passive: true });
    window.addEventListener("resize", pedirCuadro);
    const observador = new ResizeObserver(pedirCuadro);
    observador.observe(documento);
    observador.observe(el);
    dibujar();

    // Arrastre del cohete: window recibe move/up para no perder el puntero fuera del track.
    let inicioY = 0;
    let inicioScroll = 0;
    const mover = (evento) => {
      const proporcion = maximo() / recorrido();
      window.scrollTo({ top: inicioScroll + (evento.clientY - inicioY) * proporcion, behavior: "instant" });
    };
    const soltar = () => {
      arrastrando = false;
      el.classList.remove("is-dragging");
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerup", soltar);
      window.removeEventListener("pointercancel", soltar);
    };
    const agarrar = (evento) => {
      if (evento.button !== 0) return;
      evento.preventDefault();
      evento.stopPropagation();
      arrastrando = true;
      inicioY = evento.clientY;
      inicioScroll = window.scrollY;
      el.classList.add("is-dragging");
      document.body.style.userSelect = "none";
      document.body.style.cursor = "grabbing";
      window.addEventListener("pointermove", mover);
      window.addEventListener("pointerup", soltar);
      window.addEventListener("pointercancel", soltar);
    };
    const irA = (evento) => {
      if (arrastrando || cohete.current.contains(evento.target)) return;
      const rect = el.getBoundingClientRect();
      const fraccion = Math.min(1, Math.max(0, (evento.clientY - rect.top - ALTO_COHETE / 2) / recorrido()));
      window.scrollTo({ top: fraccion * maximo(), behavior: reducido ? "instant" : "smooth" });
    };
    const teclado = (evento) => {
      const pasos = {
        ArrowDown: () => window.scrollBy({ top: PASO_TECLADO, behavior: "instant" }),
        ArrowUp: () => window.scrollBy({ top: -PASO_TECLADO, behavior: "instant" }),
        PageDown: () => window.scrollBy({ top: window.innerHeight * 0.9, behavior: "instant" }),
        PageUp: () => window.scrollBy({ top: -window.innerHeight * 0.9, behavior: "instant" }),
        Home: () => window.scrollTo({ top: 0, behavior: "instant" }),
        End: () => window.scrollTo({ top: maximo(), behavior: "instant" }),
      };
      if (pasos[evento.key]) {
        evento.preventDefault();
        pasos[evento.key]();
      }
    };

    const nodoCohete = cohete.current;
    nodoCohete.addEventListener("pointerdown", agarrar);
    nodoCohete.addEventListener("keydown", teclado);
    el.addEventListener("click", irA);

    return () => {
      window.removeEventListener("scroll", pedirCuadro);
      window.removeEventListener("resize", pedirCuadro);
      observador.disconnect();
      window.cancelAnimationFrame(cuadro);
      window.clearTimeout(reposo);
      nodoCohete.removeEventListener("pointerdown", agarrar);
      nodoCohete.removeEventListener("keydown", teclado);
      el.removeEventListener("click", irA);
      soltar();
    };
  }, []);

  return (
    <div ref={pista} className="rocket-scrollbar">
      <div className="rs-linea" aria-hidden="true">
        <div ref={progreso} className="rs-progreso" />
      </div>
      <div
        ref={cohete}
        className="rs-cohete"
        role="slider"
        tabIndex={0}
        aria-label="Posición de la página"
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
      >
        <div ref={giro} className="rs-giro">
          <svg viewBox="0 0 24 36" aria-hidden="true">
            <g className="rs-llama">
              <path className="rs-llama-externa" d="M8.5 24 Q12 36 15.5 24 Z" />
              <path className="rs-llama-interna" d="M10.3 24 Q12 31 13.7 24 Z" />
            </g>
            <path className="rs-aleta" d="M8 16 L3 24 L8 22.5 Z M16 16 L21 24 L16 22.5 Z" />
            <path className="rs-cuerpo" d="M12 1 C16 6 17 13 16 24 H8 C7 13 8 6 12 1 Z" />
            <circle className="rs-ventana" cx="12" cy="12" r="2.2" />
          </svg>
        </div>
      </div>
    </div>
  );
}
