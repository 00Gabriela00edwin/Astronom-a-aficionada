const CAMPOS = ["id", "hora", "fecha", "clima", "camara", "telescopio", "ocular", "datosFoto"];

function estable(valor) {
  if (Array.isArray(valor)) return valor.map(estable);
  if (valor && typeof valor === "object") {
    return Object.fromEntries(Object.keys(valor).sort().map((clave) => [clave, estable(valor[clave])]));
  }
  return valor;
}

function contenido(observacion) {
  const { id, ...datos } = observacion;
  return JSON.stringify(estable(datos));
}

function validar(observacion) {
  if (!observacion || typeof observacion !== "object" || Array.isArray(observacion) ||
      CAMPOS.some((campo) => typeof observacion[campo] !== "string") ||
      !observacion.id || !/^\d{4}-\d{2}-\d{2}$/.test(observacion.fecha) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(observacion.hora) ||
      !Number.isFinite(Date.parse(`${observacion.fecha}T00:00:00Z`)) ||
      new Date(`${observacion.fecha}T00:00:00Z`).toISOString().slice(0, 10) !== observacion.fecha) {
    throw new Error("El respaldo contiene una observación inválida.");
  }
}

export function combinarRespaldo(actuales, respaldo) {
  const importadas = Array.isArray(respaldo) ? respaldo
    : respaldo?.version === 1 && Array.isArray(respaldo.observaciones) ? respaldo.observaciones : null;
  if (!importadas) throw new Error("El archivo no es un respaldo de observaciones compatible.");

  const combinadas = [...actuales];
  const porId = new Map();
  const porFechaHora = new Map();
  for (const observacion of actuales) {
    validar(observacion);
    porId.set(observacion.id, observacion);
    porFechaHora.set(`${observacion.fecha}T${observacion.hora}`, observacion);
  }
  let omitidas = 0;
  for (const observacion of importadas) {
    validar(observacion);
    const mismaId = porId.get(observacion.id);
    const mismaFechaHora = porFechaHora.get(`${observacion.fecha}T${observacion.hora}`);
    const coincidencia = mismaId || mismaFechaHora;
    if (coincidencia) {
      if (contenido(coincidencia) !== contenido(observacion) ||
          (mismaId && mismaFechaHora && mismaId !== mismaFechaHora)) {
        throw new Error(`Conflicto en la observación del ${observacion.fecha} a las ${observacion.hora}. No se importó ningún registro.`);
      }
      omitidas += 1;
      continue;
    }
    combinadas.push(observacion);
    porId.set(observacion.id, observacion);
    porFechaHora.set(`${observacion.fecha}T${observacion.hora}`, observacion);
  }
  return { observaciones: combinadas, agregadas: combinadas.length - actuales.length, omitidas };
}
