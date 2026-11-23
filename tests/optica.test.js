import test from "node:test";
import assert from "node:assert/strict";
import { calcularAumentos } from "../src/utils/optica.js";

test("calcula aumentos y pupila de salida para los extremos del ocular", () => {
  const equipo = { distanciaFocalMm: 900, aperturaMm: 70 };
  assert.deepEqual(calcularAumentos(equipo, 4), {
    aumentos: 225, maximoUtil: 140, pupilaSalida: "0.3 mm", superaMaximo: true,
  });
  assert.deepEqual(calcularAumentos(equipo, 40), {
    aumentos: 23, maximoUtil: 140, pupilaSalida: "3.0 mm", superaMaximo: false,
  });
});

test("avisa solo cuando se supera el límite útil", () => {
  assert.equal(calcularAumentos({ distanciaFocalMm: 600, aperturaMm: 75 }, 4).superaMaximo, false);
  assert.equal(calcularAumentos({ distanciaFocalMm: 2000, aperturaMm: 203 }, 4).superaMaximo, true);
});

test("rechaza datos ópticos inválidos y oculares fuera del rango", () => {
  assert.throws(() => calcularAumentos({ distanciaFocalMm: 900, aperturaMm: 0 }, 10), TypeError);
  assert.throws(() => calcularAumentos({ distanciaFocalMm: 900, aperturaMm: 70 }, 3), TypeError);
  assert.throws(() => calcularAumentos({ distanciaFocalMm: 900, aperturaMm: 70 }, 41), TypeError);
});
