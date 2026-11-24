import React, { Suspense, lazy, useEffect, useState } from "react";
import { CloudMoon, CloudRain, Cloud, Compass, Gauge, Moon, Thermometer, Wind } from "lucide-react";
import { calcularFaseLunar, evaluarCielo } from "../utils/astronomia.js";
import SectionHeading from "./SectionHeading.jsx";
const Moon3D = lazy(() => import("./Moon3D.jsx"));
import WindRadar from "./WindRadar.jsx";
import { useModoNocturno } from "../ModoNocturno.jsx";

function DatoClima({ icon: Icon, label, value }) {
  return (
    <div className="weather-tile">
      <Icon size={20} aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FaseLunar({ zona, latitud }) {
  const [fecha, setFecha] = useState(() => new Date());

  useEffect(() => {
    const intervalo = setInterval(() => setFecha(new Date()), 60000);
    return () => clearInterval(intervalo);
  }, []);

  const fase = calcularFaseLunar(fecha);
  const { modoNocturno } = useModoNocturno();

  return (
    <div className="moon-tile">
      <div>
        <span className="tile-label"><Moon size={16} aria-hidden="true" /> FASE LUNAR ACTUAL</span>
        <h3>{fase.nombre}</h3>
        <p>Iluminación aproximada: {fase.iluminacion} %</p>
        <small>{fecha.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric", ...(zona ? { timeZone: zona } : {}) })}</small>
      </div>
      <figure className="moon-figure">
        <Suspense fallback={<div className="moon-3d" aria-hidden="true" />}>
          <Moon3D
            phase={fase.progreso}
            illumination={fase.iluminacion}
            latitude={latitud}
            isNightVision={modoNocturno}
          />
        </Suspense>
        <figcaption>Arrastrá para explorar</figcaption>
      </figure>
    </div>
  );
}

export default function Clima({ clima, cargando, error, ubicacion }) {
  const { modoNocturno } = useModoNocturno();
  const nubes = clima ? Math.min(Math.max(Number(clima.nubosidad) || 0, 0), 100) / 100 : 0;
  return (
    <section id="climaAstronomico" className="hud-section">
      <SectionHeading icon={CloudMoon} eyebrow="02 // ATMÓSFERA">Clima Actual</SectionHeading>
      <div id="datosClima">
        {error ? <p className="weather-message" role="alert">Error al obtener datos del clima. Puedes reintentar desde el formulario.</p>
          : clima ? (
            <>
              <DatoClima icon={Thermometer} label="Temperatura" value={`${clima.temperature} °C`} />
              <DatoClima icon={Cloud} label="Nubosidad" value={`${clima.nubosidad} %`} />
              <DatoClima icon={CloudRain} label="Precipitación actual" value={`${clima.precipitacion} mm`} />
              <div className="wind-tile">
                <WindRadar speed={clima.windspeed} direction={clima.winddirection} isNightVision={modoNocturno} />
                <div className="wind-telemetry">
                  <span className="tile-label"><Wind size={16} aria-hidden="true" /> VIENTO</span>
                  <div>
                    <span>Velocidad del viento</span>
                    <strong>{clima.windspeed} km/h</strong>
                  </div>
                  <div>
                    <span><Compass size={14} aria-hidden="true" /> Dirección del viento</span>
                    <strong>{clima.winddirection}°</strong>
                  </div>
                </div>
              </div>
              <div className="sky-tile" style={{ "--nubes": nubes }}>
                <div className="sky-atmosphere" aria-hidden="true" />
                <span className="tile-label"><Gauge size={16} aria-hidden="true" /> ESTADO DEL CIELO PARA OBSERVAR</span>
                <strong>{evaluarCielo(clima.windspeed, clima.nubosidad, clima.precipitacion)}</strong>
                <p>Estimación orientativa basada en viento, nubosidad y precipitación. No considera turbulencia atmosférica ni garantiza visibilidad.</p>
              </div>
              <div className="forecast-tile">
                <span className="tile-label">PRÓXIMAS HORAS · HORA LOCAL</span>
                <div className="forecast-list">
                  {clima.pronostico.map((hora) => (
                    <div className="forecast-hour" key={hora.hora}>
                      <strong>{hora.etiqueta}</strong>
                      <span>Nubes {hora.nubosidad} %</span>
                      <span>Prob. lluvia {hora.probabilidad} %</span>
                      <span>Lluvia {hora.precipitacion} mm</span>
                      <span>Viento {hora.viento} km/h</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : <p className="weather-message" role="status">Cargando datos...</p>}
        <FaseLunar zona={ubicacion.zona || clima?.zona} latitud={ubicacion.latitud} />
        {clima && !error && <p className="weather-time">{cargando ? "Actualizando medición…" : `Datos en ${ubicacion.nombre}: ${clima.time} (${clima.zona})`}</p>}
      </div>
    </section>
  );
}
