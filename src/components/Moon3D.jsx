import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ANCHO = 512;
const ALTO = 256;

function generador(semilla) {
  let estado = semilla;
  return () => {
    estado = (estado * 1664525 + 1013904223) % 4294967296;
    return estado / 4294967296;
  };
}

// Dibuja cada elemento también desplazado ±ANCHO para que la textura cierre sin costura.
function conRepeticion(x, radio, dibujar) {
  dibujar(x);
  if (x - radio < 0) dibujar(x + ANCHO);
  if (x + radio > ANCHO) dibujar(x - ANCHO);
}

function crearTexturas() {
  const aleatorio = generador(20240611);
  const albedo = document.createElement("canvas");
  const relieve = document.createElement("canvas");
  albedo.width = relieve.width = ANCHO;
  albedo.height = relieve.height = ALTO;
  const a = albedo.getContext("2d");
  const r = relieve.getContext("2d");

  a.fillStyle = "#9a9a98";
  a.fillRect(0, 0, ANCHO, ALTO);
  r.fillStyle = "#808080";
  r.fillRect(0, 0, ANCHO, ALTO);

  for (let i = 0; i < 2600; i++) {
    const x = aleatorio() * ANCHO;
    const y = aleatorio() * ALTO;
    const radio = 1 + aleatorio() * 3;
    const tono = 120 + Math.floor(aleatorio() * 70);
    a.fillStyle = `rgba(${tono}, ${tono}, ${tono - 2}, 0.35)`;
    a.beginPath();
    a.arc(x, y, radio, 0, Math.PI * 2);
    a.fill();
  }

  const mares = [
    [150, 95, 55, 38], [205, 120, 40, 30], [105, 130, 35, 22], [250, 88, 30, 24],
    [320, 105, 45, 28], [380, 150, 30, 20], [60, 80, 28, 20], [440, 90, 35, 25],
  ];
  mares.forEach(([x, y, rx, ry]) => {
    conRepeticion(x, rx, (cx) => {
      const gradiente = a.createRadialGradient(cx, y, 0, cx, y, rx);
      gradiente.addColorStop(0, "rgba(40, 42, 48, 0.85)");
      gradiente.addColorStop(0.7, "rgba(52, 54, 60, 0.6)");
      gradiente.addColorStop(1, "rgba(60, 62, 68, 0)");
      a.save();
      a.translate(cx, y);
      a.scale(1, ry / rx);
      a.translate(-cx, -y);
      a.fillStyle = gradiente;
      a.beginPath();
      a.arc(cx, y, rx, 0, Math.PI * 2);
      a.fill();
      a.restore();
    });
  });

  for (let i = 0; i < 420; i++) {
    const x = aleatorio() * ANCHO;
    const y = 8 + aleatorio() * (ALTO - 16);
    const radio = 1.5 + Math.pow(aleatorio(), 2.5) * 16;
    conRepeticion(x, radio, (cx) => {
      const sombra = r.createRadialGradient(cx, y, 0, cx, y, radio);
      sombra.addColorStop(0, "rgba(0, 0, 0, 0.75)");
      sombra.addColorStop(0.7, "rgba(40, 40, 40, 0.45)");
      sombra.addColorStop(0.85, "rgba(255, 255, 255, 0.85)");
      sombra.addColorStop(1, "rgba(128, 128, 128, 0)");
      r.fillStyle = sombra;
      r.beginPath();
      r.arc(cx, y, radio, 0, Math.PI * 2);
      r.fill();

      const interior = a.createRadialGradient(cx, y, 0, cx, y, radio);
      interior.addColorStop(0, "rgba(70, 70, 70, 0.28)");
      interior.addColorStop(0.8, "rgba(90, 90, 90, 0.18)");
      interior.addColorStop(0.9, "rgba(200, 200, 198, 0.35)");
      interior.addColorStop(1, "rgba(200, 200, 198, 0)");
      a.fillStyle = interior;
      a.beginPath();
      a.arc(cx, y, radio, 0, Math.PI * 2);
      a.fill();
    });
  }

  const map = new THREE.CanvasTexture(albedo);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  const bumpMap = new THREE.CanvasTexture(relieve);
  return { map, bumpMap };
}

