"use client";

import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";

type BoutiqueProps = {
  progress: RefObject<number>;
  onReady: () => void;
  onFailure: () => void;
  videoSrc?: string;
  videoElementRef?: RefObject<HTMLVideoElement | null>;
  reducedMotion?: boolean;
};

const PHOTOS = ["heritage", "festive", "minimal", "evening", "bridal", "contemporary"];
const SILKS = ["#ad8b6b", "#8b5663", "#d4baa4", "#8b9279", "#b78372", "#e0cbb2", "#8c798a", "#657869", "#b7a082", "#af8993"];

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function makeSurface(kind: "stone" | "weave" | "wood" | "plaster") {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Texture();
  context.fillStyle = kind === "stone" ? "#dfd3be" : kind === "wood" ? "#493328" : kind === "plaster" ? "#e8decb" : "#ded5c5";
  context.fillRect(0, 0, 256, 256);
  // Deterministic grain keeps the scene stable between React remounts.
  let seed = 4181;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 7000; i++) {
    context.fillStyle = `rgba(${random() > 0.5 ? "255,246,221" : "72,57,41"},${0.018 + random() * 0.032})`;
    context.fillRect(random() * 256, random() * 256, random() * 2 + 0.5, random() * 2 + 0.5);
  }
  if (kind === "stone") {
    for (let i = 0; i < 68; i++) {
      context.strokeStyle = `rgba(101,83,67,${0.025 + random() * 0.075})`;
      context.lineWidth = random() * 1.5;
      context.beginPath();
      const y = random() * 256;
      context.moveTo(-10, y);
      context.bezierCurveTo(60, y + random() * 60, 160, y - random() * 55, 270, y + random() * 20);
      context.stroke();
    }
  } else if (kind !== "plaster") {
    for (let i = 0; i < 256; i += kind === "wood" ? 2 : 3) {
      context.strokeStyle = `rgba(${kind === "wood" ? "169,111,67" : "70,58,44"},${0.04 + random() * 0.12})`;
      context.beginPath(); context.moveTo(i, 0);
      if (kind === "wood") context.bezierCurveTo(i + random() * 14, 80, i - random() * 10, 180, i + random() * 8, 256);
      else context.lineTo(i, 256);
      context.stroke();
      if (kind === "weave") { context.beginPath(); context.moveTo(0, i); context.lineTo(256, i); context.stroke(); }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(kind === "stone" ? 6 : 3, kind === "stone" ? 14 : 3);
  return texture;
}

function roundedFoldGeometry() {
  const geometry = new THREE.BoxGeometry(1, 1, 1, 5, 3, 5);
  const vertices = geometry.getAttribute("position");
  const point = new THREE.Vector3();
  const closest = new THREE.Vector3();
  for (let i = 0; i < vertices.count; i++) {
    point.fromBufferAttribute(vertices, i);
    closest.set(THREE.MathUtils.clamp(point.x, -0.44, 0.44), THREE.MathUtils.clamp(point.y, -0.44, 0.44), THREE.MathUtils.clamp(point.z, -0.44, 0.44));
    point.sub(closest).normalize().multiplyScalar(0.06).add(closest);
    vertices.setXYZ(i, point.x, point.y, point.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function drapedFabricGeometry() {
  const geometry = new THREE.PlaneGeometry(0.79, 2.23, 20, 24);
  const vertices = geometry.getAttribute("position");
  for (let i = 0; i < vertices.count; i++) {
    const x = vertices.getX(i), y = vertices.getY(i);
    const drape = (1.115 - y) / 2.23;
    vertices.setXYZ(i, x + Math.sin(drape * 2.3) * 0.036, y - Math.cos(x * 8) * 0.024 * drape, Math.sin(x * 33) * (0.028 + drape * 0.045));
  }
  geometry.computeVertexNormals();
  return geometry;
}

function makeWordmark() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024; canvas.height = 256;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "#d0ad71";
    context.font = "112px Georgia, serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("A I R A", 512, 129);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function archPath(width: number, height: number) {
  const path = new THREE.Shape();
  const rise = width * 0.26;
  const spring = height - rise;
  path.moveTo(-width / 2, 0);
  path.lineTo(width / 2, 0);
  path.lineTo(width / 2, spring);
  path.absellipse(0, spring, width / 2, rise, 0, Math.PI, false, 0);
  path.lineTo(-width / 2, 0);
  return path;
}

function archRing(width: number, height: number, thickness: number) {
  const shape = archPath(width, height);
  const inner = archPath(width - thickness * 2, height - thickness * 2);
  const points = inner.getPoints(48).map((point) => new THREE.Vector2(point.x, point.y + thickness));
  shape.holes.push(new THREE.Path(points.reverse()));
  return new THREE.ExtrudeGeometry(shape, { depth: thickness * 0.65, bevelEnabled: true, bevelThickness: 0.022, bevelSize: 0.018, bevelSegments: 2, steps: 1, curveSegments: 36 });
}

function photoArch(width: number, height: number) {
  const geometry = new THREE.ShapeGeometry(archPath(width, height), 36);
  const position = geometry.getAttribute("position");
  const uv = geometry.getAttribute("uv");
  for (let i = 0; i < position.count; i++) uv.setXY(i, position.getX(i) / width + 0.5, position.getY(i) / height);
  return geometry;
}

function cropTexture(source: THREE.Texture, aspect: number, horizontalFocus = 0.5) {
  const texture = source.clone();
  texture.colorSpace = THREE.SRGBColorSpace;
  const image = source.image as { width: number; height: number };
  const imageAspect = image.width / image.height;
  if (imageAspect > aspect) {
    texture.repeat.x = aspect / imageAspect;
    texture.offset.x = (1 - texture.repeat.x) * horizontalFocus;
  } else {
    texture.repeat.y = imageAspect / aspect;
    texture.offset.y = (1 - texture.repeat.y) / 2;
  }
  texture.needsUpdate = true;
  return texture;
}

function Box({ position, size, material, shadow = false }: { position: [number, number, number]; size: [number, number, number]; material: THREE.Material; shadow?: boolean }) {
  return <mesh position={position} material={material} castShadow={shadow} receiveShadow><boxGeometry args={size} /></mesh>;
}

function FoldedSilks({ material }: { material: THREE.MeshPhysicalMaterial }) {
  const cloth = useRef<THREE.InstancedMesh>(null);
  const edging = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(roundedFoldGeometry, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const bundles = useMemo(() => {
    const result: { position: [number, number, number]; scale: [number, number, number]; color: string }[] = [];
    [-1, 1].forEach((side) => [5, -1, -7, -13].forEach((bay, bayIndex) => {
      for (let shelf = 0; shelf < 5; shelf++) for (let column = 0; column < 4; column++) {
        const count = 3 + ((shelf + column + bayIndex) % 2);
        for (let layer = 0; layer < count; layer++) result.push({
          position: [side * (5.06 + layer * 0.006), 0.59 + shelf * 0.63 + layer * 0.078, bay - 1.26 + column * 0.84 + layer * 0.014],
          scale: [0.78, 0.066, 0.64 + ((column + shelf) % 2) * 0.07],
          color: SILKS[(column * 2 + shelf + bayIndex * 3 + layer + (side === 1 ? 2 : 0)) % SILKS.length],
        });
      }
    }));
    return result;
  }, []);
  useEffect(() => {
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    bundles.forEach((bundle, i) => {
      dummy.position.set(...bundle.position); dummy.scale.set(...bundle.scale); dummy.updateMatrix();
      cloth.current?.setMatrixAt(i, dummy.matrix); cloth.current?.setColorAt(i, color.set(bundle.color));
      const side = Math.sign(bundle.position[0]);
      dummy.position.x = bundle.position[0] - side * 0.395;
      dummy.scale.set(0.012, 0.036, bundle.scale[2] * 0.82); dummy.updateMatrix(); edging.current?.setMatrixAt(i, dummy.matrix);
    });
    if (cloth.current) { cloth.current.instanceMatrix.needsUpdate = true; if (cloth.current.instanceColor) cloth.current.instanceColor.needsUpdate = true; }
    if (edging.current) edging.current.instanceMatrix.needsUpdate = true;
  }, [bundles]);
  return <>
    <instancedMesh ref={cloth} args={[geometry, material, bundles.length]} castShadow receiveShadow />
    <instancedMesh ref={edging} args={[undefined, undefined, bundles.length]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#bd9b63" roughness={0.54} metalness={0.4} /></instancedMesh>
  </>;
}

function CampaignDisplay({ poster, videoSrc, videoElementRef, reducedMotion }: { poster: THREE.Texture; videoSrc?: string; videoElementRef?: RefObject<HTMLVideoElement | null>; reducedMotion?: boolean }) {
  const [videoMap, setVideoMap] = useState<THREE.VideoTexture | null>(null);
  useEffect(() => {
    setVideoMap(null);
    if ((!videoSrc && !videoElementRef?.current) || reducedMotion) return;
    const owned = !videoElementRef?.current;
    const video = videoElementRef?.current ?? document.createElement("video");
    if (owned) {
      video.muted = true; video.loop = false; video.playsInline = true; video.preload = "auto";
      video.crossOrigin = "anonymous"; video.src = videoSrc!;
    }
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    const loaded = () => { setVideoMap(texture); if (owned) void video.play().catch(() => setVideoMap(null)); };
    const visibility = () => { if (document.hidden) video.pause(); else void video.play().catch(() => {}); };
    video.addEventListener("loadeddata", loaded);
    if (video.readyState >= 2) loaded();
    if (owned) { document.addEventListener("visibilitychange", visibility); video.load(); }
    return () => {
      video.removeEventListener("loadeddata", loaded); document.removeEventListener("visibilitychange", visibility);
      if (owned) { video.pause(); video.removeAttribute("src"); video.load(); }
      texture.dispose();
    };
  }, [videoSrc, videoElementRef, reducedMotion]);
  return <mesh position={[0, 2.67, -14.82]}><planeGeometry args={[5.4, 3.0375]} /><meshBasicMaterial map={videoMap ?? poster} toneMapped={false} /></mesh>;
}

function CameraJourney({ progress, reducedMotion }: Pick<BoutiqueProps, "progress" | "reducedMotion">) {
  const { camera, size, pointer } = useThree();
  const smooth = useRef(0);
  const look = useMemo(() => new THREE.Vector3(), []);
  const position = useMemo(() => new THREE.Vector3(), []);
  const track = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 2.35, 9.5), new THREE.Vector3(-0.22, 2.22, 3.5),
    new THREE.Vector3(0.23, 2.28, -2.9), new THREE.Vector3(0, 2.67, -7.7),
    new THREE.Vector3(0, 2.67, -11.4),
  ]), []);
  useFrame((_, delta) => {
    const target = reducedMotion ? 0 : THREE.MathUtils.clamp(progress.current ?? 0, 0, 1);
    smooth.current = THREE.MathUtils.damp(smooth.current, target, 8, Math.min(delta, 0.05));
    track.getPoint(smooth.current, position);
    const aspect = size.width / Math.max(size.height, 1);
    const portrait = aspect < 0.8;
    const perspective = camera as THREE.PerspectiveCamera;
    const desiredFov = portrait ? 69 : 54;
    if (perspective.fov !== desiredFov) { perspective.fov = desiredFov; perspective.updateProjectionMatrix(); }
    // End on a full-bleed image, ready to dissolve into the matching HTML film.
    const halfFov = Math.tan(THREE.MathUtils.degToRad(desiredFov / 2));
    const endDistance = Math.min(3.0375 / (2 * halfFov), 5.4 / (2 * halfFov * aspect)) * 0.97;
    position.z += smooth.current ** 4 * (-14.82 + endDistance + 11.4);
    const sway = reducedMotion ? 0 : (1 - smooth.current) * 0.12;
    position.x += pointer.x * sway; position.y += pointer.y * sway * 0.45;
    camera.position.copy(position);
    look.set(pointer.x * sway * 0.25, THREE.MathUtils.lerp(2.45, 2.67, smooth.current), -14.9);
    camera.lookAt(look);
  });
  return null;
}

function Atelier({ progress, onReady, videoSrc, videoElementRef, reducedMotion }: Omit<BoutiqueProps, "onFailure">) {
  const { size } = useThree();
  const portraitView = size.width / Math.max(size.height, 1) < 0.8;
  const loaded = useLoader(THREE.TextureLoader, [...PHOTOS.map((name) => `/images/${name}.jpg`), "/images/hero-poster.jpg", "/images/campaign.jpg"]);
  const maps = useMemo(() => loaded.map((texture, i) => cropTexture(texture, i === 6 ? 16 / 9 : 1.82 / 3.35, i === 0 ? 0 : i === 7 ? 0.73 : 0.5)), [loaded]);
  const materials = useMemo(() => {
    const stone = makeSurface("stone"), weave = makeSurface("weave"), wood = makeSurface("wood"), plaster = makeSurface("plaster");
    return {
      textures: [stone, weave, wood, plaster],
      floor: new THREE.MeshPhysicalMaterial({ map: stone, bumpMap: stone, bumpScale: 0.013, roughness: 0.46, metalness: 0.015, clearcoat: 0.18, clearcoatRoughness: 0.48 }),
      wall: new THREE.MeshStandardMaterial({ map: plaster, bumpMap: plaster, bumpScale: 0.025, roughness: 0.94 }),
      inset: new THREE.MeshStandardMaterial({ color: "#522932", bumpMap: plaster, bumpScale: 0.014, roughness: 0.96 }),
      wood: new THREE.MeshStandardMaterial({ map: wood, bumpMap: wood, bumpScale: 0.018, roughness: 0.51 }),
      brass: new THREE.MeshStandardMaterial({ color: "#a78854", metalness: 0.66, roughness: 0.43 }),
      stone: new THREE.MeshStandardMaterial({ color: "#d1bfa3", map: plaster, roughness: 0.7 }),
      silk: new THREE.MeshPhysicalMaterial({ bumpMap: weave, bumpScale: 0.024, roughness: 0.62, sheen: 0.92, sheenRoughness: 0.48, sheenColor: new THREE.Color("#d9c6b0") }),
      glow: new THREE.MeshBasicMaterial({ color: "#f2d7ab", toneMapped: false }),
      grout: new THREE.MeshStandardMaterial({ color: "#bdaf99", roughness: 0.85 }),
    };
  }, []);
  const portal = useMemo(() => archRing(10.4, 5.85, 0.13), []);
  const rearArch = useMemo(() => archRing(7.2, 5.2, 0.09), []);
  const portraitRing = useMemo(() => archRing(1.94, 3.47, 0.055), []);
  const portraitGeometry = useMemo(() => photoArch(1.82, 3.35), []);
  const wordmark = useMemo(makeWordmark, []);
  const foldGeometry = useMemo(roundedFoldGeometry, []);
  const drapeGeometry = useMemo(drapedFabricGeometry, []);
  const displayFabrics = useMemo(() => ["#a1aa91", "#bc9299", "#cab69b", "#735364"].map((color) => {
    const material = materials.silk.clone(); material.color.set(color); material.side = THREE.DoubleSide; return material;
  }), [materials]);
  const spotlightTargets = useMemo(() => [[-3.45, 1.25, 4.8], [2.95, 1.8, 1.4], [-5.3, 2.8, -4], [5.3, 2.8, -10]].map(([x, y, z]) => {
    const target = new THREE.Object3D(); target.position.set(x, y, z); return target;
  }), []);
  const readiness = useRef(0);
  useFrame(() => { if (readiness.current < 3) { readiness.current++; if (readiness.current === 3) onReady(); } });
  useEffect(() => () => {
    maps.forEach((map) => map.dispose());
    wordmark.dispose();
    materials.textures.forEach((texture) => texture.dispose());
    Object.values(materials).forEach((material) => { if (material instanceof THREE.Material) material.dispose(); });
    displayFabrics.forEach((material) => material.dispose());
    [portal, rearArch, portraitRing, portraitGeometry, foldGeometry, drapeGeometry].forEach((geometry) => geometry.dispose());
  }, [maps, wordmark, materials, portal, rearArch, portraitRing, portraitGeometry, foldGeometry, drapeGeometry, displayFabrics]);

  return <>
    <color attach="background" args={["#d5c6b0"]} />
    <fog attach="fog" args={["#ab9480", 34, 68]} />
    <ambientLight intensity={0.72} color="#ece1d1" />
    <hemisphereLight args={["#f8ead7", "#806456", 0.9]} />
    <directionalLight position={[-3, 7, 7]} color="#fff0db" intensity={1.9} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={8} shadow-camera-bottom={-18} shadow-normalBias={0.04} shadow-bias={-0.0002} shadow-radius={4} />
    <pointLight position={[0, 4.5, -11]} color="#ffe6c8" intensity={24} distance={14} decay={2} />
    <pointLight position={[0, 4.9, -2]} color="#ffe0bf" intensity={23} distance={15} decay={2} />
    <pointLight position={[0, 4.7, 6]} color="#ffe8cc" intensity={19} distance={13} decay={2} />
    {spotlightTargets.map((target, i) => <group key={`spot-${i}`}>
      <primitive object={target} />
      <spotLight position={[target.position.x * 0.8, 5.3, target.position.z + 1.3]} target={target} color="#fff0d6" intensity={27} distance={9} decay={2} angle={0.48} penumbra={0.85} />
    </group>)}
    <CameraJourney progress={progress} reducedMotion={reducedMotion} />

    <Box position={[0, -0.14, -3.1]} size={[12, 0.25, 26.5]} material={materials.floor} />
    <Box position={[0, 6.03, -3.1]} size={[12, 0.15, 26.5]} material={materials.wall} />
    <Box position={[-5.95, 3, -3.1]} size={[0.22, 6, 26.5]} material={materials.wall} />
    <Box position={[5.95, 3, -3.1]} size={[0.22, 6, 26.5]} material={materials.wall} />
    <Box position={[0, 3, -15.1]} size={[12, 6, 0.3]} material={materials.inset} />
    {[-1, 1].map((side) => <group key={side}>
      <Box position={[side * 5.76, 0.22, -3.1]} size={[0.15, 0.4, 26]} material={materials.stone} />
      <Box position={[side * 5.68, 4.48, -3.1]} size={[0.25, 0.085, 26]} material={materials.brass} />
      <Box position={[side * 5.58, 5.5, -3.1]} size={[0.45, 0.22, 26]} material={materials.stone} />
      <Box position={[side * 5.6, 5.34, -3.1]} size={[0.12, 0.04, 26]} material={materials.glow} />
      {[2, -4, -10].map((z) => <group key={`panel-${z}`}>
        <Box position={[side * 5.81, 2.25, z]} size={[0.075, 4.12, 2.24]} material={materials.inset} />
        {[-1.17, 1.17].map((edge) => <Box key={edge} position={[side * 5.75, 2.25, z + edge]} size={[0.09, 4.15, 0.05]} material={materials.stone} />)}
        <Box position={[side * 5.75, 4.33, z]} size={[0.09, 0.05, 2.38]} material={materials.stone} />
      </group>)}
    </group>)}
    {Array.from({ length: 14 }, (_, i) => <Box key={`grout-z-${i}`} position={[0, -0.008, 9.5 - i * 1.9]} size={[11.7, 0.007, 0.012]} material={materials.grout} />)}
    {[-4, -2, 0, 2, 4].map((x) => <Box key={`grout-x-${x}`} position={[x, -0.008, -3.1]} size={[0.012, 0.007, 26.5]} material={materials.grout} />)}
    {/* A restrained brass runner leads the eye through the open central aisle. */}
    {[-2.05, 2.05].map((x) => <Box key={x} position={[x, 0, -3]} size={[0.023, 0.007, 26]} material={materials.brass} />)}

    {[-1, 1].map((side) => [5, -1, -7, -13].map((z) => <group key={`${side}-${z}`}>
      <Box position={[side * 5.69, 2.01, z]} size={[0.085, 3.45, 3.57]} material={materials.inset} />
      <Box position={[side * 5.14, 0.31, z]} size={[1.13, 0.42, 3.57]} material={materials.wood} shadow />
      <Box position={[side * 4.56, 0.47, z]} size={[0.022, 0.037, 3.57]} material={materials.brass} />
      {[0.52, 1.15, 1.78, 2.41, 3.04, 3.67].map((y, index) => <group key={y}>
        <Box position={[side * 5.15, y, z]} size={[1.09, 0.058, 3.57]} material={materials.wood} shadow />
        <Box position={[side * 4.592, y + 0.009, z]} size={[0.018, 0.032, 3.57]} material={materials.brass} />
        {index > 0 && <Box position={[side * 5.46, y - 0.046, z]} size={[0.018, 0.009, 3.42]} material={materials.glow} />}
      </group>)}
      {[-1.79, 1.79].map((offset) => <Box key={offset} position={[side * 5.13, 2.0, z + offset]} size={[1.12, 3.42, 0.068]} material={materials.wood} shadow />)}
    </group>))}
    <FoldedSilks material={materials.silk} />

    {/* Objects in the entrance break up the aisle's symmetry and give its depth a human scale. */}
    <group position={[-3.18, 0, 5.06]} rotation={[0, -0.1, 0]}>
      <Box position={[0, 0.83, 0]} size={[2.67, 0.105, 1.18]} material={materials.wood} shadow />
      <Box position={[0, 0.90, 0]} size={[2.71, 0.03, 1.22]} material={materials.stone} shadow />
      <Box position={[0, 0.24, 0]} size={[2.43, 0.055, 0.97]} material={materials.wood} shadow />
      {[-1.14, 1.14].map((x) => [-0.43, 0.43].map((z) => <mesh key={`${x}-${z}`} position={[x, 0.43, z]} material={materials.brass} castShadow><cylinderGeometry args={[0.026, 0.032, 0.85, 12]} /></mesh>))}
      {[-0.8, 0, 0.8].map((x, pile) => [0, 1, 2].map((layer) => <group key={`${pile}-${layer}`}>
        <mesh geometry={foldGeometry} material={displayFabrics[(pile + layer) % displayFabrics.length]} position={[x + layer * 0.014, 0.961 + layer * 0.091, -0.06 + layer * 0.02]} scale={[0.69, 0.083, 0.79]} rotation={[0, (pile - 1) * 0.045, 0]} castShadow receiveShadow />
        <Box position={[x + layer * 0.014, 0.97 + layer * 0.091, 0.339 + layer * 0.02]} size={[0.57, 0.018, 0.009]} material={materials.brass} />
      </group>))}
    </group>

    <group position={[-3.67, 0, 1.26]} rotation={[0, 0.48, 0]}>
      {[-1.29, 1.29].map((x) => <group key={x}>
        <mesh position={[x, 1.69, 0]} material={materials.brass} castShadow><cylinderGeometry args={[0.022, 0.027, 3.32, 12]} /></mesh>
        <Box position={[x, 0.045, 0]} size={[0.24, 0.085, 0.59]} material={materials.stone} shadow />
      </group>)}
      <mesh position={[0, 3.34, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.brass}><cylinderGeometry args={[0.024, 0.024, 2.65, 12]} /></mesh>
      {[-0.86, 0, 0.86].map((x, i) => <group key={x}>
        <mesh geometry={drapeGeometry} material={displayFabrics[i]} position={[x, 2.075, 0.07]} castShadow receiveShadow />
        <mesh geometry={drapeGeometry} material={displayFabrics[i]} position={[x, 2.073, 0.025]} scale={[0.99, 1, 0.65]} />
        <mesh position={[x, 3.25, 0.04]} material={materials.brass}><torusGeometry args={[0.083, 0.008, 6, 16]} /></mesh>
      </group>)}
    </group>

    <group position={[portraitView ? 1.28 : 3.82, 0.13, 3.5]} rotation={[0, -0.14, 0]} scale={[1.1, 1.23, 1]}>
      <Box position={[0, -0.02, 0]} size={[2.03, 0.22, 0.57]} material={materials.stone} shadow />
      <Box position={[0, 0.102, 0.025]} size={[1.92, 0.027, 0.47]} material={materials.brass} />
      <mesh geometry={portraitRing} material={materials.brass} position={[0, 0.1, 0]} castShadow />
      <mesh geometry={portraitGeometry} position={[0, 0.16, 0.016]}><meshBasicMaterial map={maps[7]} toneMapped={false} /></mesh>
      <Box position={[0, 0.22, -0.14]} size={[0.085, 0.4, 0.12]} material={materials.brass} />
    </group>

    {maps.slice(0, 6).map((map, i) => {
      const side = i < 3 ? -1 : 1;
      return <group key={PHOTOS[i]} position={[side * 5.72, 0.67, 2 - (i % 3) * 6]} rotation={[0, side === -1 ? Math.PI / 2 : -Math.PI / 2, 0]}>
        <mesh geometry={portraitRing} material={materials.brass} castShadow />
        <mesh geometry={portraitGeometry} position={[0, 0.06, 0.016]}><meshBasicMaterial map={map} toneMapped={false} /></mesh>
        <Box position={[0, 3.63, 0.18]} size={[1.02, 0.045, 0.16]} material={materials.brass} />
        <Box position={[0, 3.60, 0.19]} size={[0.8, 0.015, 0.09]} material={materials.glow} />
      </group>;
    })}

    {[7.3, 0.3, -6.7].map((z, i) => <group key={z}>
      <mesh geometry={portal} material={materials.stone} position={[0, 0, z - 0.09]} scale={[1.025, 1.012, 1]} castShadow />
      <mesh geometry={portal} material={materials.brass} position={[0, 0, z]} castShadow />
      {[-1, 1].map((side) => <group key={side}>
        <Box position={[side * 5.25, 2.12, z - 0.07]} size={[0.20, 4.22, 0.28]} material={materials.stone} shadow />
        <Box position={[side * 5.25, 0.2, z]} size={[0.40, 0.4, 0.5]} material={materials.stone} />
      </group>)}
      <Box position={[0, 5.97, z - 1.8]} size={[11.7, 0.16, 0.13]} material={materials.wood} />
      <group position={[0, 5.6, z - 2.2]}>
        <mesh material={materials.brass} position={[0, 0.02, 0]}><cylinderGeometry args={[0.015, 0.015, 0.7, 8]} /></mesh>
        <mesh material={materials.brass} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}><torusGeometry args={[0.59 + i * 0.025, 0.026, 8, 48]} /></mesh>
        <mesh material={materials.glow} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.416, 0]}><torusGeometry args={[0.57 + i * 0.025, 0.010, 6, 48]} /></mesh>
      </group>
    </group>)}

    <mesh geometry={rearArch} material={materials.brass} position={[0, 0.26, -14.91]} />
    <Box position={[0, 0.69, -14.83]} size={[6.25, 0.10, 0.12]} material={materials.brass} />
    <Box position={[0, 2.67, -14.94]} size={[5.57, 3.21, 0.12]} material={materials.brass} />
    <mesh position={[0, 4.69, -14.88]}><planeGeometry args={[2.55, 0.638]} /><meshBasicMaterial map={wordmark} transparent toneMapped={false} depthWrite={false} /></mesh>
    <CampaignDisplay poster={maps[6]} videoSrc={videoSrc} videoElementRef={videoElementRef} reducedMotion={reducedMotion} />
    <Box position={[0, 5.15, -14.8]} size={[4.2, 0.015, 0.08]} material={materials.glow} />
  </>;
}

export default function BoutiqueScene(props: BoutiqueProps) {
  const contextCleanup = useRef<(() => void) | null>(null);
  useEffect(() => () => contextCleanup.current?.(), []);
  return <div data-testid="boutique-scene" style={{ position: "absolute", inset: 0 }} aria-hidden="true">
    <SceneBoundary onFailure={props.onFailure}>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 2.35, 9.5], fov: 54, near: 0.05, far: 80 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        fallback={<SceneFailure onFailure={props.onFailure} />}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.15;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          const lost = (event: Event) => { event.preventDefault(); props.onFailure(); };
          gl.domElement.addEventListener("webglcontextlost", lost);
          contextCleanup.current = () => gl.domElement.removeEventListener("webglcontextlost", lost);
        }}
      >
        <Suspense fallback={null}><Atelier {...props} /></Suspense>
      </Canvas>
    </SceneBoundary>
  </div>;
}

function SceneFailure({ onFailure }: { onFailure: () => void }) {
  useEffect(() => { onFailure(); }, [onFailure]);
  return null;
}
