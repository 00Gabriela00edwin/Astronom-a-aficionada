import React, { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";
import StarfieldBackground from "./StarfieldBackground.jsx";
import neptuno from "../../imagenes/neptuno.jpg";
import pilaresDos from "../../imagenes/pilares (2).jpg";
import pilares from "../../imagenes/pilares.jpg";
import galaxia from "../../imagenes/galaxia.webp";

const entrada = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Hero() {
  const puntero = useRef({ x: 0, y: 0 });
  const movimientoReducido = useReducedMotion();

  function moverPuntero(event) {
    if (event.pointerType !== "mouse" || movimientoReducido) return;
    const rect = event.currentTarget.getBoundingClientRect();
    puntero.current = {
      x: (event.clientX - rect.left) / rect.width - 0.5,
      y: (event.clientY - rect.top) / rect.height - 0.5,
    };
  }

  return (
    <section
      className="carousel"
      aria-label="Galería del universo"
      onPointerMove={moverPuntero}
      onPointerLeave={() => { puntero.current = { x: 0, y: 0 }; }}
    >
      <div className="carousel-container">
        <img src={neptuno} alt="Neptuno" />
        <img src={pilaresDos} alt="Pilares de la Creación" />
        <img src={pilares} alt="Nebulosa Pilares de la Creación desde el Hubble" />
        <img src={galaxia} alt="Galaxia lejana" />
      </div>
      <StarfieldBackground puntero={puntero} movimientoReducido={movimientoReducido} />
      <motion.div
        className="carousel-content"
        initial={movimientoReducido ? false : "hidden"}
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.14 } } }}
      >
        <motion.span className="eyebrow" variants={entrada} transition={{ duration: 0.6 }}>
          <Sparkles size={14} aria-hidden="true" /> UN UNIVERSO POR DESCUBRIR
        </motion.span>
        <motion.h1 variants={entrada} transition={{ duration: 0.6 }}>
          Bienvenidos al <em>universo.</em>
        </motion.h1>
        <motion.p variants={entrada} transition={{ duration: 0.6 }}>
          Cada noche es una nueva oportunidad para mirar arriba y descubrir lo extraordinario.
        </motion.p>
        <motion.a className="hero-link" href="#dashboard" variants={entrada} transition={{ duration: 0.6 }}>
          Explorar el cielo <ArrowDown size={18} aria-hidden="true" />
        </motion.a>
      </motion.div>
    </section>
  );
}
