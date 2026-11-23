import { useCallback, useEffect, useRef, useState } from "react";

const URL_CLIMA = "https://api.open-meteo.com/v1/forecast?latitude=-34.6&longitude=-58.4&current_weather=true&hourly=cloudcover&timezone=auto";

export default function useClima() {
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
      const response = await fetch(URL_CLIMA, { signal: solicitud.signal });
      if (!response.ok) throw new Error("No se pudo obtener el clima");
      const data = await response.json();
      const actual = data.current_weather;
      if (!actual || !Number.isFinite(actual.temperature) ||
          !Number.isFinite(actual.windspeed) || actual.windspeed < 0 ||
          !Number.isFinite(actual.winddirection) || typeof actual.time !== "string") {
        throw new Error("La respuesta no contiene datos válidos del clima actual");
      }
      if (solicitud.signal.aborted) return null;
      setClima(actual);
      return actual;
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
  }, []);

  useEffect(() => {
    actualizarClima();
    return () => controlador.current?.abort();
  }, [actualizarClima]);

  return { clima, cargando, error, actualizarClima };
}
