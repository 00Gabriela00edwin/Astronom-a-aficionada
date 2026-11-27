import { useCallback, useEffect, useRef, useState } from "react";
import { procesarClima } from "../utils/clima.js";

export default function useClima(ubicacion) {
  const [clima, setClima] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const controlador = useRef(null);

  const actualizarClima = useCallback(async () => {
    controlador.current?.abort();
    const solicitud = new AbortController();
    controlador.current = solicitud;
    setCargando(true);
    setError(false);

    try {
      const params = new URLSearchParams({
        latitude: String(ubicacion.latitud),
        longitude: String(ubicacion.longitud),
        current: "temperature_2m,relative_humidity_2m,dew_point_2m,wind_speed_10m,wind_direction_10m,cloud_cover,precipitation",
        hourly: "temperature_2m,relative_humidity_2m,dew_point_2m,cloud_cover,precipitation_probability,precipitation,wind_speed_10m",
        wind_speed_unit: "kmh",
        forecast_days: "3",
        timezone: "auto",
        timeformat: "unixtime",
      });
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: solicitud.signal });
      if (!response.ok) throw new Error("No se pudo obtener el clima");
      const climaActual = procesarClima(await response.json(), ubicacion);
      if (solicitud.signal.aborted) return null;
      setClima(climaActual);
      return climaActual;
    } catch (error) {
      if (solicitud.signal.aborted) return null;
      console.error(error);
      setClima(null);
      setError(true);
      return null;
    } finally {
      if (!solicitud.signal.aborted) {
        setCargando(false);
        controlador.current = null;
      }
    }
  }, [ubicacion.latitud, ubicacion.longitud]);

  useEffect(() => {
    setClima(null);
    actualizarClima();
    return () => controlador.current?.abort();
  }, [actualizarClima]);

  return { clima, cargando, error, actualizarClima };
}
