"use client";

import { useEffect, useRef, type CSSProperties, type RefObject } from "react";

type Props = { progress: RefObject<number>; reducedMotion?: boolean; videoSrc?: string; videoElementRef?: RefObject<HTMLVideoElement | null>; onReady?: () => void };
const UNIT = 160;
const colors = ["#bd9474", "#773944", "#d8c6a4", "#7b826c", "#b87766", "#e6d7be", "#927780", "#536c63"];
const photos = ["heritage", "festive", "minimal", "evening", "bridal", "contemporary"];
type CustomStyle = CSSProperties & { [key: `--${string}`]: string | number };

function Shelf({ index }: { index: number }) {
  return <div className="css-boutique-cabinet">
    <div className="css-boutique-cabinet-crown" />
    {[0, 1, 2, 3, 4].map((row) => <div className="css-boutique-shelf" key={row}>
      {[0, 1, 2, 3].map((pile) => <span className="css-boutique-silks" key={pile} style={{ "--silk": colors[(index + row * 2 + pile) % colors.length], "--silk-secondary": colors[(index + row * 2 + pile + 1) % colors.length], "--pile-height": `${54 + ((pile + row + index) % 3) * 7}px`, "--pile-tilt": `${((pile + row) % 3 - 1) * 1.2}deg` } as CustomStyle} />)}
    </div>)}
    <div className="css-boutique-cabinet-plinth" />
  </div>;
}

function TextileConsole() {
  return <div className="css-boutique-console">
    <div className="css-boutique-plane console-front" />
    <div className="css-boutique-plane console-side" />
    <div className="css-boutique-plane console-top" />
    {[0, 1, 2].map((pile) => <div key={pile} className="css-boutique-console-pile" style={{ left: 35 + pile * 165, top: -46 + pile * 3, "--silk": colors[pile * 2], "--silk-secondary": colors[pile * 2 + 1] } as CustomStyle}><span className="css-boutique-silks" /><div className="console-cloth-top" /></div>)}
    <div className="console-drape" />
  </div>;
}

function HangingSilks() {
  return <div className="css-boutique-hanging-rail"><div className="hanging-rod" />{colors.slice(0, 6).map((color, i) => <div key={color} className="hanging-silk" style={{ left: 30 + i * 70, "--silk": color, transform: `translateZ(${i * 4}px) rotate(${(i % 3 - 1) * 1.5}deg)` } as CustomStyle}><span /></div>)}</div>;
}

function SideWall({ side }: { side: "left" | "right" }) {
  return <div className={`css-boutique-plane css-boutique-wall css-boutique-wall-${side}`}>
    <div className="css-boutique-cornice" />
    <div className="css-boutique-wall-panels">
      {[0, 1, 2, 3].map((bay) => <div className="css-boutique-bay" key={bay}>
        <Shelf index={bay * 2 + (side === "right" ? 3 : 0)} />
        {bay < 3 && <div className="css-boutique-portrait-niche">
          <div className="css-boutique-picture-light" />
          <div className="css-boutique-portrait" style={{ backgroundImage: `url('/images/${photos[bay + (side === "right" ? 3 : 0)]}.jpg')`, backgroundPosition: side === "left" && bay === 0 ? "0% center" : "center" }} />
          <span className="css-boutique-portrait-caption">AIRA · ATELIER</span>
        </div>}
      </div>)}
    </div>
    <div className="css-boutique-wall-skirt" />
  </div>;
}

