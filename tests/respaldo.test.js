import test from "node:test";
import assert from "node:assert/strict";
import { combinarRespaldo } from "../src/utils/respaldo.js";

const original = { id: "1", fecha: "2026-01-02", hora: "22:30", clima: "Claro", camara: "Canon", telescopio: "Meade LX90", ocular: "10 mm", datosFoto: "ISO 100" };
const nueva = { ...original, id: "2", fecha: "2026-01-03" };

test("combina respaldos sin duplicar registros y conserva equipos antiguos", () => {
  const actuales = [original];
  const resultado = combinarRespaldo(actuales, { version: 1, observaciones: [original, nueva, { ...nueva, id: "otro" }] });
  assert.deepEqual(resultado, { observaciones: [original, nueva], agregadas: 1, omitidas: 2 });
  assert.deepEqual(actuales, [original]);
  assert.equal(resultado.observaciones[0].telescopio, "Meade LX90");
});

test("rechaza conflictos o archivos inválidos sin modificar los registros", () => {
  const actuales = [original];
  assert.throws(() => combinarRespaldo(actuales, { version: 1, observaciones: [nueva, { ...original, clima: "Nublado" }] }), /Conflicto/);
  assert.throws(() => combinarRespaldo(actuales, { version: 2, observaciones: [] }), /compatible/);
  assert.throws(() => combinarRespaldo(actuales, [{ ...nueva, fecha: "2026-02-31" }]), /inválida/);
  assert.throws(() => combinarRespaldo(actuales, [{ ...nueva, hora: "25:00" }]), /inválida/);
  assert.deepEqual(actuales, [original]);
});
