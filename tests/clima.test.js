import test from "node:test";
import assert from "node:assert/strict";
import { procesarClima, seleccionarMejorHora } from "../src/utils/clima.js";

test("selecciona la hora con mejores condiciones combinadas y conserva el primer empate", () => {
  const pronostico = [
    { hora: 1, nubosidad: 8, probabilidad: 80, viento: 4 },
    { hora: 2, nubosidad: 15, probabilidad: 0, viento: 10 },
    { hora: 3, nubosidad: 35, probabilidad: 0, viento: 5 },
  ];
  assert.equal(seleccionarMejorHora(pronostico), pronostico[1]);
  assert.equal(seleccionarMejorHora([pronostico[1], { ...pronostico[1] }]), pronostico[1]);
  assert.equal(seleccionarMejorHora([]), null);
  assert.throws(() => seleccionarMejorHora(null), TypeError);
});

test("muestra las 24 horas futuras sin perder la hora repetida del cambio horario", () => {
  const inicio = Date.parse("2026-11-01T05:00:00Z") / 1000;
  const data = {
    timezone: "America/New_York",
    current: { time: inicio + 45 * 60, temperature_2m: 15, relative_humidity_2m: 50, dew_point_2m: 5, wind_speed_10m: 8, wind_direction_10m: 20, cloud_cover: 30, precipitation: 0 },
    hourly: {
      time: Array.from({ length: 25 }, (_, i) => inicio + i * 3600),
      temperature_2m: Array(25).fill(14),
      relative_humidity_2m: Array(25).fill(60),
      dew_point_2m: Array(25).fill(6),
      cloud_cover: Array(25).fill(30),
      precipitation_probability: Array(25).fill(10),
      precipitation: Array(25).fill(0),
      wind_speed_10m: Array(25).fill(8),
    },
  };
  const clima = procesarClima(data, { latitud: 40.7, longitud: -74 });
  assert.equal(clima.pronostico.length, 24);
  assert.equal(clima.time, "01/11/2026 01:45 UTC-04:00");
  assert.equal(clima.humedad, 50);
  assert.equal(clima.puntoRocio, 5);
  assert.equal(clima.pronostico[0].temperatura, 14);
  assert.equal(clima.pronostico[0].humedad, 60);
  assert.equal(clima.pronostico[0].puntoRocio, 6);
  assert.equal(clima.pronostico[0].horaLocal, "01:00");
  assert.equal(clima.pronostico[0].diaLocal, "dom 1 nov");
  assert.equal(clima.pronostico[0].etiqueta, "01/11 01:00 UTC-05:00");
  assert.equal(clima.pronostico[23].etiqueta, "02/11 00:00 UTC-05:00");
  assert.throws(() => procesarClima({ ...data, timezone: "zona-inválida" }, {}), /válidos/);
  assert.throws(() => procesarClima({ ...data, hourly: { ...data.hourly, temperature_2m: [] } }, {}), /pronóstico válido/);
  assert.throws(() => procesarClima({ ...data, hourly: { ...data.hourly, precipitation: [] } }, {}), /pronóstico válido/);
  assert.throws(() => procesarClima({ ...data, hourly: { ...data.hourly, relative_humidity_2m: [] } }, {}), /pronóstico válido/);
});
