import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import FloatingButton from "./FloatingButton.jsx";
import neptuno from "../../imagenes/neptuno.jpg";
import pilaresDos from "../../imagenes/pilares (2).jpg";
import pilares from "../../imagenes/pilares.jpg";
import galaxia from "../../imagenes/galaxia.webp";

const entrada = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Hero({ onExplore }) {
  const contenido = useRef(null);
  const movimientoReducido = useReducedMotion();

  const seccion = useRef(null);
  const titulo = useRef(null);

  useEffect(() => () => gsap.killTweensOf(contenido.current), []);

  useEffect(() => {
    if (movimientoReducido || !seccion.current || !titulo.current) return undefined;
    const ctx = gsap.context(() => {
      const trigger = { trigger: seccion.current, start: "top top", end: "bottom top" };
      gsap.to(".hero-line-1", {
        xPercent: -12,
        letterSpacing: "0.22em",
        scaleX: 1.25,
        ease: "none",
        scrollTrigger: { ...trigger, scrub: 0.6 },
      });
      gsap.to(".hero-line-2", {
        xPercent: 12,
        letterSpacing: "0.28em",
        scaleX: 1.3,
        ease: "none",
        scrollTrigger: { ...trigger, scrub: 0.6 },
      });

      const clamp = gsap.utils.clamp(-1, 1);
      const rebote = () => gsap.to(titulo.current, {
        scaleY: 1, scaleX: 1, skewY: 0, duration: 0.7, ease: "elastic.out(1, 0.45)", overwrite: true,
      });
      const reposo = gsap.delayedCall(0.12, rebote).pause();
      ScrollTrigger.create({
        ...trigger,
        onUpdate: (self) => {
          const v = self.getVelocity();
          const fuerza = Math.min(Math.abs(v) / 2500, 1);
          gsap.to(titulo.current, {
            scaleY: gsap.utils.clamp(1, 2.1, 1 + fuerza * 1.1),
            scaleX: 1 - fuerza * 0.12,
            skewY: clamp(v / 2500) * -8,
            duration: 0.15,
            ease: "power2.out",
            overwrite: true,
          });
          reposo.restart(true);
        },
        onLeave: rebote,
        onLeaveBack: rebote,
      });
    }, seccion);
    return () => ctx.revert();
  }, [movimientoReducido]);

  function explorar(event) {
    event.preventDefault();
    if (!movimientoReducido && contenido.current) {
      gsap.killTweensOf(contenido.current);
      gsap.to(contenido.current, {
        scale: 1.06,
        filter: "blur(4px)",
        duration: 0.25,
        ease: "power2.out",
        yoyo: true,
        repeat: 1,
        onComplete: () => gsap.set(contenido.current, { clearProps: "filter" }),
      });
    }
    onExplore?.();
  }

  return (
    <section ref={seccion} className="carousel" aria-label="Galería del universo">
      <div className="carousel-container">
        <img src={neptuno} alt="Neptuno" decoding="async" fetchPriority="high" />
        <img src={pilaresDos} alt="Pilares de la Creación" loading="lazy" decoding="async" />
        <img src={pilares} alt="Nebulosa Pilares de la Creación desde el Hubble" loading="lazy" decoding="async" />
        <img src={galaxia} alt="Galaxia lejana" loading="lazy" decoding="async" />
      </div>
      <motion.div
        ref={contenido}
        className="carousel-content"
        initial={movimientoReducido ? false : "hidden"}
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.14 } } }}
      >
        <motion.span className="eyebrow" variants={entrada} transition={{ duration: 0.6 }}>
          UN UNIVERSO POR DESCUBRIR
        </motion.span>
        <motion.h1 variants={entrada} transition={{ duration: 0.6 }}>
          <span ref={titulo} className="hero-title-inner">
            <span className="hero-line-1">Bienvenidos al</span>{" "}
            <em className="hero-line-2">universo.</em>
          </span>
        </motion.h1>
        <motion.p variants={entrada} transition={{ duration: 0.6 }}>
          Cada noche es una nueva oportunidad para mirar arriba y descubrir lo extraordinario.
        </motion.p>
        <motion.div className="hero-cta" variants={entrada} transition={{ duration: 0.6 }}>
          <FloatingButton as="a" href="#ubicacion" onClick={explorar} variant="primary" icon={<ArrowDown size={18} />} iconPosition="end">
            Explorar el cielo
          </FloatingButton>
        </motion.div>
      </motion.div>
    </section>
  );
}
