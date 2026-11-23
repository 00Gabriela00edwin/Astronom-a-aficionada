import { DateTime } from "luxon";

export function procesarClima(data, ubicacion) {
  const actual = data?.current;
  const horas = data?.hourly;
  if (!actual || !Number.isFinite(actual.temperature_2m) ||
      !Number.isFinite(actual.wind_speed_10m) || actual.wind_speed_10m < 0 ||
      !Number.isFinite(actual.wind_direction_10m) ||
      !Number.isFinite(actual.cloud_cover) || actual.cloud_cover < 0 || actual.cloud_cover > 100 ||
      !Number.isFinite(actual.precipitation) || actual.precipitation < 0 ||
      !Number.isFinite(actual.time) || typeof data.timezone !== "string" ||
      !DateTime.fromSeconds(actual.time, { zone: data.timezone }).isValid ||
      !horas || !Array.isArray(horas.time) || !Array.isArray(horas.cloud_cover) ||
      !Array.isArray(horas.precipitation_probability) || !Array.isArray(horas.precipitation) ||
      !Array.isArray(horas.wind_speed_10m)) {
    throw new Error("La respuesta no contiene datos válidos del clima actual.");
  }
  const pronostico = horas.time.map((hora, i) => ({
    hora,
    nubosidad: horas.cloud_cover[i],
    probabilidad: horas.precipitation_probability[i],
    precipitacion: horas.precipitation[i],
    viento: horas.wind_speed_10m[i],
  })).filter((hora) => Number.isFinite(hora.hora) && hora.hora > actual.time).slice(0, 6);
  if (pronostico.length !== 6 || pronostico.some((hora) =>
    !DateTime.fromSeconds(hora.hora, { zone: data.timezone }).isValid ||
    !Number.isFinite(hora.nubosidad) || hora.nubosidad < 0 || hora.nubosidad > 100 ||
    !Number.isFinite(hora.probabilidad) || hora.probabilidad < 0 || hora.probabilidad > 100 ||
    !Number.isFinite(hora.precipitacion) || hora.precipitacion < 0 ||
    !Number.isFinite(hora.viento) || hora.viento < 0
  )) throw new Error("La respuesta no contiene un pronóstico válido.");
  return {
    latitud: ubicacion.latitud,
    longitud: ubicacion.longitud,
    temperature: actual.temperature_2m,
    windspeed: actual.wind_speed_10m,
    winddirection: actual.wind_direction_10m,
    nubosidad: actual.cloud_cover,
    precipitacion: actual.precipitation,
    time: DateTime.fromSeconds(actual.time, { zone: data.timezone }).toFormat("dd/LL/yyyy HH:mm 'UTC'ZZ"),
    zona: data.timezone,
    pronostico: pronostico.map((hora) => ({
      ...hora,
      etiqueta: DateTime.fromSeconds(hora.hora, { zone: data.timezone }).toFormat("dd/LL HH:mm 'UTC'ZZ"),
    })),
  };
}
