export function calcularAumentos(telescopio, ocularMm) {
  if (!Number.isFinite(telescopio?.distanciaFocalMm) || telescopio.distanciaFocalMm <= 0 ||
      !Number.isFinite(telescopio.aperturaMm) || telescopio.aperturaMm <= 0 ||
      !Number.isFinite(ocularMm) || ocularMm < 4 || ocularMm > 40) {
    throw new TypeError("Se necesitan datos ópticos válidos y un ocular de 4 a 40 mm.");
  }

  const aumentos = Math.round(telescopio.distanciaFocalMm / ocularMm);
  if (aumentos < 1) throw new RangeError("Los aumentos calculados deben ser mayores que cero.");
  const maximoUtil = telescopio.aperturaMm * 2;
  return {
    aumentos,
    maximoUtil,
    pupilaSalida: `${(telescopio.aperturaMm / aumentos).toFixed(1)} mm`,
    superaMaximo: aumentos > maximoUtil,
  };
}
