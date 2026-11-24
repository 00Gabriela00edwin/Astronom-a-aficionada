import React, { forwardRef, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Effect } from "postprocessing";
import { Uniform, Vector2, MathUtils } from "three";

const FRAGMENT = /* glsl */ `
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uStrength;
uniform float uRadius;
uniform float uNightVision;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 delta = (uv - uMouse) * aspect;
  float dist = length(delta);
  vec2 dir = dist > 0.0001 ? delta / dist : vec2(0.0);

  float falloff = 1.0 - smoothstep(0.0, uRadius, dist);
  float pull = uStrength * falloff * falloff * (3.0 - 2.0 * falloff);
  vec2 offset = -dir * pull / aspect;
  vec2 ca = dir * (0.18 * pull) / aspect;

  vec2 base = uv + offset;
  float r = texture2D(inputBuffer, clamp(base + ca, 0.0, 1.0)).r;
  vec4 g = texture2D(inputBuffer, clamp(base, 0.0, 1.0));
  float b = texture2D(inputBuffer, clamp(base - ca, 0.0, 1.0)).b;
  vec4 color = vec4(r, g.g, b, g.a);

  float presence = smoothstep(0.0, 0.03, uStrength);
  float ring = exp(-pow((dist - uRadius * 0.82) / (uRadius * 0.06), 2.0)) * presence * 0.16;
  vec3 tint = mix(mix(vec3(0.55, 0.78, 1.0), vec3(1.0, 0.82, 0.42), smoothstep(0.0, 0.5, sin(dist * 90.0) * 0.5 + 0.5)),
                  vec3(1.0, 0.16, 0.12), step(0.5, uNightVision));
  color.rgb += tint * ring;
  color.a = max(color.a, ring);

  outputColor = color;
}
`;

class GravitationalLensEffectImpl extends Effect {
  constructor() {
    super("GravitationalLensEffect", FRAGMENT, {
      uniforms: new Map([
        ["uMouse", new Uniform(new Vector2(0.5, 0.5))],
        ["uResolution", new Uniform(new Vector2(1, 1))],
        ["uStrength", new Uniform(0)],
        ["uRadius", new Uniform(0.16)],
        ["uNightVision", new Uniform(0)],
      ]),
    });
  }
}

const GravitationalLensEffect = forwardRef(function GravitationalLensEffect(props, ref) {
  const efecto = useMemo(() => new GravitationalLensEffectImpl(), []);
  return <primitive ref={ref} object={efecto} dispose={null} {...props} />;
});

const FUERZA_BASE = 0.02;
const FUERZA_CLIC = 0.05;

export default function GravitationalLens({ isNightVision = false, radius = 0.065 }) {
  const efecto = useRef(null);
  const size = useThree((estado) => estado.size);
  const objetivo = useRef({ x: 0.5, y: 0.5, activo: false, clic: false });
  const fino = useMemo(() => window.matchMedia("(pointer: fine)").matches, []);

  useEffect(() => {
    if (!fino) return undefined;
    const mover = (evento) => {
      if (evento.pointerType !== "mouse") return;
      const o = objetivo.current;
      if (!o.activo) {
        o.activo = true;
        // Primer movimiento: la lente aparece directamente bajo el cursor.
        const uniform = efecto.current?.uniforms.get("uMouse").value;
        uniform?.set(evento.clientX / window.innerWidth, 1 - evento.clientY / window.innerHeight);
      }
      o.x = evento.clientX / window.innerWidth;
      o.y = 1 - evento.clientY / window.innerHeight;
    };
    const bajar = (evento) => { if (evento.pointerType === "mouse") objetivo.current.clic = true; };
    const subir = () => { objetivo.current.clic = false; };
    const salir = () => { objetivo.current.activo = false; };
    window.addEventListener("pointermove", mover, { passive: true });
    window.addEventListener("pointerdown", bajar, { passive: true });
    window.addEventListener("pointerup", subir, { passive: true });
    window.addEventListener("pointercancel", subir, { passive: true });
    document.documentElement.addEventListener("pointerleave", salir);
    return () => {
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerdown", bajar);
      window.removeEventListener("pointerup", subir);
      window.removeEventListener("pointercancel", subir);
      document.documentElement.removeEventListener("pointerleave", salir);
    };
  }, [fino]);

  useFrame((_, delta) => {
    const efectoActual = efecto.current;
    if (!efectoActual) return;
    const u = efectoActual.uniforms;
    const o = objetivo.current;
    const dt = Math.min(delta, 0.05);
    const mouse = u.get("uMouse").value;
    mouse.x = MathUtils.lerp(mouse.x, o.x, 1 - Math.exp(-dt * 9));
    mouse.y = MathUtils.lerp(mouse.y, o.y, 1 - Math.exp(-dt * 9));

    const meta = !o.activo ? 0 : o.clic ? FUERZA_CLIC : FUERZA_BASE;
    const fuerza = u.get("uStrength");
    fuerza.value = MathUtils.lerp(fuerza.value, meta, 1 - Math.exp(-dt * (o.clic ? 10 : 4)));
    u.get("uResolution").value.set(size.width, size.height);
    u.get("uRadius").value = radius;
    u.get("uNightVision").value = isNightVision ? 1 : 0;
  });

  if (!fino) return null;
  return <GravitationalLensEffect ref={efecto} />;
}
