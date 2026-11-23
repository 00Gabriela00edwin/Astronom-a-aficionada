import React, { useEffect, useRef, useState } from "react";
import { MotionConfig } from "framer-motion";
import "sweetalert2/dist/sweetalert2.min.css";
import telescopiosUrl from "../data/telescopios.json?url";
import { Aside, Footer, Header } from "./components/Layout.jsx";
import Hero from "./components/Hero.jsx";
import Clima from "./components/Clima.jsx";
import CalculadoraAumentos from "./components/CalculadoraAumentos.jsx";
import useClima from "./hooks/useClima.js";
import Ubicacion from "./components/Ubicacion.jsx";
import SectionHeading from "./components/SectionHeading.jsx";
import { CalendarDays } from "lucide-react";
import { combinarRespaldo } from "./utils/respaldo.js";
import { Busqueda, CatalogoTelescopios, ObservacionesRegistradas, RegistroObservacion } from "./components/Observaciones.jsx";

const UBICACION_INICIAL = { nombre: "Buenos Aires, Argentina", latitud: -34.6, longitud: -58.4, zona: "America/Argentina/Buenos_Aires" };

function mostrarAlerta(icon, title, text, timer = 3000) {
  import("sweetalert2")
    .then(({ default: Swal }) => Swal.fire({ icon, title, text, timer, showConfirmButton: false }))
    .catch((error) => {
      console.error("No se pudo mostrar la notificación:", error);
      alert(`No se pudo mostrar la notificación visual. ${title}: ${text}`);
    });
}

function cargarObservaciones() {
  try {
    const datos = localStorage.getItem("observaciones");
    if (!datos) return { datos: [], error: false };
    const observaciones = JSON.parse(datos);
    if (!Array.isArray(observaciones)) throw new Error("Las observaciones guardadas no son una lista");
    return { datos: observaciones, error: false };
  } catch (error) {
    console.error("No se pudieron cargar las observaciones:", error);
    return { datos: [], error: true };
  }
}