function Luna({ phase, latitude, isNightVision, rotacion, animar }) {
  const esfera = useRef(null);
  const actual = useRef({ x: 0.15, y: 0 });
  const texturas = useMemo(crearTexturas, []);

  useEffect(() => () => {
    texturas.map.dispose();
    texturas.bumpMap.dispose();
  }, [texturas]);

  const angulo = phase * Math.PI * 2;
  const signo = latitude < 0 ? -1 : 1;
  const posicionSol = [signo * Math.sin(angulo) * 6, 0, -Math.cos(angulo) * 6];

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const objetivo = rotacion.current;
    if (!rotacion.current.arrastrando && animar) objetivo.y += dt * 0.05;
    const k = 1 - Math.exp(-dt * 8);
    actual.current.x = THREE.MathUtils.lerp(actual.current.x, objetivo.x, k);
    actual.current.y = THREE.MathUtils.lerp(actual.current.y, objetivo.y, k);
    esfera.current.rotation.set(actual.current.x, actual.current.y, 0);
  });

  return (
    <>
      <ambientLight intensity={0.05} color={isNightVision ? "#ff4a3a" : "#8fa6ff"} />
      <directionalLight position={posicionSol} intensity={3.2} color={isNightVision ? "#ff5a4a" : "#fff6e6"} />
      <mesh ref={esfera}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={texturas.map}
          bumpMap={texturas.bumpMap}
          bumpScale={0.04}
          roughness={0.95}
          metalness={0.02}
          color={isNightVision ? "#ff7060" : "#ffffff"}
        />
      </mesh>
    </>
  );
}

export default function Moon3D({ phase, illumination = 50, latitude = -34, isNightVision = false }) {
  const contenedor = useRef(null);
  const rotacion = useRef({ x: 0.15, y: 0, arrastrando: false });
  const arrastre = useRef(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [visible, setVisible] = useState(true);
  const movimientoReducido = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  const fase = Number.isFinite(phase)
    ? ((phase % 1) + 1) % 1
    : Math.acos(1 - 2 * Math.min(Math.max(illumination, 0), 100) / 100) / (2 * Math.PI);
  const brillo = Number.isFinite(phase) ? (1 - Math.cos(fase * 2 * Math.PI)) / 2 : Math.min(Math.max(illumination, 0), 100) / 100;
  const lat = Number.isFinite(latitude) ? latitude : -34;

  useEffect(() => {
    const observer = new IntersectionObserver(([entrada]) => setVisible(entrada.isIntersecting));
    observer.observe(contenedor.current);
    return () => observer.disconnect();
  }, []);

  function iniciar(event) {
    event.currentTarget.setPointerCapture(event.pointerId);
    arrastre.current = { x: event.clientX, y: event.clientY };
    rotacion.current.arrastrando = true;
    setArrastrando(true);
  }

  function mover(event) {
    if (!arrastre.current) return;
    const dx = event.clientX - arrastre.current.x;
    const dy = event.clientY - arrastre.current.y;
    arrastre.current = { x: event.clientX, y: event.clientY };
    rotacion.current.y += dx * 0.012;
    rotacion.current.x = THREE.MathUtils.clamp(rotacion.current.x + dy * 0.012, -1.2, 1.2);
  }

  function terminar(event) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    arrastre.current = null;
    rotacion.current.arrastrando = false;
    setArrastrando(false);
  }

  const colorHalo = isNightVision ? "255, 42, 42" : "190, 205, 255";

  return (
    <div
      ref={contenedor}
      className={`moon-3d${arrastrando ? " is-dragging" : ""}`}
      onPointerDown={iniciar}
      onPointerMove={mover}
      onPointerUp={terminar}
      onPointerCancel={terminar}
    >
      <div
        className="moon-3d-halo"
        aria-hidden="true"
        style={{
          background: `radial-gradient(circle, rgba(${colorHalo}, ${0.1 + brillo * 0.45}) 0%, rgba(${colorHalo}, ${brillo * 0.18}) 45%, rgba(${colorHalo}, 0) 70%)`,
          opacity: brillo < 0.02 ? 0 : 0.35 + brillo * 0.65,
        }}
      />
      <Canvas
        camera={{ fov: 32, position: [0, 0, 4] }}
        dpr={[1, 1.5]}
        frameloop={visible ? "always" : "never"}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      >
        <Luna phase={fase} latitude={lat} isNightVision={isNightVision} rotacion={rotacion} animar={!movimientoReducido} />
      </Canvas>
    </div>
  );
}
