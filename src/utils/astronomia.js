const LUNA_NUEVA_REFERENCIA = Date.UTC(2000, 0, 6, 18, 14);
const CICLO_LUNAR_MS = 29.530588853 * 24 * 60 * 60 * 1000;
const FASES = [
  "Luna nueva",
  "Creciente",
  "Cuarto creciente",
  "Gibosa creciente",
  "Luna llena",
  "Gibosa menguante",
  "Cuarto menguante",
  "Menguante",
];

export function calcularFaseLunar(fecha) {
  if (!(fecha instanceof Date) || !Number.isFinite(fecha.getTime())) {
    throw new TypeError("Se necesita una fecha válida para calcular la fase lunar.");
  }
  const ciclos = (fecha.getTime() - LUNA_NUEVA_REFERENCIA) / CICLO_LUNAR_MS;
  const progreso = ((ciclos % 1) + 1) % 1;
  const coseno = Math.cos(progreso * 2 * Math.PI);
  return {
    nombre: FASES[Math.round(progreso * 8) % 8],
    iluminacion: Math.round((1 - coseno) * 50),
    progreso,
    coseno,
  };
}

export function evaluarViento(velocidad) {
  if (!Number.isFinite(velocidad) || velocidad < 0) {
    throw new TypeError("Se necesita una velocidad de viento válida.");
  }

  if (velocidad <= 15) return "Óptimo";
  if (velocidad <= 30) return "Moderado";
  return "Poco favorable";
}

export function evaluarCielo(viento, nubosidad, precipitacion) {
  const vientoEvaluado = evaluarViento(viento);
  if (!Number.isFinite(nubosidad) || nubosidad < 0 || nubosidad > 100 ||
      !Number.isFinite(precipitacion) || precipitacion < 0) {
    throw new TypeError("Se necesita nubosidad y precipitación válidas.");
  }
  if (precipitacion > 0 || nubosidad > 60 || vientoEvaluado === "Poco favorable") return "Poco favorable";
  if (nubosidad > 25 || vientoEvaluado === "Moderado") return "Moderado";
  return "Óptimo";
}
