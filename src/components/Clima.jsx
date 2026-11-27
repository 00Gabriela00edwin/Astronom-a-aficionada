import React, { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { CloudMoon, CloudRain, Cloud, CloudSun, Compass, Droplets, Gauge, Moon, Telescope, Thermometer, Wind } from "lucide-react";
import { calcularFaseLunar, evaluarCielo } from "../utils/astronomia.js";
import { seleccionarMejorHora } from "../utils/clima.js";
import { filtrarHorasNocturnas } from "../utils/efemerides.js";
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

function IconoPronostico({ hora }) {
  const Icon = hora.probabilidad >= 40 || hora.precipitacion > 0
    ? CloudRain
    : hora.nubosidad >= 50 ? Cloud : CloudSun;
  return <Icon size={22} aria-hidden="true" />;
}

function GraficoPronostico({ pronostico }) {
  const width = 840;
  const height = 220;
  const left = 44;
  const right = 42;
  const top = 18;
  const bottom = 36;
  const tempMin = Math.min(...pronostico.map((hora) => hora.temperatura)) - 1;
  const tempMax = Math.max(...pronostico.map((hora) => hora.temperatura)) + 1;
  const tempRange = Math.max(1, tempMax - tempMin);
  const plotHeight = height - top - bottom;
  const plotWidth = width - left - right;
  const x = (index) => left + index / (pronostico.length - 1) * plotWidth;
  const yTemperatura = (value) => top + (tempMax - value) / tempRange * plotHeight;
  const yNubosidad = (value) => top + (100 - value) / 100 * plotHeight;
  const puntosTemperatura = pronostico.map((hora, index) => `${x(index)},${yTemperatura(hora.temperatura)}`).join(" ");
  const puntosNubosidad = pronostico.map((hora, index) => `${x(index)},${yNubosidad(hora.nubosidad)}`).join(" ");
  const marcas = [0, 6, 12, 18, 23].filter((index) => index < pronostico.length);
  const niveles = [0, 0.5, 1];

  return (
    <figure className="forecast-chart">
      <div className="forecast-chart-heading">
        <figcaption className="tile-label">TENDENCIA · PRÓXIMAS 24 HORAS</figcaption>
        <div className="forecast-chart-legend" aria-hidden="true">
          <span className="legend-temperature">Temperatura</span>
          <span className="legend-clouds">Nubosidad</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Gráfico de temperatura y nubosidad para las próximas 24 horas">
        {niveles.map((nivel) => {
          const y = top + nivel * plotHeight;
          return (
            <g key={nivel}>
              <line x1={left} x2={width - right} y1={y} y2={y} className="forecast-chart-grid" />
              <text x={left - 8} y={y + 4} textAnchor="end" className="forecast-chart-label">{Math.round(tempMax - nivel * tempRange)}°</text>
              <text x={width - right + 8} y={y + 4} textAnchor="start" className="forecast-chart-label">{Math.round(100 - nivel * 100)}%</text>
            </g>
          );
        })}
        <polyline points={puntosNubosidad} className="forecast-chart-cloud-line" />
        <polyline points={puntosTemperatura} className="forecast-chart-temperature-line" />
        {marcas.map((index) => (
          <text key={index} x={x(index)} y={height - 8} textAnchor="middle" className="forecast-chart-label">
            {pronostico[index].horaLocal}
          </text>
        ))}
      </svg>
      <div className="forecast-chart-axis-labels" aria-hidden="true">
        <span>Temperatura · °C</span>
        <span>Nubosidad · %</span>
      </div>
    </figure>
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
  const mejorHoraPronostico = useMemo(() => {
    if (!clima) return null;
    const horasNocturnas = filtrarHorasNocturnas(clima.pronostico, ubicacion.latitud, ubicacion.longitud);
    return seleccionarMejorHora(horasNocturnas);
  }, [clima, ubicacion.latitud, ubicacion.longitud]);
  return (
    <section id="climaAstronomico" className="hud-section">
      <SectionHeading icon={CloudMoon} eyebrow="02 // ATMÓSFERA">Clima Actual</SectionHeading>
      <div id="datosClima">
        {error ? <p className="weather-message" role="alert">Error al obtener datos del clima. Puedes reintentar desde el formulario.</p>
          : clima ? (
            <>
              <DatoClima icon={Thermometer} label="Temperatura" value={`${clima.temperature} °C`} />
              <DatoClima icon={Droplets} label="Humedad relativa" value={`${clima.humedad} %`} />
              <DatoClima icon={Thermometer} label="Punto de rocío" value={`${clima.puntoRocio} °C`} />
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
                <div className="forecast-heading">
                  <span className="tile-label">PRÓXIMAS 24 HORAS</span>
                  <span className="forecast-timezone">Hora local · {clima.zona}</span>
                </div>
                <GraficoPronostico pronostico={clima.pronostico} />
                {mejorHoraPronostico && (
                  <aside className="best-hour" aria-label="Mejor hora nocturna según el clima">
                    <Telescope size={22} aria-hidden="true" />
                    <div className="best-hour-content">
                      <span className="tile-label">MEJOR HORA NOCTURNA</span>
                      <div className="best-hour-time">
                        <strong>{mejorHoraPronostico.horaLocal}</strong>
                        <span>{mejorHoraPronostico.diaLocal}</span>
                      </div>
                      <div className="best-hour-factors">
                        <span><Cloud size={14} aria-hidden="true" /> Nubes <strong>{mejorHoraPronostico.nubosidad}%</strong></span>
                        <span><CloudRain size={14} aria-hidden="true" /> Lluvia <strong>{mejorHoraPronostico.probabilidad}%</strong></span>
                        <span><Wind size={14} aria-hidden="true" /> Viento <strong>{mejorHoraPronostico.viento} km/h</strong></span>
                      </div>
                      <small>Solo considera horas con el Sol a −18° o más bajo el horizonte. Estimación por nubosidad, lluvia y viento; no garantiza visibilidad.</small>
                    </div>
                  </aside>
                )}
                {!mejorHoraPronostico && (
                  <p className="best-hour-empty" role="status">
                    No hay horas de oscuridad astronómica en el pronóstico de 24 horas; no se puede recomendar una ventana nocturna.
                  </p>
                )}
                <div className="forecast-list" role="list" aria-label="Pronóstico hora por hora para las próximas 24 horas" tabIndex="0">
                  {clima.pronostico.map((hora) => (
                    <div className={`forecast-hour${hora.hora === mejorHoraPronostico?.hora ? " is-best-hour" : ""}`} key={hora.hora} role="listitem">
                      <div className="forecast-hour-heading">
                        <strong>{hora.horaLocal}</strong>
                        <span>{hora.diaLocal}</span>
                      </div>
                      {hora.hora === mejorHoraPronostico?.hora && <span className="forecast-best-badge">MEJOR NOCHE</span>}
                      <IconoPronostico hora={hora} />
                      <strong className="forecast-temperature">{hora.temperatura}°</strong>
                      <span className="forecast-clouds">Nubosidad {hora.nubosidad} %</span>
                      <div className="forecast-meter" role="meter" aria-label="Nubosidad" aria-valuemin="0" aria-valuemax="100" aria-valuenow={hora.nubosidad}>
                        <span style={{ "--forecast-value": `${hora.nubosidad}%` }} />
                      </div>
                      <div className="forecast-rain">
                        <Droplets size={14} aria-hidden="true" />
                        <span>Prob. lluvia</span>
                        <span>{hora.probabilidad}%</span>
                        <span className="forecast-rain-amount">{hora.precipitacion} mm</span>
                      </div>
                      <span className="forecast-wind"><Wind size={14} aria-hidden="true" /> {hora.viento} km/h</span>
                      <span className="forecast-moisture"><Droplets size={14} aria-hidden="true" /> HR {hora.humedad}% · Rocío {hora.puntoRocio}°</span>
                    </div>
                  ))}
                </div>
                <span className="forecast-scroll-hint">Deslizá o usa las flechas del teclado para recorrer las 24 horas</span>
              </div>
            </>
          ) : <p className="weather-message" role="status">Cargando datos...</p>}
        <FaseLunar zona={ubicacion.zona || clima?.zona} latitud={ubicacion.latitud} />
        {clima && !error && <p className="weather-time">{cargando ? "Actualizando medición…" : `Datos en ${ubicacion.nombre}: ${clima.time} (${clima.zona})`}</p>}
      </div>
    </section>
  );
}
