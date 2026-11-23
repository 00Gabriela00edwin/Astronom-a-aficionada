import test from "node:test";
import assert from "node:assert/strict";
import { procesarClima } from "../src/utils/clima.js";

test("muestra las seis horas futuras sin perder la hora repetida del cambio horario", () => {
  const inicio = Date.parse("2026-11-01T05:00:00Z") / 1000;
  const data = {
    timezone: "America/New_York",
    current: { time: inicio + 45 * 60, temperature_2m: 15, wind_speed_10m: 8, wind_direction_10m: 20, cloud_cover: 30, precipitation: 0 },
    hourly: {
      time: Array.from({ length: 7 }, (_, i) => inicio + i * 3600),
      cloud_cover: Array(7).fill(30),
      precipitation_probability: Array(7).fill(10),
      precipitation: Array(7).fill(0),
      wind_speed_10m: Array(7).fill(8),
    },
  };
  const clima = procesarClima(data, { latitud: 40.7, longitud: -74 });
  assert.equal(clima.pronostico.length, 6);
  assert.equal(clima.time, "01/11/2026 01:45 UTC-04:00");
  assert.equal(clima.pronostico[0].etiqueta, "01/11 01:00 UTC-05:00");
  assert.equal(clima.pronostico[5].etiqueta, "01/11 06:00 UTC-05:00");
  assert.throws(() => procesarClima({ ...data, timezone: "zona-inválida" }, {}), /válidos/);
  assert.throws(() => procesarClima({ ...data, hourly: { ...data.hourly, precipitation: [] } }, {}), /pronóstico válido/);
});
