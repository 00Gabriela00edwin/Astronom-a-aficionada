import React, { useId, useState } from "react";
import { AlertTriangle, Orbit } from "lucide-react";
import { calcularAumentos } from "../utils/optica.js";
import SectionHeading from "./SectionHeading.jsx";

const objetos = ["Luna", "Saturno", "Júpiter"];

function ObjetoCeleste({ objeto, aumentos }) {
  const clipId = useId();

  return (
    <div className="celestial-object" style={{ transform: `scale(${aumentos / 100})` }} aria-hidden="true">
      {objeto === "Luna" && (
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="43" className="celestial-base" />
          <circle cx="35" cy="33" r="9" className="celestial-detail" />
          <circle cx="61" cy="24" r="5" className="celestial-detail" />
          <circle cx="68" cy="58" r="12" className="celestial-detail" />
          <circle cx="35" cy="68" r="7" className="celestial-detail" />
          <circle cx="48" cy="50" r="4" className="celestial-detail" />
        </svg>
      )}
      {objeto === "Saturno" && (
        <svg viewBox="0 0 100 100">
          <ellipse cx="50" cy="50" rx="47" ry="15" className="saturn-ring" transform="rotate(-20 50 50)" />
          <circle cx="50" cy="50" r="26" className="celestial-base" />
          <path d="M 28 44 Q 50 48 72 41 M 25 54 Q 50 59 75 52 M 31 64 Q 50 68 69 62" className="planet-lines" />
          <path d="M 7 65 Q 25 77 57 63 Q 82 53 93 35" className="saturn-ring-front" />
        </svg>
      )}
      {objeto === "Júpiter" && (
        <svg viewBox="0 0 100 100">
          <defs><clipPath id={clipId}><circle cx="50" cy="50" r="42" /></clipPath></defs>
          <circle cx="50" cy="50" r="42" className="celestial-base" />
          <g clipPath={`url(#${clipId})`} className="jupiter-bands">
            <path d="M 0 26 Q 50 38 100 26 L 100 38 Q 50 48 0 37 Z" />
            <path d="M 0 53 Q 50 61 100 51 L 100 63 Q 50 72 0 65 Z" />
            <path d="M 0 74 Q 50 81 100 72 L 100 78 Q 50 90 0 82 Z" />
            <ellipse cx="66" cy="58" rx="11" ry="5" className="jupiter-storm" />
          </g>
        </svg>
      )}
    </div>
  );
}

export default function CalculadoraAumentos({ telescopios, estadoCatalogo }) {
  const [telescopioId, setTelescopioId] = useState("");
  const [ocularMm, setOcularMm] = useState(10);
  const [objeto, setObjeto] = useState("Luna");
  const idActual = telescopioId || telescopios[0]?.id || "";
  const telescopio = telescopios.find((equipo) => equipo.id === idActual);

  return (
    <section id="calculadoraAumentos" className="hud-section">
      <SectionHeading icon={Orbit} eyebrow="05 // ÓPTICA Y EQUIPOS">Calculadora de Aumentos</SectionHeading>
      {!telescopio ? (
        <p className="calculator-message" role={estadoCatalogo === "error" ? "alert" : "status"}>
          {estadoCatalogo === "cargando" ? "Cargando catálogo de telescopios..." : estadoCatalogo === "error" ? "No se pudo cargar el catálogo de telescopios." : "No hay telescopios disponibles."}
        </p>
      ) : (
        <Calculadora telescopio={telescopio} telescopios={telescopios} onTelescopio={setTelescopioId}
          ocularMm={ocularMm} onOcular={setOcularMm} objeto={objeto} onObjeto={setObjeto} />
      )}
    </section>
  );
}

function Calculadora({ telescopio, telescopios, onTelescopio, ocularMm, onOcular, objeto, onObjeto }) {
  const { aumentos, maximoUtil, pupilaSalida, superaMaximo } = calcularAumentos(telescopio, ocularMm);

  return (
    <div className="calculator-layout">
      <div className="calculator-controls">
        <label htmlFor="telescopioCalculadora">Telescopio</label>
        <select id="telescopioCalculadora" value={telescopio.id} onChange={(event) => onTelescopio(event.target.value)}>
          {telescopios.map((equipo) => <option key={equipo.id} value={equipo.id}>{equipo.nombre} ({equipo.tipo})</option>)}
        </select>

        <div className="eyepiece-heading">
          <label htmlFor="ocularCalculadora">Distancia focal del ocular</label>
          <strong>{ocularMm} mm</strong>
        </div>
        <input id="ocularCalculadora" type="range" min="4" max="40" step="1" value={ocularMm}
          onChange={(event) => onOcular(Number(event.target.value))} />
        <div className="range-labels"><span>4 mm</span><span>40 mm</span></div>

        <div className="optics-results" aria-live="polite">
          <div><span>Aumentos</span><strong>{aumentos}×</strong></div>
          <div><span>Máximo útil</span><strong>{maximoUtil}×</strong></div>
          <div><span>Pupila de salida</span><strong>{pupilaSalida}</strong></div>
        </div>
        {superaMaximo && (
          <p className="optics-warning" role="status"><AlertTriangle size={17} aria-hidden="true" /> Se supera el aumento máximo útil; la imagen puede verse borrosa.</p>
        )}

        <div className="telescope-specs">
          <h3>Ficha técnica</h3>
          <dl>
            <div><dt>Tipo</dt><dd>{telescopio.tipo}</dd></div>
            <div><dt>Relación focal</dt><dd>{telescopio.relacionFocal}</dd></div>
            <div><dt>Montura</dt><dd>{telescopio.montura}</dd></div>
            <div><dt>Ideal para</dt><dd>{telescopio.idealPara}</dd></div>
          </dl>
        </div>
      </div>

      <figure className="eyepiece-preview">
        <div className="eyepiece-label">VISTA A TRAVÉS DEL OCULAR</div>
        <div className="eyepiece-circle">
          <ObjetoCeleste objeto={objeto} aumentos={aumentos} />
          <div className="object-picker" role="group" aria-label="Objeto para observar">
            {objetos.map((nombre) => (
              <button type="button" key={nombre} aria-pressed={objeto === nombre} onClick={() => onObjeto(nombre)}>{nombre}</button>
            ))}
          </div>
        </div>
        <figcaption>{objeto} a {aumentos}× · Simulación ilustrativa, no representa el campo real.</figcaption>
      </figure>
    </div>
  );
}
