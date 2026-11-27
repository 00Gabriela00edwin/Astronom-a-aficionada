import test from "node:test";
import assert from "node:assert/strict";
import { calcularSalidasPuestas, filtrarHorasNocturnas } from "../src/utils/efemerides.js";

test("filtra horas fuera de la noche astronómica", () => {
  const pronostico = [
    { hora: Date.parse("2024-03-20T01:00:00Z") / 1000 },
    { hora: Date.parse("2024-03-20T12:00:00Z") / 1000 },
    { hora: Date.parse("2024-03-20T23:00:00Z") / 1000 },
  ];
  assert.deepEqual(
    filtrarHorasNocturnas(pronostico, 0, 0).map(({ hora }) => hora),
    [pronostico[0].hora, pronostico[2].hora],
  );
  const solsticioPolar = [
    { hora: Date.parse("2024-06-21T00:00:00Z") / 1000 },
    { hora: Date.parse("2024-06-21T12:00:00Z") / 1000 },
  ];
  assert.deepEqual(filtrarHorasNocturnas(solsticioPolar, 78.22, 15.65), []);
  assert.deepEqual(filtrarHorasNocturnas([], 0, 0), []);
  assert.throws(() => filtrarHorasNocturnas(pronostico, 91, 0), TypeError);
});

test("calcula salidas y puestas en la zona local e informa ausencia de eventos", () => {
  const greenwich = calcularSalidasPuestas("2024-03-20", "Europe/London", 51.48, 0);
  const sol = greenwich.find((astro) => astro.nombre === "Sol");
  assert.ok(sol.salida >= "05:50" && sol.salida <= "06:15");
  assert.ok(sol.puesta >= "18:00" && sol.puesta <= "18:30");
  assert.ok(greenwich.find((astro) => astro.nombre === "Júpiter").salida);
  const polar = calcularSalidasPuestas("2024-06-21", "Europe/Oslo", 78.22, 15.65);
  assert.equal(polar.find((astro) => astro.nombre === "Sol").salida, null);
  assert.equal(polar.find((astro) => astro.nombre === "Sol").puesta, null);
});

test("incluye eventos de la última hora de un día de 25 horas", () => {
  const astros = calcularSalidasPuestas("2026-11-01", "America/New_York", 40.7128, -74.006);
  assert.equal(astros.find((astro) => astro.nombre === "Luna").salida, "23:13");
  assert.throws(() => calcularSalidasPuestas("2026-02-31", "UTC", 0, 0), TypeError);
  assert.throws(() => calcularSalidasPuestas("2026-01-01", "zona-inválida", 0, 0), TypeError);
  assert.throws(() => calcularSalidasPuestas("2011-12-30", "Pacific/Apia", -13.8, -171.8), TypeError);
});

test("no incluye eventos del día siguiente cuando el horario cambia a medianoche", () => {
  const astros = calcularSalidasPuestas("2021-09-05", "America/Santiago", -33.45, -70.67);
  assert.equal(astros.find((astro) => astro.nombre === "Urano").salida, null);
});