export default function CssBoutiqueScene({ progress, reducedMotion = false, videoSrc, videoElementRef, onReady }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const state = useRef({ progress: 0, width: 1440, height: 900, pointerX: 0, pointerY: 0 });
  useEffect(() => { onReady?.(); }, [onReady]);
  useEffect(() => {
    const video = videoElementRef?.current;
    if (!video || !stage.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) video.pause();
      else if (video.currentTime > 0 && !video.ended && !reducedMotion) video.play().catch(() => {});
    }, { threshold: 0.05 });
    observer.observe(stage.current);
    return () => { observer.disconnect(); video.pause(); };
  }, [videoElementRef, reducedMotion]);
  useEffect(() => {
    if (!stage.current || !world.current) return;
    const scene = stage.current;
    const room = world.current;
    const observer = new ResizeObserver(([entry]) => {
      state.current.width = entry.contentRect.width;
      state.current.height = entry.contentRect.height;
    });
    observer.observe(scene);
    const pointer = (event: PointerEvent) => {
      state.current.pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      state.current.pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", pointer, { passive: true });
    let request = 0;
    let previous = 0;
    const update = (time: number) => {
      const delta = Math.min((time - previous) / 1000 || 0.016, 0.05);
      previous = time;
      const target = reducedMotion ? 0 : Math.max(0, Math.min(1, progress.current ?? 0));
      const view = state.current;
      view.progress += (target - view.progress) * (1 - Math.exp(-delta * 8));
      const p = view.progress;
      const fov = view.width / Math.max(view.height, 1) < 0.8 ? 69 : 54;
      const perspective = view.height / (2 * Math.tan(fov * Math.PI / 360));
      scene.style.perspective = `${perspective}px`;
      // CSS perspective's eye is at +perspective. Subtract it from the world
      // translation so these positions describe an ordinary moving camera.
      const fullBleedDistance = Math.min(3.0375 * UNIT * perspective / view.height, 5.4 * UNIT * perspective / view.width) * 0.97;
      const endZ = -14.82 * UNIT + fullBleedDistance;
      const travel = p < 0.7 ? 0.65 * (p / 0.7) : 0.65 + 0.35 * ((p - 0.7) / 0.3);
      const cameraZ = 9.5 * UNIT + (endZ - 9.5 * UNIT) * travel;
      const eye = (2.35 + 0.32 * p) * UNIT;
      const sway = reducedMotion ? 0 : (1 - p) * 10;
      const x = -54 * Math.sin(p * Math.PI) + view.pointerX * sway;
      room.style.transform = `translate3d(${-x}px,${eye + view.pointerY * sway * 0.35}px,${perspective - cameraZ}px)`;
      request = window.requestAnimationFrame(update);
    };
    request = window.requestAnimationFrame(update);
    return () => { observer.disconnect(); window.removeEventListener("pointermove", pointer); window.cancelAnimationFrame(request); };
  }, [progress, reducedMotion]);

  return <div className="css-boutique-stage" ref={stage} data-testid="css-boutique-scene" aria-hidden="true">
    <div className="css-boutique-world" ref={world}>
      <div className="css-boutique-plane css-boutique-floor" />
      <div className="css-boutique-plane css-boutique-ceiling" />
      <SideWall side="left" /><SideWall side="right" />
      <TextileConsole />
      <HangingSilks />
      <div className="css-boutique-plane css-boutique-campaign-totem"><div className="campaign-totem-photo" /><div className="campaign-totem-plinth" /><span>THE AIRA PERSPECTIVE</span></div>
      <div className="css-boutique-plane css-boutique-back-wall">
        <div className="css-boutique-rear-arch" />
        <div className="css-boutique-rear-wordmark">AIRA</div>
        <div className="css-boutique-rear-screen">{videoSrc && <video ref={videoElementRef} muted playsInline preload="auto" poster="/images/hero-poster.jpg" aria-label="AIRA campaign film"><source src={videoSrc} type="video/mp4" /></video>}</div>
        <div className="css-boutique-rear-caption">THE ART OF BECOMING</div>
      </div>
      {[7.3, 0.3, -6.7].map((z) => <div className="css-boutique-plane css-boutique-portal" key={z} style={{ transform: `translate3d(0px,-468px,${z * UNIT}px)` }} />)}
      {[5.1, -1.9, -8.9].map((z) => <div className="css-boutique-plane css-boutique-chandelier" key={z} style={{ transform: `translate3d(0px,-846px,${z * UNIT}px) rotateX(-90deg)` }}><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="90" fill="none" stroke="#af9162" strokeWidth="10" /><circle cx="100" cy="100" r="84" fill="none" stroke="#f5ddb4" strokeWidth="3" /></svg></div>)}
    </div>
    <div className="css-boutique-atmosphere" />
  </div>;
}
