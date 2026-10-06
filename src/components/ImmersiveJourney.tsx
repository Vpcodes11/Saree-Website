"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export default function ImmersiveJourney({ children, videoSrc, onExplore }: { children: ReactNode; videoSrc?: string; onExplore: () => void }) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const film = useRef<HTMLVideoElement>(null);
  const progress = useRef(0);
  const played = useRef(false);
  const [ready, setReady] = useState(false);
  const [entranceDone, setEntranceDone] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { setReduced(query.matches); if (query.matches) { setEntranceDone(true); film.current?.pause(); } };
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!ready || reduced || entranceDone) return;
    const context = gsap.context(() => {
      gsap.timeline({ onComplete: () => setEntranceDone(true) })
        .to(".photographic-entrance-copy", { opacity: 0, duration: 0.35 }, 0.25)
        .to(".photographic-silk-left", { xPercent: -104, duration: 1.65, ease: "power3.inOut" }, 0.4)
        .to(".photographic-silk-right", { xPercent: 104, duration: 1.65, ease: "power3.inOut" }, 0.4)
        .to({}, { duration: 0.95 }, 2.05);
      gsap.fromTo(".site-header, .cinema-bottom", { opacity: 0 }, { opacity: 1, duration: 1.2, delay: 1.1 });
      gsap.fromTo(".cinema-title .headline-line > span", { yPercent: 108 }, { yPercent: 0, duration: 1.25, stagger: 0.13, delay: 1.15, ease: "power3.out" });
      gsap.fromTo(".cinema-intro .eyebrow, .cinema-description, .cinema-enter", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, delay: 1.55 });
    }, section);
    return () => {
      context.getTweens().forEach((tween: gsap.core.Tween) => tween.kill());
      if (section.current) {
        gsap.set(section.current.querySelectorAll(".site-header, .cinema-bottom, .cinema-intro .eyebrow, .cinema-description, .cinema-enter"), { opacity: 1, y: 0 });
        gsap.set(section.current.querySelectorAll(".cinema-title .headline-line > span"), { yPercent: 0 });
      }
    };
  }, [ready, reduced, entranceDone]);
  useEffect(() => {
    if (!stage.current || !section.current) return;
    const context = gsap.context(() => {
      if (reduced) { gsap.set(".cinema-intro", { autoAlpha: 1 }); gsap.set(".cinema-caption, .cinema-film", { autoAlpha: 0 }); return; }
      const state = { amount: 0 };
      const timeline = gsap.timeline({ scrollTrigger: { trigger: section.current, start: "top top", end: "bottom bottom", scrub: 0.7, invalidateOnRefresh: true } });
      timeline.to(state, { amount: 1, duration: 1, ease: "none", onUpdate: () => {
        const p = state.amount; progress.current = p;
        if (stage.current) stage.current.dataset.journeyProgress = p.toFixed(3);
        const indicator = stage.current?.querySelector<HTMLElement>(".cinema-progress");
        indicator?.style.setProperty("--progress", String(p)); indicator?.setAttribute("aria-valuenow", String(Math.round(p * 100)));
        const chapter = p < 0.3 ? 0 : p < 0.72 ? 1 : 2;
        stage.current?.querySelectorAll(".cinema-chapter").forEach((button, index) => button.setAttribute("aria-current", index === chapter ? "step" : "false"));
        if (p > 0.68 && !played.current && film.current) { played.current = true; film.current.play().catch(() => { played.current = false; }); }
      } }, 0)
        .to(".cinema-background", { scale: 1.29, xPercent: -2.5, duration: 0.76, ease: "none" }, 0)
        .to(".cinema-models", { scale: 1.42, xPercent: -1.4, duration: 0.76, ease: "none" }, 0)
        .to(".cinema-intro", { autoAlpha: 0, y: -24, duration: 0.12, ease: "none" }, 0.025)
        .fromTo(".cinema-thread", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.2)
        .to(".cinema-thread", { autoAlpha: 0, y: -12, duration: 0.07 }, 0.42)
        .fromTo(".cinema-perspective", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.07 }, 0.47)
        .to(".cinema-perspective", { autoAlpha: 0, duration: 0.08 }, 0.67)
        .to(".cinema-film", { autoAlpha: 1, duration: 0.16, ease: "power1.inOut" }, 0.71)
        .to(".cinema-film-media", { scale: 1.05, duration: 0.29, ease: "none" }, 0.71)
        .fromTo(".cinema-expression", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.84);
    }, section);
    return () => context.revert();
  }, [reduced]);
  useEffect(() => {
    if (reduced || !stage.current) return;
    const element = stage.current;
    const x = gsap.quickTo(element, "--pointer-x", { duration: 1.1, ease: "power2.out" });
    const y = gsap.quickTo(element, "--pointer-y", { duration: 1.1, ease: "power2.out" });
    const move = (event: PointerEvent) => { if (event.pointerType !== "mouse") return; const bounds = element.getBoundingClientRect(); x(((event.clientX - bounds.left) / bounds.width - 0.5) * 12); y(((event.clientY - bounds.top) / bounds.height - 0.5) * 8); };
    const leave = () => { x(0); y(0); };
    element.addEventListener("pointermove", move, { passive: true }); element.addEventListener("pointerleave", leave);
    return () => { element.removeEventListener("pointermove", move); element.removeEventListener("pointerleave", leave); x.tween.kill(); y.tween.kill(); };
  }, [reduced]);
  useEffect(() => {
    const video = film.current; if (!video || !stage.current) return;
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) video.pause(); else if (played.current && !video.ended && !reduced) video.play().catch(() => {}); }, { threshold: 0.05 });
    observer.observe(stage.current); return () => { observer.disconnect(); video.pause(); };
  }, [reduced]);
  const goTo = (amount: number) => { if (reduced) { onExplore(); return; } if (!section.current) return; const top = section.current.getBoundingClientRect().top + scrollY; window.scrollTo({ top: top + (section.current.offsetHeight - innerHeight) * amount, behavior: "smooth" }); };
  return <section ref={section} className={`journey cinematic-journey${reduced ? " is-static" : ""}`} aria-label="The world of AIRA: a photographic boutique journey">
    <div className="journey-stage cinema-stage" ref={stage} data-renderer="photographic-layers" data-journey-progress="0">
      <div className="cinema-picture">
        <div className="cinema-background"><Image src="/images/generated/boutique-plate.webp" alt="An opulent Indian silk boutique with carved walnut shelves and richly layered sarees" fill sizes="100vw" quality={90} preload onLoad={() => setReady(true)} onError={() => { setReady(true); setEntranceDone(true); }} /></div>
        <div className="cinema-models"><Image src="/images/generated/boutique-models.webp" alt="AIRA campaign models in ruby and peacock silk sarees" fill sizes="100vw" quality={90} preload /></div>
      </div>
      <div className="cinema-film"><div className="cinema-film-media"><Image src="/images/hero-poster.jpg" alt="Golden silk in the AIRA campaign" fill sizes="100vw" quality={90} />{videoSrc && <video ref={film} muted playsInline preload="auto" poster="/images/hero-poster.jpg" aria-label="AIRA campaign film"><source src={videoSrc} type="video/mp4" /></video>}</div></div>
      <div className="cinema-shade" />{children}
      <div className="cinema-intro"><p className="eyebrow">Tradition meets tomorrow</p><h1 className="cinema-title"><span className="headline-line"><span>More than</span></span><span className="headline-line"><span>a saree<span>.</span></span></span></h1><p className="cinema-description">A thousand stories. A new expression.<br />For every you. For every moment.</p><button className="cinema-enter" onClick={() => goTo(0.34)}>Explore the world of AIRA <span>↗</span></button></div>
      <div className="cinema-caption cinema-thread"><p className="eyebrow">The art of the weave</p><p>A thousand stories.<br /><em>Woven into one.</em></p></div>
      <div className="cinema-caption cinema-perspective"><p className="eyebrow">The AIRA perspective</p><p>Some traditions<br /><em>are always becoming.</em></p></div>
      <div className="cinema-caption cinema-expression"><p className="eyebrow">An Indian soul. A new perspective.</p><p>Tradition,<br /><em>in motion.</em></p><button className="cinema-discover" onClick={onExplore}>Discover six moods <span>↗</span></button></div>
      <div className="cinema-bottom"><button className="cinema-scroll" onClick={() => progress.current > 0.75 ? onExplore() : goTo(0.34)}>Scroll to discover <span>↓</span></button><nav aria-label="Journey chapters"><button className="cinema-chapter" aria-current="step" onClick={() => goTo(0)}>01 <span>The world</span></button><button className="cinema-chapter" aria-current="false" onClick={() => goTo(0.52)}>02 <span>The weave</span></button><button className="cinema-chapter" aria-current="false" onClick={() => goTo(0.94)}>03 <span>The expression</span></button></nav><span className="cinema-edition">AIRA · Chapter 01</span><div className="cinema-progress" role="progressbar" aria-label="Campaign journey progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}><span /></div></div>
      {!entranceDone && !reduced && <div className="photographic-entrance"><div className="photographic-silk photographic-silk-left" /><div className="photographic-silk photographic-silk-right" /><div className="photographic-entrance-copy"><span>AIRA</span><p>A world woven for you</p><button onClick={() => setEntranceDone(true)}>Skip introduction</button></div></div>}
    </div>
  </section>;
}
