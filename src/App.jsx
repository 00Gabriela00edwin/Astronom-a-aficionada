import React, { useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import telescopiosUrl from "../data/telescopios.json?url";
import { Aside, Footer, Header } from "./components/Layout.jsx";
import Hero from "./components/Hero.jsx";
import Clima from "./components/Clima.jsx";
import CalculadoraAumentos from "./components/CalculadoraAumentos.jsx";
import useClima from "./hooks/useClima.js";
import { Busqueda, CatalogoTelescopios, ObservacionesRegistradas, RegistroObservacion } from "./components/Observaciones.jsx";

function mostrarAlerta(icon, title, text, timer = 3000) {
  Swal.fire({ icon, title, text, timer, showConfirmButton: false });
}

function cargarObservaciones() {
  try {
    const datos = localStorage.getItem("observaciones");
    if (!datos) return [];
    const observaciones = JSON.parse(datos);
    if (!Array.isArray(observaciones)) throw new Error("Las observaciones guardadas no son una lista");
    return observaciones;
  } catch (error) {
    console.error("No se pudieron cargar las observaciones:", error);
    alert("No se pudieron cargar las observaciones guardadas.");
    return [];
  }
}

export default function App() {
  const [observaciones, setObservaciones] = useState(cargarObservaciones);
  const [telescopios, setTelescopios] = useState([]);
  const [estadoCatalogo, setEstadoCatalogo] = useState("cargando");
  const [fechaFiltro, setFechaFiltro] = useState("");
  const { clima, cargando, error, actualizarClima } = useClima();
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
    try {
      localStorage.setItem("observaciones", JSON.stringify(nuevasObservaciones));
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

  return (
    <MotionConfig reducedMotion="user">
      <Header />
      <main>
        <Hero />
        <div id="dashboard" className="dashboard">
          <Clima clima={clima} cargando={cargando} error={error} />
          <Busqueda fechaFiltro={fechaFiltro} onBuscar={setFechaFiltro} cantidad={observacionesFiltradas.length} />
          <RegistroObservacion telescopios={telescopios} onRegistrar={registrarObservacion} actualizarClima={actualizarClima} cargandoClima={cargando} errorClima={error} />
          <ObservacionesRegistradas observaciones={observacionesFiltradas} fechaFiltro={fechaFiltro} onEliminar={eliminarObservacion} />
          <CalculadoraAumentos telescopios={telescopios} estadoCatalogo={estadoCatalogo} />
          <CatalogoTelescopios telescopios={telescopios} />
        </div>
      </main>
      <Aside />
      <Footer />
    </MotionConfig>
  );
}
