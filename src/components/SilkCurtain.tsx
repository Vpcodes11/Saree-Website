"use client";

import { Component, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

class SilkBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

function Panel({ side, progress }: { side: -1 | 1; progress: RefObject<number> }) {
  const { viewport, invalidate } = useThree();
  const group = useRef<THREE.Group>(null);
  const uniforms = useMemo(() => ({ silkTime: { value: 0 } }), []);
  const geometry = useMemo(() => {
    const w = viewport.width, h = viewport.height;
    const mesh = new THREE.PlaneGeometry(1, 1, 84, 42);
    const positions = mesh.getAttribute("position");
    const colors = new Float32Array(positions.count * 3);
    const wine = new THREE.Color(side === -1 ? "#571c2b" : "#732d39");
    const gold = new THREE.Color("#b7955b");
    for (let i = 0; i < positions.count; i++) {
      const u = positions.getX(i) + .5;
      const v = .5 - positions.getY(i);
      const outer = side * w * .56;
      const compact = w / h < 1;
      const inner = side === -1
        ? w * ((compact ? .44 : -.06) + (compact ? .12 : .14) * Math.cos(v * Math.PI * 1.08))
        : w * ((compact ? .43 : .32) - (compact ? .06 : .12) * Math.cos(v * Math.PI * .9));
      const x = THREE.MathUtils.lerp(outer, inner, u);
      const y = h * (.61 - v * 1.22);
      const fold = Math.sin(u * Math.PI * 15 + v * 1.5) * (.10 + v * .06);
      const billow = Math.sin(u * Math.PI) * Math.sin(v * 5) * .16;
      positions.setXYZ(i, x, y, fold + billow);
      const border = u > .995 || (u > .975 && u < .979);
      const c = border ? gold : wine;
      colors.set([c.r, c.g, c.b], i * 3);
    }
    mesh.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    mesh.computeVertexNormals();
    return mesh;
  }, [viewport.width, viewport.height, side]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const material = useMemo(() => {
    const weave = new Uint8Array(64 * 64 * 4);
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
      const i = (y * 64 + x) * 4;
      const tone = 115 + (x % 2 ? 14 : -14) + (y % 2 ? 9 : -9);
      weave.set([tone, tone, tone, 255], i);
    }
    const texture = new THREE.DataTexture(weave, 64, 64);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(90, 100);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    const silk = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: .64,
      metalness: .02,
      sheen: .65,
      sheenColor: new THREE.Color("#886479"),
      sheenRoughness: .78,
      bumpMap: texture,
      bumpScale: .006,
      side: THREE.DoubleSide,
    });
    silk.onBeforeCompile = (shader) => {
      shader.uniforms.silkTime = uniforms.silkTime;
      shader.vertexShader = "uniform float silkTime;\n" + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>",
        "#include <begin_vertex>\ntransformed.z += sin(position.y * 1.1 + silkTime * .6) * sin(uv.x * 3.14159) * .035;");
    };
    return silk;
  }, [uniforms]);
  useEffect(() => () => { material.bumpMap?.dispose(); material.dispose(); }, [material]);
  useFrame((state) => {
    uniforms.silkTime.value = performance.now() / 1000;
    const opening = THREE.MathUtils.smoothstep(progress.current, .012, .21);
    if (group.current) {
      group.current.position.x = side * opening * viewport.width * .73;
      group.current.rotation.z = side * opening * .075;
    }
    // Stop GPU work once the curtains are offscreen; scrolling back invalidates it.
    if (opening < .999) invalidate();
  });
  return <group ref={group}><mesh geometry={geometry} material={material} /></group>;
}

function ScrollWake({ progress }: { progress: RefObject<number> }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const wake = () => invalidate();
    window.addEventListener("scroll", wake, { passive: true });
    // GSAP's scrub can settle just after a native scroll event.
    let timer = 0;
    const settle = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(wake, 300);
    };
    window.addEventListener("scroll", settle, { passive: true });
    return () => {
      window.removeEventListener("scroll", wake);
      window.removeEventListener("scroll", settle);
      window.clearTimeout(timer);
    };
  }, [invalidate, progress]);
  return null;
}

export default function SilkCurtain({ progress, onPaint }: { progress: RefObject<number>; onPaint: (painted: boolean) => void }) {
  const [supported, setSupported] = useState(false);
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    setCompact(matchMedia("(max-width: 767px)").matches);
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2");
      if (gl) {
        setSupported(true);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
    } catch { /* The photographic silk remains underneath. */ }
  }, []);
  if (!supported) return null;
  return (
    <SilkBoundary>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 10], zoom: 100, near: .1, far: 30 }}
        dpr={compact ? 1 : [1, 1.5]}
        frameloop="demand"
        gl={{ alpha: true, antialias: !compact, powerPreference: "low-power" }}
        onCreated={({ gl, invalidate }) => {
          gl.setClearColor(0x000000, 0);
          gl.domElement.addEventListener("webglcontextlost", () => { setSupported(false); onPaint(false); }, { once: true });
          invalidate();
        }}
        fallback={null}
        style={{ pointerEvents: "none" }}
      >
        <ambientLight intensity={.8} color="#f2dce7" />
        <directionalLight position={[-3, 5, 6]} intensity={2.4} color="#fff6eb" />
        <directionalLight position={[5, 0, 4]} intensity={1.2} color="#cfb9cf" />
        <Panel side={-1} progress={progress} />
        <Panel side={1} progress={progress} />
        <ScrollWake progress={progress} />
        <Painted onPaint={onPaint} />
      </Canvas>
    </SilkBoundary>
  );
}

function Painted({ onPaint }: { onPaint: (painted: boolean) => void }) {
  const painted = useRef(false);
  useFrame(() => {
    if (!painted.current) {
      painted.current = true;
      requestAnimationFrame(() => onPaint(true));
    }
  });
  return null;
}
