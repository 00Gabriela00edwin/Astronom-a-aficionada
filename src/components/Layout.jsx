import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Eye, Menu, Moon, Volume2, VolumeX, X } from "lucide-react";
import { getMuted, toggleMute } from "../utils/spaceAudio.js";
import { DateTime } from "luxon";
import { useModoNocturno } from "../ModoNocturno.jsx";
import FloatingButton from "./FloatingButton.jsx";

const enlacesGaleria = [
  { href: "#luna", texto: "Mis fotos de la Luna" },
  { href: "#saturno", texto: "Saturno" },
  { href: "#jupiter", texto: "Júpiter" },
  { href: "#cumulos", texto: "Cúmulos" },
];

export function Header() {
  const { modoNocturno, alternarModo } = useModoNocturno();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [galeriaAbierta, setGaleriaAbierta] = useState(false);
  const [silenciado, setSilenciado] = useState(getMuted);
  const botonGaleria = useRef(null);
  const botonMenu = useRef(null);
  const movimientoReducido = useReducedMotion();

  function cerrarMenus() {
    setMenuAbierto(false);
    setGaleriaAbierta(false);
  }

  function manejarTeclado(event) {
    if (event.key !== "Escape") return;
    if (galeriaAbierta) {
      setGaleriaAbierta(false);
      botonGaleria.current?.focus();
    } else if (menuAbierto) {
      setMenuAbierto(false);
      botonMenu.current?.focus();
    }
  }

  return (
    <header
      className="site-header"
      onKeyDown={manejarTeclado}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) cerrarMenus();
      }}
    >
      <div className="header-inner">
        <a className="brand" href="#" aria-label="Astronomía Aficionada, inicio" onClick={cerrarMenus}>
          <span className="brand-text"><span>Astronomía</span><small>Aficionada</small></span>
        </a>

        <div className="header-actions">
          <nav id="navegacion-principal" className={`main-nav${menuAbierto ? " is-open" : ""}`} aria-label="Navegación principal">
            <div className="dropdown">
              <button
                ref={botonGaleria}
                type="button"
                className="nav-link"
                aria-expanded={galeriaAbierta}
                aria-controls={galeriaAbierta ? "galeria-menu" : undefined}
                onClick={() => setGaleriaAbierta((abierta) => !abierta)}
              >
                Galería <ChevronDown size={16} aria-hidden="true" className={galeriaAbierta ? "chevron is-open" : "chevron"} />
              </button>
              <AnimatePresence>
                {galeriaAbierta && (
                  <motion.ul
                    id="galeria-menu"
                    className="dropdown-menu"
                    initial={{ opacity: 0, y: movimientoReducido ? 0 : -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: movimientoReducido ? 0 : -8 }}
                    transition={{ duration: movimientoReducido ? 0 : 0.18 }}
                  >
                    {enlacesGaleria.map((enlace) => (
                      <li key={enlace.href}>
                        <a href={enlace.href} onClick={cerrarMenus}>{enlace.texto}</a>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </nav>
          <FloatingButton
            variant="subtle"
            dot={false}
            className="night-toggle"
            aria-label="Modo visión nocturna"
            aria-pressed={modoNocturno}
            onClick={alternarModo}
            icon={modoNocturno ? <Eye size={18} /> : <Moon size={18} />}
          >
            <span className="night-toggle-text">Visión nocturna</span>
            <span className="toggle-indicator" aria-hidden="true" />
          </FloatingButton>
          <FloatingButton
            variant="subtle"
            dot={false}
            className="sound-toggle"
            aria-label={silenciado ? "Activar sonido" : "Silenciar sonido"}
            aria-pressed={!silenciado}
            onClick={() => setSilenciado(toggleMute())}
            icon={silenciado ? <VolumeX size={18} /> : <Volume2 size={18} />}
          />
          <button
            ref={botonMenu}
            type="button"
            className="mobile-menu-toggle"
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuAbierto}
            aria-controls="navegacion-principal"
            onClick={() => {
              setMenuAbierto((abierto) => !abierto);
              setGaleriaAbierta(false);
            }}
          >
            {menuAbierto ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}

export function Aside() {
  const [hora, setHora] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setHora(DateTime.now().setLocale("es").toFormat("HH:mm:ss - dd LLL yyyy"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="quote-card hud-section">
      <span className="eyebrow">UNA MIRADA AL COSMOS</span>
      <p className="quote">"En algún lugar, algo increíble está esperando a ser descubierto."</p>
      <h2>Carl Sagan</h2>
      <div id="reloj">{hora}</div>
    </aside>
  );
}

export function Footer() {
  return <footer><p>Página desarrollada por Gaby Evelyn Edwin <span aria-hidden="true">✦</span></p></footer>;
}
