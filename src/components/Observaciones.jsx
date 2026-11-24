import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DateTime } from "luxon";
import { BookOpen, ClipboardList, CloudSun, Download, Image, Search, Telescope, Trash2, Upload } from "lucide-react";
import SectionHeading from "./SectionHeading.jsx";
import FloatingButton from "./FloatingButton.jsx";
import PostalCosmica from "./PostalCosmica.jsx";

const formularioVacio = {
  hora: "",
  fecha: "",
  clima: "",
  camara: "",
  telescopio: "",
  ocular: "",
  datosFoto: "",
};

function TarjetaObservacion({ observacion, onEliminar, onPostal, movimientoReducido }) {
  return (
    <motion.article
      className="observacion observation-card"
      layout={!movimientoReducido}
      initial={movimientoReducido ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: movimientoReducido ? 0 : -12 }}
      transition={{ duration: movimientoReducido ? 0 : 0.2 }}
    >
      <p><strong>Fecha:</strong> {observacion.fecha}</p>
      <p><strong>Hora:</strong> {observacion.hora}</p>
      <p><strong>Clima:</strong> {observacion.clima}</p>
      <p><strong>Cámara:</strong> {observacion.camara}</p>
      <p><strong>Telescopio:</strong> {observacion.telescopio}</p>
      <p><strong>Ocular:</strong> {observacion.ocular}</p>
      <p><strong>Datos Foto:</strong> {observacion.datosFoto}</p>
      <button type="button" onClick={() => onPostal(observacion)}>
        <Image size={16} aria-hidden="true" /> Postal
      </button>
      <button type="button" onClick={() => onEliminar(observacion.id)}>
        <Trash2 size={16} aria-hidden="true" /> Eliminar
      </button>
    </motion.article>
  );
}

export function Busqueda({ fechaFiltro, onBuscar, cantidad }) {
  const [fecha, setFecha] = useState("");

  function buscar(event) {
    event.preventDefault();
    onBuscar(fecha);
  }

  function limpiar() {
    setFecha("");
    onBuscar("");
  }

  return (
    <section id="busqueda" className="hud-section">
      <SectionHeading icon={Search} eyebrow="03 // BITÁCORA">Buscar por Fecha</SectionHeading>
      <form id="formBusqueda" onSubmit={buscar}>
        <div>
          <label htmlFor="fechaBusqueda">Selecciona una fecha:</label>
          <input type="date" id="fechaBusqueda" value={fecha} onChange={(event) => setFecha(event.target.value)} required />
        </div>
        <button type="submit">Buscar</button>
        {fechaFiltro && <button type="button" className="secondary-button" onClick={limpiar}>Ver todas</button>}
      </form>
      <div id="resultadoBusqueda" aria-live="polite">
        {fechaFiltro && <p>{cantidad === 0 ? "No se encontraron observaciones para esa fecha." : `${cantidad} ${cantidad === 1 ? "observación encontrada" : "observaciones encontradas"} para ${fechaFiltro}.`}</p>}
      </div>
    </section>
  );
}

export function RegistroObservacion({ telescopios, onRegistrar, actualizarClima, cargandoClima, errorClima, ubicacion }) {
  const [formulario, setFormulario] = useState(formularioVacio);
  const [errorAutocompletar, setErrorAutocompletar] = useState(false);
  const [postal, setPostal] = useState(null);

  function cambiarCampo(event) {
    const { name, value } = event.target;
    setFormulario((anterior) => ({ ...anterior, [name]: value }));
  }

  async function autocompletar() {
    setErrorAutocompletar(false);
    const clima = await actualizarClima();
    if (!clima) {
      setErrorAutocompletar(true);
      return;
    }
    setFormulario((anterior) => ({
      ...anterior,
      hora: DateTime.now().toFormat("HH:mm"),
      clima: `${clima.temperature} °C, viento ${clima.windspeed} km/h`,
    }));
  }

  function registrar(event) {
    event.preventDefault();
    const nueva = onRegistrar(formulario);
    if (nueva) {
      setFormulario(formularioVacio);
      setPostal(nueva);
    }
  }

  return (
    <section id="registro" className="hud-section">
      <SectionHeading icon={BookOpen} eyebrow="03 // BITÁCORA">Registrar Observación</SectionHeading>
      <div className="autofill-panel">
        <div>
          <strong>Una instantánea de tu cielo</strong>
          <p>Hora local del dispositivo y clima actual de {ubicacion.nombre}. Puedes editar ambos campos.</p>
        </div>
        <FloatingButton variant="primary" icon={<CloudSun size={18} />} onClick={autocompletar} disabled={cargandoClima}>
          {cargandoClima ? "Actualizando clima..." : "Autocompletar clima y hora actual"}
        </FloatingButton>
      </div>
      {(errorAutocompletar || errorClima) && (
        <p className="autofill-error" role="alert">No se pudo obtener el clima. Reintenta o completa los campos manualmente.</p>
      )}
      <form id="formObservacion" onSubmit={registrar}>
        <p><label>Hora: <input type="time" id="hora" name="hora" value={formulario.hora} onChange={cambiarCampo} required /></label></p>
        <p><label>Fecha: <input type="date" id="fecha" name="fecha" value={formulario.fecha} onChange={cambiarCampo} required /></label></p>
        <p><label>Clima: <input type="text" id="clima" name="clima" value={formulario.clima} onChange={cambiarCampo} required /></label></p>
        <p><label>Cámara usada: <input type="text" id="camara" name="camara" value={formulario.camara} onChange={cambiarCampo} required /></label></p>
        <label>Telescopio usado:
          <select id="telescopio" name="telescopio" value={formulario.telescopio} onChange={cambiarCampo} required>
            <option value="">Selecciona un telescopio</option>
            {telescopios.map((telescopio) => (
              <option key={telescopio.id} value={telescopio.nombre}>{telescopio.nombre} ({telescopio.tipo})</option>
            ))}
          </select>
        </label>
        <p><label>Ocular usado: <input type="text" id="ocular" name="ocular" value={formulario.ocular} onChange={cambiarCampo} required /></label></p>
        <p><label>Datos fotográficos: <input type="text" id="datosFoto" name="datosFoto" value={formulario.datosFoto} onChange={cambiarCampo} required /></label></p>
        <button type="submit">Registrar</button>
      </form>
      {postal && <PostalCosmica observacion={postal} onCerrar={() => setPostal(null)} />}
    </section>
  );
}

