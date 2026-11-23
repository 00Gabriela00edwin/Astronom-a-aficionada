import React, { useEffect, useState } from "react";
import { CloudMoon, Compass, Gauge, Moon, Thermometer, Wind } from "lucide-react";
import { calcularFaseLunar, evaluarViento } from "../utils/astronomia.js";
import SectionHeading from "./SectionHeading.jsx";

function DatoClima({ icon: Icon, label, value }) {
  return (
    <div className="weather-tile">
      <Icon size={20} aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FaseLunar() {
  const [fecha, setFecha] = useState(() => new Date());

  useEffect(() => {
    const intervalo = setInterval(() => setFecha(new Date()), 60000);
    return () => clearInterval(intervalo);
  }, []);

  const fase = calcularFaseLunar(fecha);
  const creciente = fase.progreso < 0.5;
  const radio = Math.max(0.001, 40 * Math.abs(fase.coseno));
  const ladoExterior = creciente ? 1 : 0;
  const ladoTerminador = creciente
    ? (fase.coseno >= 0 ? 0 : 1)
    : (fase.coseno >= 0 ? 1 : 0);
  const iluminado = `M 50 10 A 40 40 0 0 ${ladoExterior} 50 90 A ${radio} 40 0 0 ${ladoTerminador} 50 10 Z`;

  return (
    <div className="moon-tile">
      <div>
        <span className="tile-label"><Moon size={16} aria-hidden="true" /> FASE LUNAR ACTUAL</span>
        <h3>{fase.nombre}</h3>
        <p>Iluminación aproximada: {fase.iluminacion} %</p>
        <small>{fecha.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}</small>
      </div>
      <svg viewBox="0 0 100 100" className="moon-graphic" role="img" aria-label={`${fase.nombre}, ${fase.iluminacion} % iluminada`}>
        <circle cx="50" cy="50" r="40" className="moon-shadow" />
        <path d={iluminado} className="moon-light" />
        <circle cx="50" cy="50" r="40" className="moon-outline" />
      </svg>
    </div>
  );
}

export default function Clima({ clima, cargando, error }) {
  return (
    <section id="climaAstronomico" className="glass-card bg-white/5 backdrop-blur-md border border-white/10">
      <SectionHeading icon={CloudMoon} eyebrow="CONDICIONES DE OBSERVACIÓN">Clima Actual</SectionHeading>
      <div id="datosClima">
        {error ? <p className="weather-message" role="alert">Error al obtener datos del clima. Puedes reintentar desde el formulario.</p>
          : clima ? (
            <>
              <DatoClima icon={Thermometer} label="Temperatura" value={`${clima.temperature} °C`} />
              <DatoClima icon={Wind} label="Velocidad del viento" value={`${clima.windspeed} km/h`} />
              <DatoClima icon={Compass} label="Dirección del viento" value={`${clima.winddirection}°`} />
              <div className="sky-tile">
                <span className="tile-label"><Gauge size={16} aria-hidden="true" /> ESTADO DEL CIELO PARA OBSERVAR</span>
                <strong>{evaluarViento(clima.windspeed)}</strong>
                <p>Estimación basada solo en el viento; no considera nubosidad.</p>
              </div>
            </>
          ) : <p className="weather-message" role="status">Cargando datos...</p>}
        <FaseLunar />
        {clima && !error && <p className="weather-time">{cargando ? "Actualizando medición…" : `Medición en Buenos Aires: ${clima.time}`}</p>}
      </div>
    </section>
  );
}
