import React, { createContext, useContext, useState } from "react";

const ModoNocturnoContext = createContext(null);
const CLAVE_MODO = "modoVisionNocturna";

function cargarModo() {
  try {
    const guardado = localStorage.getItem(CLAVE_MODO);
    if (guardado !== null && guardado !== "true" && guardado !== "false") {
      throw new Error("Preferencia de visión nocturna inválida.");
    }
    return { activo: guardado === "true", error: false };
  } catch (error) {
    console.error("No se pudo leer el modo nocturno:", error);
    return { activo: false, error: true };
  }
}

export function ModoNocturnoProvider({ children }) {
  const [estado, setEstado] = useState(cargarModo);

  function alternarModo() {
    const activo = !estado.activo;
    try {
      localStorage.setItem(CLAVE_MODO, String(activo));
      setEstado({ activo, error: false });
    } catch (error) {
      console.error("No se pudo guardar el modo nocturno:", error);
      setEstado({ activo, error: true });
    }
  }

  return (
    <ModoNocturnoContext.Provider value={{ modoNocturno: estado.activo, alternarModo }}>
      <div className={estado.activo ? "app night-mode" : "app"}>
        {estado.error && <p className="storage-warning" role="alert">No se pudo guardar o leer la preferencia de visión nocturna en este navegador.</p>}
        {children}
      </div>
    </ModoNocturnoContext.Provider>
  );
}

export function useModoNocturno() {
  return useContext(ModoNocturnoContext);
}