export function ObservacionesRegistradas({ observaciones, todasObservaciones, fechaFiltro, onEliminar, onImportar, errorCarga }) {
  const movimientoReducido = useReducedMotion();
  const [urlRespaldo, setUrlRespaldo] = useState(null);
  const [mensajeRespaldo, setMensajeRespaldo] = useState("");
  const [postal, setPostal] = useState(null);
  const enlace = useRef(null);

  useEffect(() => {
    if (!urlRespaldo) return undefined;
    enlace.current.click();
    return () => URL.revokeObjectURL(urlRespaldo);
  }, [urlRespaldo]);

  function exportar() {
    try {
      const datos = JSON.stringify({ version: 1, observaciones: todasObservaciones }, null, 2);
      setUrlRespaldo(URL.createObjectURL(new Blob([datos], { type: "application/json" })));
      setMensajeRespaldo("Respaldo preparado para descargar.");
    } catch (error) {
      console.error("No se pudo exportar el respaldo:", error);
      setMensajeRespaldo("No se pudo preparar el respaldo.");
    }
  }

  async function importar(event) {
    const archivo = event.target.files?.[0];
    event.target.value = "";
    if (!archivo) return;
    try {
      const resultado = onImportar(JSON.parse(await archivo.text()));
      setMensajeRespaldo(resultado
        ? `${resultado.agregadas} observaciones importadas; ${resultado.omitidas} duplicadas omitidas.`
        : "No se pudo guardar el respaldo importado.");
    } catch (error) {
      console.error("No se pudo importar el respaldo:", error);
      setMensajeRespaldo(error instanceof SyntaxError ? "El archivo no contiene JSON válido." : error.message);
    }
  }

  return (
    <section id="observaciones" className="hud-section">
      <SectionHeading icon={ClipboardList} eyebrow="03 // BITÁCORA">Observaciones Registradas</SectionHeading>
      <div className="backup-actions">
        <FloatingButton variant="secondary" icon={<Download size={16} />} onClick={exportar} disabled={errorCarga}>Exportar respaldo</FloatingButton>
        <FloatingButton as="label" variant="secondary" className="backup-import" icon={<Upload size={16} />}>
          Importar respaldo
          <input type="file" accept="application/json,.json" onChange={importar} disabled={errorCarga} />
        </FloatingButton>
        <a ref={enlace} href={urlRespaldo || undefined} download="observaciones-astronomia.json" hidden>Descargar respaldo</a>
      </div>
      <p className="helper-text">El respaldo incluye todas las observaciones, incluso si hay un filtro activo. Al importar se combinan sin reemplazar registros.</p>
      {mensajeRespaldo && <p className="helper-text" role="status">{mensajeRespaldo}</p>}
      <div id="listaObservaciones">
        {postal && <PostalCosmica observacion={postal} onCerrar={() => setPostal(null)} />}
        <AnimatePresence initial={false}>
          {observaciones.map((observacion) => (
            <TarjetaObservacion key={observacion.id} observacion={observacion} onEliminar={onEliminar} onPostal={setPostal} movimientoReducido={movimientoReducido} />
          ))}
        </AnimatePresence>
        {observaciones.length === 0 && (
          <p className="empty-observations">{fechaFiltro ? "No se encontraron observaciones para esa fecha." : "No hay observaciones registradas."}</p>
        )}
      </div>
    </section>
  );
}

export function CatalogoTelescopios({ telescopios }) {
  return (
    <section id="catalogoTelescopios" className="hud-section">
      <SectionHeading icon={Telescope} eyebrow="05 // ÓPTICA Y EQUIPOS">Catálogo de Telescopios</SectionHeading>
      <div id="listaTelescopios">
        {telescopios.map((telescopio) => (
          <div className="observacion" key={telescopio.id}>
            <p><strong>{telescopio.nombre}</strong> ({telescopio.tipo})</p>
          </div>
        ))}
      </div>
    </section>
  );
}
