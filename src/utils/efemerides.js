import { Body, Observer, SearchRiseSet } from "astronomy-engine";
import { DateTime } from "luxon";

const ASTROS = [
  ["Sol", Body.Sun],
  ["Luna", Body.Moon],
  ["Mercurio", Body.Mercury],
  ["Venus", Body.Venus],
  ["Marte", Body.Mars],
  ["Júpiter", Body.Jupiter],
  ["Saturno", Body.Saturn],
  ["Urano", Body.Uranus],
  ["Neptuno", Body.Neptune],
];

export function calcularSalidasPuestas(fecha, zona, latitud, longitud) {
  if (!Number.isFinite(latitud) || latitud < -90 || latitud > 90 ||
      !Number.isFinite(longitud) || longitud < -180 || longitud > 180 ||
      typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new TypeError("Fecha o coordenadas inválidas.");
  }
  const inicio = DateTime.fromISO(fecha, { zone: zona }).startOf("day");
  if (!inicio.isValid || inicio.toISODate() !== fecha) throw new TypeError("Fecha o zona horaria inválida.");
  const fin = inicio.plus({ days: 1 }).startOf("day");
  const observador = new Observer(latitud, longitud, 0);
  const limite = (fin.toMillis() - inicio.toMillis()) / 86400000;

  function evento(astro, direccion) {
    const resultado = SearchRiseSet(astro, observador, direccion, inicio.toJSDate(), limite);
    if (!resultado) return null;
    const instante = DateTime.fromJSDate(resultado.date, { zone: zona });
    return instante >= inicio && instante < fin ? instante.toFormat("HH:mm") : null;
  }

  return ASTROS.map(([nombre, astro]) => ({
    nombre,
    salida: evento(astro, 1),
    puesta: evento(astro, -1),
  }));
}
