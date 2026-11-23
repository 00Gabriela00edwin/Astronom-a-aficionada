import React, { useEffect, useRef, useState } from "react";
import { LocateFixed, MapPin, Search } from "lucide-react";
import { DateTime } from "luxon";
import SectionHeading from "./SectionHeading.jsx";

export default function Ubicacion({ ubicacion, onCambiar }) {
  const [ciudad, setCiudad] = useState("");
  const [resultados, setResultados] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [buscando, setBuscando] = useState(false);
  const solicitud = useRef(null);
  const secuencia = useRef(0);

  useEffect(() => () => {
    secuencia.current += 1;
    solicitud.current?.abort();
  }, []);

  async function buscar(event) {
    event.preventDefault();
    const consulta = ciudad.trim();
    solicitud.current?.abort();
    const actual = ++secuencia.current;
    setBuscando(false);
    setResultados([]);
    if (consulta.length < 2) {
      setMensaje("Escribe al menos dos caracteres.");
      return;
    }
    const controller = new AbortController();
    solicitud.current = controller;
    setBuscando(true);
    setMensaje("");
    try {
      const params = new URLSearchParams({ name: consulta, count: "8", language: "es", format: "json" });
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, { signal: controller.signal });
      if (!response.ok) throw new Error("No se pudo buscar la ciudad.");
      const data = await response.json();
      if (data.results !== undefined && !Array.isArray(data.results)) throw new Error("Respuesta de búsqueda inválida.");
      const lugares = (data.results ?? []).filter((lugar) =>
        typeof lugar.name === "string" && Number.isFinite(lugar.latitude) && Math.abs(lugar.latitude) <= 90 &&
        Number.isFinite(lugar.longitude) && Math.abs(lugar.longitude) <= 180 &&
        typeof lugar.timezone === "string" && DateTime.now().setZone(lugar.timezone).isValid
      );
      if (actual !== secuencia.current) return;
      setResultados(lugares);
      if (!lugares.length) setMensaje("No se encontraron ciudades. Prueba otro nombre.");
    } catch (error) {
      if (controller.signal.aborted || actual !== secuencia.current) return;
      console.error("Error al buscar la ciudad:", error);
      setMensaje("No se pudo buscar la ciudad. Comprueba tu conexión e inténtalo de nuevo.");
    } finally {
      if (actual === secuencia.current) setBuscando(false);
    }
  }

  function elegir(lugar) {
    secuencia.current += 1;
    solicitud.current?.abort();
    setBuscando(false);
    setResultados([]);
    setMensaje("");
    onCambiar({
      nombre: [lugar.name, lugar.admin1, lugar.country].filter(Boolean).join(", "),
      latitud: lugar.latitude,
      longitud: lugar.longitude,
      zona: lugar.timezone,
    });
  }

  function usarUbicacion() {
    solicitud.current?.abort();
    const actual = ++secuencia.current;
    setBuscando(false);
    setResultados([]);
    if (!navigator.geolocation) {
      setMensaje("Este navegador no permite obtener la ubicación.");
      return;
    }
    setMensaje("Solicitando ubicación al navegador…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (actual !== secuencia.current) return;
        setMensaje("");
        onCambiar({ nombre: "Mi ubicación", latitud: coords.latitude, longitud: coords.longitude, zona: null });
      },
      (error) => {
        if (actual !== secuencia.current) return;
        console.error("No se pudo obtener la ubicación:", error);
        setMensaje("No se pudo obtener la ubicación. Comprueba los permisos o busca una ciudad.");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  return (
    <section id="ubicacion" className="glass-card bg-white/5 backdrop-blur-md border border-white/10">
      <SectionHeading icon={MapPin} eyebrow="TU LUGAR DE OBSERVACIÓN">Ubicación</SectionHeading>
      <p className="helper-text">Actual: <strong>{ubicacion.nombre}</strong>. Se usa para el clima y el planificador.</p>
      <form className="location-form" onSubmit={buscar}>
        <div>
          <label htmlFor="ciudad">Buscar ciudad</label>
          <input id="ciudad" value={ciudad} onChange={(event) => setCiudad(event.target.value)} placeholder="Ej. Córdoba" />
        </div>
        <button type="submit" disabled={buscando}><Search size={16} aria-hidden="true" /> {buscando ? "Buscando…" : "Buscar"}</button>
        <button type="button" className="secondary-button" onClick={usarUbicacion}><LocateFixed size={16} aria-hidden="true" /> Usar mi ubicación</button>
      </form>
      <p className="helper-text">Buscar envía la ciudad a Open-Meteo. Al usar tu ubicación, el navegador pedirá permiso y las coordenadas se enviarán a Open-Meteo para consultar el clima.</p>
      {mensaje && <p className="helper-text" role="status">{mensaje}</p>}
      {resultados.length > 0 && (
        <ul className="location-results" aria-label="Ciudades encontradas">
          {resultados.map((lugar) => (
            <li key={lugar.id}>
              <button type="button" onClick={() => elegir(lugar)}>
                {[lugar.name, lugar.admin1, lugar.country].filter(Boolean).join(", ")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
