import React, { useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
import { calcularSalidasPuestas } from "../utils/efemerides.js";

export default function Planificador({ ubicacion, zona }) {
  const [fecha, setFecha] = useState(() => DateTime.now().setZone(zona).toISODate());

  useEffect(() => {
    setFecha(DateTime.now().setZone(zona).toISODate());
  }, [zona]);

  const resultado = useMemo(() => {
    if (!fecha) return { filas: [], error: "" };
    try {
      return { filas: calcularSalidasPuestas(fecha, zona, ubicacion.latitud, ubicacion.longitud), error: "" };
    } catch (error) {
      console.error("No se pudieron calcular las efemérides:", error);
      return { filas: [], error: "No se pudieron calcular las efemérides para esta fecha y ubicación." };
    }
  }, [fecha, zona, ubicacion.latitud, ubicacion.longitud]);

  return (
    <div className="planner-content">
      <label htmlFor="fechaPlanificador">Fecha en {ubicacion.nombre}</label>
      <input id="fechaPlanificador" type="date" value={fecha || ""} onChange={(event) => setFecha(event.target.value)} />
      {resultado.error ? <p className="helper-text" role="alert">{resultado.error}</p> : (
        <div className="planner-table-wrap">
          <table className="planner-table">
            <thead><tr><th>Astro</th><th>Salida</th><th>Puesta</th></tr></thead>
            <tbody>{resultado.filas.map((fila) => (
              <tr key={fila.nombre}><th scope="row">{fila.nombre}</th><td>{fila.salida ?? "Sin evento"}</td><td>{fila.puesta ?? "Sin evento"}</td></tr>
            ))}</tbody>
          </table>
        </div>
      )}
      <p className="helper-text">Hora local: {zona}. «Sin evento» indica que no hay salida o puesta en esa fecha. Cálculo aproximado a nivel del mar y con horizonte despejado; no garantiza que el objeto sea visible.</p>
    </div>
  );
}
