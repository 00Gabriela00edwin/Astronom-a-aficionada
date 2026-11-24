import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DESENFOCADO = { opacity: 0.45, scale: 0.98 };

export default function FocusSection({ id, children }) {
  const raiz = useRef(null);

  useEffect(() => {
    const elemento = raiz.current;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducido) return undefined;

    const sinBlur = window.matchMedia("(max-width: 720px)").matches;
    const desenfocado = { ...DESENFOCADO, ...(sinBlur ? {} : { filter: "blur(3px)" }) };

    const enfocar = () => gsap.to(elemento, {
      opacity: 1,
      scale: 1,
      ...(sinBlur ? {} : { filter: "blur(0px)" }),
      duration: 0.7,
      ease: "power2.out",
      overwrite: true,
      onComplete: () => gsap.set(elemento, { clearProps: "opacity,transform,filter" }),
    });
    const desenfocar = () => gsap.to(elemento, { ...desenfocado, duration: 0.7, ease: "power2.out", overwrite: true });

    // Franja central: la sección está enfocada mientras cruza el 30 %–70 % de la pantalla.
    const trigger = ScrollTrigger.create({
      trigger: elemento,
      start: "top 70%",
      end: "bottom 30%",
      onToggle: (self) => (self.isActive ? enfocar() : desenfocar()),
    });
    if (!trigger.isActive) gsap.set(elemento, desenfocado);

    const observador = new ResizeObserver(() => trigger.refresh());
    observador.observe(elemento);

    return () => {
      observador.disconnect();
      trigger.kill();
      gsap.killTweensOf(elemento);
      gsap.set(elemento, { clearProps: "opacity,transform,filter" });
    };
  }, []);

  return (
    <div ref={raiz} id={id} className="focus-section">
      {children}
    </div>
  );
}
