import React, { useEffect, useState } from "react";
import { Download, Share2, X } from "lucide-react";
import { useModoNocturno } from "../ModoNocturno.jsx";
import FloatingButton from "./FloatingButton.jsx";
import { generarPostal } from "../utils/postal.js";

export default function PostalCosmica({ observacion, onCerrar }) {
  const { modoNocturno } = useModoNocturno();
  const [imagen, setImagen] = useState(null);
  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    let cancelado = false;
    let url = null;
    setImagen(null);
    setError(false);
    setMensaje("");
    generarPostal(observacion, { nocturno: modoNocturno, latitud: observacion.latitud })
      .then((blob) => {
        if (cancelado) return;
        url = URL.createObjectURL(blob);
        setImagen({ url, blob });
      })
      .catch(() => !cancelado && setError(true));
    return () => {
      cancelado = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [observacion, modoNocturno]);

  const nombreArchivo = `postal-cosmica-${observacion.fecha}-${observacion.hora.replace(":", "")}.png`;

  async function compartir() {
    const archivo = new File([imagen.blob], nombreArchivo, { type: "image/png" });
    try {
      await navigator.share({ files: [archivo], title: "Mi postal cósmica", text: `Observación del ${observacion.fecha}` });
    } catch (e) {
      if (e?.name !== "AbortError") setMensaje("No se pudo compartir. Descargá la imagen y compartila manualmente.");
    }
  }

  const puedeCompartir = imagen && typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [new File([imagen.blob], nombreArchivo, { type: "image/png" })] });

  return (
    <div className="postal-cosmica" role="region" aria-label="Postal cósmica de tu observación">
      <div className="postal-head">
        <strong>Tu postal cósmica</strong>
        <button type="button" className="postal-cerrar" onClick={onCerrar} aria-label="Cerrar postal">
          <X size={16} aria-hidden="true" />
        </button>
      </div>
      {error && <p className="autofill-error" role="alert">No se pudo generar la postal.</p>}
      {!imagen && !error && <p className="helper-text" role="status">Generando postal…</p>}
      {imagen && (
        <>
          <img className="postal-img" src={imagen.url} alt={`Postal cósmica del ${observacion.fecha}: fase lunar, lugar, clima y telescopio usado`} decoding="async" />
          <div className="postal-acciones">
            <FloatingButton as="a" variant="primary" icon={<Download size={16} />} href={imagen.url} download={nombreArchivo}>Descargar imagen</FloatingButton>
            {puedeCompartir && (
              <FloatingButton variant="secondary" icon={<Share2 size={16} />} onClick={compartir}>Compartir</FloatingButton>
            )}
          </div>
          {mensaje && <p className="helper-text" role="status">{mensaje}</p>}
        </>
      )}
    </div>
  );
}
