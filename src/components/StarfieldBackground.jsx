import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer } from "@react-three/postprocessing";
import GravitationalLens from "./GravitationalLensEffect.jsx";
import { useModoNocturno } from "../ModoNocturno.jsx";

const BAJOS_RECURSOS = typeof window !== "undefined"
  && (window.matchMedia("(max-width: 720px)").matches
    || window.matchMedia("(pointer: coarse)").matches
    || (navigator.hardwareConcurrency || 8) <= 4);
const CANTIDAD = BAJOS_RECURSOS ? 700 : 1500;
const PROFUNDIDAD = 70;
const CERCA = 6;
const VELOCIDAD_BASE = 0.9;
const VELOCIDAD_WARP = 70;
const ESTIRAMIENTO_WARP = 45;

const PALETA_NORMAL = ["#ffffff", "#fff7dc", "#a9c8ff", "#8fb4ff", "#ffd27a", "#f4c76a"];
const PALETA_NOCTURNA = ["#ff2a2a", "#d41f1f", "#a31414", "#ff5a4a"];

function crearEstrellas() {
  return Array.from({ length: CANTIDAD }, () => ({
    x: (Math.random() - 0.5) * 140,
    y: (Math.random() - 0.5) * 84,
    z: CERCA - Math.random() * PROFUNDIDAD,
    escala: 0.04 + Math.random() * 0.09,
    color: Math.floor(Math.random() * 6),
    brillo: 0.35 + Math.random() * 0.65,
  }));
}

function Estrellas({ puntero, isWarping, modoNocturno, animar }) {
  const malla = useRef(null);
  const grupo = useRef(null);
  const warp = useRef(0);
  const estrellas = useMemo(crearEstrellas, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    const paleta = modoNocturno ? PALETA_NOCTURNA : PALETA_NORMAL;
    const color = new THREE.Color();
    estrellas.forEach((estrella, i) => {
      color.set(paleta[estrella.color % paleta.length]).multiplyScalar(estrella.brillo * (modoNocturno ? 0.55 : 1));
      malla.current.setColorAt(i, color);
    });
    malla.current.instanceColor.needsUpdate = true;
  }, [estrellas, modoNocturno]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const objetivo = isWarping ? 1 : 0;
    warp.current = THREE.MathUtils.lerp(warp.current, objetivo, 1 - Math.exp(-dt * (isWarping ? 5 : 3)));
    const w = warp.current;
    const avance = animar ? (VELOCIDAD_BASE + w * VELOCIDAD_WARP) * dt : 0;
    const estiramiento = 1 + w * ESTIRAMIENTO_WARP;

    estrellas.forEach((estrella, i) => {
      estrella.z += avance;
      if (estrella.z > CERCA) estrella.z -= PROFUNDIDAD;
      dummy.position.set(estrella.x, estrella.y, estrella.z);
      dummy.scale.set(estrella.escala, estrella.escala, estrella.escala * estiramiento);
      dummy.updateMatrix();
      malla.current.setMatrixAt(i, dummy.matrix);
    });
    malla.current.instanceMatrix.needsUpdate = true;

    const suavizado = 1 - Math.exp(-dt * 3);
    grupo.current.rotation.y = THREE.MathUtils.lerp(grupo.current.rotation.y, -puntero.current.x * 0.12, suavizado);
    grupo.current.rotation.x = THREE.MathUtils.lerp(grupo.current.rotation.x, -puntero.current.y * 0.08, suavizado);
  });

  return (
    <group ref={grupo}>
      <instancedMesh ref={malla} args={[undefined, undefined, CANTIDAD]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial toneMapped={false} transparent opacity={modoNocturno ? 0.8 : 1} />
      </instancedMesh>
    </group>
  );
}

export default function StarfieldBackground({ movimientoReducido = false, isWarping = false }) {
  const { modoNocturno } = useModoNocturno();
  const puntero = useRef({ x: 0, y: 0 });
  const [visible, setVisible] = useState(!document.hidden);
  const dpr = useMemo(() => [1, BAJOS_RECURSOS ? 1 : 1.5], []);
  const usarLente = !movimientoReducido && !BAJOS_RECURSOS && window.matchMedia("(pointer: fine)").matches;

  useEffect(() => {
    if (movimientoReducido) return undefined;
    const mover = (event) => {
      if (event.pointerType !== "mouse") return;
      puntero.current = { x: event.clientX / window.innerWidth - 0.5, y: event.clientY / window.innerHeight - 0.5 };
    };
    const reposo = () => { puntero.current = { x: 0, y: 0 }; };
    window.addEventListener("pointermove", mover, { passive: true });
    document.documentElement.addEventListener("pointerleave", reposo);
    return () => {
      window.removeEventListener("pointermove", mover);
      document.documentElement.removeEventListener("pointerleave", reposo);
    };
  }, [movimientoReducido]);

  useEffect(() => {
    const cambio = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", cambio);
    return () => document.removeEventListener("visibilitychange", cambio);
  }, []);

  return (
    <div className="starfield" aria-hidden="true">
      <Canvas
        camera={{ fov: 60, near: 0.1, far: 120, position: [0, 0, 0] }}
        dpr={dpr}
        frameloop={visible ? "always" : "never"}
        gl={{ alpha: true, antialias: false, powerPreference: usarLente ? "high-performance" : "low-power" }}
        style={{ pointerEvents: "none" }}
      >
        <Estrellas
          puntero={puntero}
          isWarping={isWarping && !movimientoReducido}
          modoNocturno={modoNocturno}
          animar={!movimientoReducido}
        />
        {usarLente && (
          <EffectComposer multisampling={0} enableNormalPass={false}>
            <GravitationalLens isNightVision={modoNocturno} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
