import test from "node:test";
import assert from "node:assert/strict";
import { calcularFaseLunar, evaluarCielo, evaluarViento } from "../src/utils/astronomia.js";

test("calcula las fases principales con fechas conocidas", () => {
  const casos = [
    ["2024-04-08T18:21:00Z", "Luna nueva", 0],
    ["2024-04-15T19:13:00Z", "Cuarto creciente", 50],
    ["2024-04-23T23:49:00Z", "Luna llena", 100],
    ["2024-05-01T11:27:00Z", "Cuarto menguante", 50],
  ];
  for (const [fecha, nombre, iluminacion] of casos) {
    const fase = calcularFaseLunar(new Date(fecha));
    assert.equal(fase.nombre, nombre);
    assert.ok(Math.abs(fase.iluminacion - iluminacion) <= 10);
  }
});

test("normaliza fechas anteriores a la referencia y rechaza fechas inválidas", () => {
  const fase = calcularFaseLunar(new Date("1999-12-31T12:00:00Z"));
  assert.ok(fase.progreso >= 0 && fase.progreso < 1);
  assert.throws(() => calcularFaseLunar(new Date("inválida")), TypeError);
});

test("clasifica el viento en los límites definidos", () => {
  assert.equal(evaluarViento(0), "Óptimo");
  assert.equal(evaluarViento(15), "Óptimo");
  assert.equal(evaluarViento(15.1), "Moderado");
  assert.equal(evaluarViento(30), "Moderado");
  assert.equal(evaluarViento(30.1), "Poco favorable");
  assert.throws(() => evaluarViento(-1), TypeError);
  assert.throws(() => evaluarViento(NaN), TypeError);
});

test("evalúa el cielo considerando nubosidad, precipitación y viento", () => {
  assert.equal(evaluarCielo(15, 25, 0), "Óptimo");
  assert.equal(evaluarCielo(15, 26, 0), "Moderado");
  assert.equal(evaluarCielo(15, 60, 0), "Moderado");
  assert.equal(evaluarCielo(15, 61, 0), "Poco favorable");
  assert.equal(evaluarCielo(0, 0, 0.1), "Poco favorable");
  assert.equal(evaluarCielo(31, 0, 0), "Poco favorable");
  assert.throws(() => evaluarCielo(0, 101, 0), TypeError);
  assert.throws(() => evaluarCielo(0, 0, -1), TypeError);
});