export default function App() {
  const [cargaInicial] = useState(cargarObservaciones);
  const [observaciones, setObservaciones] = useState(cargaInicial.datos);
  const observacionesActuales = useRef(cargaInicial.datos);
  const [telescopios, setTelescopios] = useState([]);
  const [estadoCatalogo, setEstadoCatalogo] = useState("cargando");
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [ubicacion, setUbicacion] = useState(UBICACION_INICIAL);
  const [planificadorAbierto, setPlanificadorAbierto] = useState(false);
  const [Planificador, setPlanificador] = useState(null);
  const [cargandoPlanificador, setCargandoPlanificador] = useState(false);
  const [errorPlanificador, setErrorPlanificador] = useState(false);
  const { clima, cargando, error, actualizarClima } = useClima(ubicacion);
  const climaUbicacion = clima?.latitud === ubicacion.latitud && clima?.longitud === ubicacion.longitud ? clima : null;
  const observacionesFiltradas = fechaFiltro
    ? observaciones.filter((observacion) => observacion.fecha === fechaFiltro)
    : observaciones;

  useEffect(() => {
    const controller = new AbortController();

    async function cargarTelescopios() {
      try {
        const response = await fetch(telescopiosUrl, { signal: controller.signal });
        if (!response.ok) throw new Error("Error al cargar telescopios");
        const catalogo = await response.json();
        if (!Array.isArray(catalogo) || catalogo.some((equipo) =>
          !equipo.id || !equipo.nombre || !equipo.tipo || !equipo.relacionFocal || !equipo.montura || !equipo.idealPara ||
          !Number.isFinite(equipo.aperturaMm) || equipo.aperturaMm <= 0 ||
          !Number.isFinite(equipo.distanciaFocalMm) || equipo.distanciaFocalMm < 20
        )) throw new Error("El catálogo contiene datos ópticos inválidos");
        setTelescopios(catalogo);
        setEstadoCatalogo("listo");
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error(error);
        setEstadoCatalogo("error");
        alert("No se pudieron cargar los telescopios.");
      }
    }

    cargarTelescopios();
    return () => controller.abort();
  }, []);

  function guardarObservaciones(nuevasObservaciones) {
    if (cargaInicial.error) {
      alert("No se pueden guardar observaciones porque no se pudieron leer los datos existentes.");
      return false;
    }
    try {
      localStorage.setItem("observaciones", JSON.stringify(nuevasObservaciones));
      observacionesActuales.current = nuevasObservaciones;
      setObservaciones(nuevasObservaciones);
      return true;
    } catch (error) {
      console.error("No se pudieron guardar las observaciones:", error);
      alert("No se pudieron guardar las observaciones.");
      return false;
    }
  }

  function registrarObservacion(formulario) {
    if (observaciones.some((observacion) => observacion.fecha === formulario.fecha && observacion.hora === formulario.hora)) {
      mostrarAlerta("error", "Duplicado", "Ya existe una observación para esa fecha y hora.");
      return false;
    }

    const nuevaObservacion = { id: Date.now().toString(), ...formulario };
    if (!guardarObservaciones([...observaciones, nuevaObservacion])) return false;
    mostrarAlerta("success", "¡Observación guardada!", "Tu registro fue exitoso.");
    return true;
  }

  function eliminarObservacion(id) {
    if (!guardarObservaciones(observaciones.filter((observacion) => observacion.id !== id))) return;
    mostrarAlerta("info", "Observación eliminada", "El registro fue eliminado correctamente.");
  }

  function importarObservaciones(respaldo) {
    const resultado = combinarRespaldo(observacionesActuales.current, respaldo);
    if (!guardarObservaciones(resultado.observaciones)) return null;
    return resultado;
  }

  async function alternarPlanificador() {
    if (planificadorAbierto) {
      setPlanificadorAbierto(false);
      return;
    }
    setPlanificadorAbierto(true);
    if (Planificador || cargandoPlanificador) return;
    setCargandoPlanificador(true);
    setErrorPlanificador(false);
    try {
      const modulo = await import("./components/Planificador.jsx");
      setPlanificador(() => modulo.default);
    } catch (error) {
      console.error("No se pudo cargar el planificador:", error);
      setErrorPlanificador(true);
    } finally {
      setCargandoPlanificador(false);
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <Header />
      <main>
        <Hero />
        <div id="dashboard" className="dashboard">
          <Ubicacion ubicacion={ubicacion} onCambiar={setUbicacion} />
          <Clima clima={climaUbicacion} cargando={cargando} error={error} ubicacion={ubicacion} />
          <Busqueda fechaFiltro={fechaFiltro} onBuscar={setFechaFiltro} cantidad={observacionesFiltradas.length} />
          {cargaInicial.error && <p className="storage-warning" role="alert">No se pudieron leer las observaciones guardadas. Se desactivó la escritura para evitar sobrescribirlas.</p>}
          <RegistroObservacion telescopios={telescopios} onRegistrar={registrarObservacion} actualizarClima={actualizarClima} cargandoClima={cargando} errorClima={error} ubicacion={ubicacion} />
          <ObservacionesRegistradas observaciones={observacionesFiltradas} todasObservaciones={observaciones} fechaFiltro={fechaFiltro} onEliminar={eliminarObservacion} onImportar={importarObservaciones} errorCarga={cargaInicial.error} />
          <section id="planificador" className="glass-card bg-white/5 backdrop-blur-md border border-white/10">
            <SectionHeading icon={CalendarDays} eyebrow="PREPARA TU NOCHE">Planificador de observación</SectionHeading>
            <button type="button" className="autofill-button" aria-expanded={planificadorAbierto} onClick={alternarPlanificador}>
              {planificadorAbierto ? "Cerrar planificador" : "Abrir planificador"}
            </button>
            {planificadorAbierto && (
              errorPlanificador ? <p className="helper-text" role="alert">No se pudo cargar el planificador. Ciérralo y ábrelo para reintentar.</p>
                : cargandoPlanificador || !Planificador ? <p className="helper-text" role="status">Cargando planificador…</p>
                  : ubicacion.zona || climaUbicacion?.zona ? <Planificador ubicacion={ubicacion} zona={ubicacion.zona || climaUbicacion.zona} />
                    : <p className="helper-text" role="status">Esperando la zona horaria de la ubicación. Si falla, reintenta la consulta del clima.</p>
            )}
          </section>
          <CalculadoraAumentos telescopios={telescopios} estadoCatalogo={estadoCatalogo} />
          <CatalogoTelescopios telescopios={telescopios} />
        </div>
      </main>
      <Aside />
      <Footer />
    </MotionConfig>
  );
}
