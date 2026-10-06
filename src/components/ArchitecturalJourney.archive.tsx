"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const BoutiqueScene = dynamic(() => import("./BoutiqueScene"), { ssr: false });
const CssBoutiqueScene = dynamic(() => import("./CssBoutiqueScene"), { ssr: false });
gsap.registerPlugin(ScrollTrigger);

function SilkPattern() {
  const silkId = useId();
  return <svg className="silk-pattern" viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <pattern id={`${silkId}-motif`} width="180" height="210" patternUnits="userSpaceOnUse">
        <path d="M85 25C142 41 154 103 119 137C87 168 42 144 48 111C52 88 84 76 88 99C92 116 72 124 65 112C58 136 91 142 107 122C133 88 109 59 85 25Z" fill="#c6a266" fillOpacity=".22" />
        <path d="M85 25C142 41 154 103 119 137C87 168 42 144 48 111C52 88 84 76 88 99C92 116 72 124 65 112C58 136 91 142 107 122C133 88 109 59 85 25Z" fill="none" stroke="#c1a26b" strokeWidth="1.4" />
        <path d="M87 43C123 64 130 99 109 119M58 111C58 91 78 77 87 70" fill="none" stroke="#c1a26b" strokeWidth=".6" />
        <path d="M90 171v22m-11-11h22m-19-8 16 16m0-16-16 16M19 48v16m-8-8h16m-14-6 12 12m0-12-12 12M155 161v16m-8-8h16m-14-6 12 12m0-12-12 12" fill="none" stroke="#c1a26b" strokeWidth="1" />
        <circle cx="24" cy="151" r="2" fill="#c1a26b" /><circle cx="149" cy="57" r="2" fill="#c1a26b" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((petal) => <g key={petal}><ellipse cx="90" cy="174" rx="2.5" ry="6" fill="#c1a26b" fillOpacity=".5" transform={`rotate(${petal * 45} 90 182)`} /><ellipse cx="149" cy="45" rx="1.5" ry="4" fill="#c1a26b" fillOpacity=".4" transform={`rotate(${petal * 45} 149 57)`} /></g>)}
        <path d="M77 33q18 14 26 32m6 10q11 31-8 45M42 112q-2 21 18 31m10 5q17 7 35-2" fill="none" stroke="#c1a26b" strokeWidth=".7" strokeDasharray="1 3" />
      </pattern>
      <linearGradient id={`${silkId}-folds`}><stop stopColor="#080006" stopOpacity=".45" /><stop offset=".18" stopColor="#eee0bd" stopOpacity=".08" /><stop offset=".35" stopColor="#060003" stopOpacity=".23" /><stop offset=".54" stopColor="#e6c5a6" stopOpacity=".1" /><stop offset=".73" stopColor="#030001" stopOpacity=".35" /><stop offset="1" stopColor="#e9d8b9" stopOpacity=".07" /></linearGradient>
    </defs>
    <rect width="600" height="900" fill="#64172b" /><rect width="600" height="900" fill={`url(#${silkId}-motif)`} /><rect width="600" height="900" fill={`url(#${silkId}-folds)`} />
    <path d="M570 0v900M577 0v900M584 0v900" stroke="#b99b64" strokeWidth="1" opacity=".65" />
  </svg>;
}

export default function ImmersiveJourney({ children, videoSrc, onExplore }: { children: ReactNode; videoSrc?: string; onExplore: () => void }) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const journeyProgress = useRef(0);
  const videoElement = useRef<HTMLVideoElement>(null);
  const progressIndicator = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [entranceDone, setEntranceDone] = useState(false);
  const played = useRef(false);
  const entranceStarted = useRef(false);
  const isStatic = reduced;
  const onReady = useCallback(() => {
    setReady(true);
    if (journeyProgress.current > 0.55 && videoElement.current) {
      played.current = true;
      videoElement.current.play().catch(() => { played.current = false; });
    }
  }, []);
  const onFailure = useCallback(() => { setFailed(true); setReady(true); }, []);

  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { setReduced(query.matches); if (query.matches) videoElement.current?.pause(); };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!stage.current || !section.current) return;
    const context = gsap.context(() => {
      if (isStatic) {
        journeyProgress.current = 0;
        gsap.set(".journey-introduction", { autoAlpha: 1, y: 0 });
        gsap.set(".journey-caption", { autoAlpha: 0 });
        stage.current?.style.setProperty("--campaign-opacity", "1");
        return;
      }
      const state = { amount: 0 };
      gsap.timeline({ scrollTrigger: {
        id: "aira-walkthrough",
        trigger: section.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.8,
        invalidateOnRefresh: true,
      } }).to(state, { amount: 1, duration: 1, ease: "none", onUpdate: () => {
        const p = state.amount;
        journeyProgress.current = p;
        if (stage.current) {
          stage.current.dataset.journeyProgress = p.toFixed(3);
          stage.current.style.setProperty("--campaign-opacity", failed ? "0" : String(gsap.utils.clamp(0, 1, (p - 0.85) / 0.14)));
        }
        const percent = Math.round(p * 100);
        progressIndicator.current?.setAttribute("aria-valuenow", String(percent));
        progressIndicator.current?.style.setProperty("--journey-progress", String(p));
        const chapter = p < 0.4 ? 0 : p < 0.76 ? 1 : 2;
        const cue = stage.current?.querySelector<HTMLElement>(".journey-scroll-cue-copy");
        const cueCopy = p > 0.76 ? "Scroll to discover" : "Scroll to enter";
        if (cue && cue.textContent !== cueCopy) cue.textContent = cueCopy;
        stage.current?.querySelectorAll<HTMLButtonElement>(".journey-chapter").forEach((button, i) => button.setAttribute("aria-current", i === chapter ? "step" : "false"));
        if (p > 0.55 && !played.current && ready && videoElement.current) {
          played.current = true;
          videoElement.current.play().catch(() => { played.current = false; });
        }
      } });
      const scroll = { trigger: section.current, start: "top top", end: "bottom bottom", scrub: 0.8 };
      gsap.timeline({ scrollTrigger: scroll })
        .to(".journey-introduction", { autoAlpha: 0, y: -35, duration: 0.13, ease: "none" }, 0.02)
        .fromTo(".caption-thread", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.06 }, 0.19)
        .to(".caption-thread", { autoAlpha: 0, y: -16, duration: 0.05 }, 0.38)
        .fromTo(".caption-perspective", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.07 }, 0.45)
        .to(".caption-perspective", { autoAlpha: 0, y: -16, duration: 0.06 }, 0.68)
        .fromTo(".caption-campaign", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.09 }, 0.81)
        .to({}, { duration: 0.1 }, 0.9);
    }, section);
    return () => context.revert();
  }, [isStatic, ready, failed]);

  useEffect(() => {
    if (reduced) { setEntranceDone(true); return; }
    if (!ready || entranceStarted.current) return;
    entranceStarted.current = true;
    const context = gsap.context(() => {
      gsap.timeline({ defaults: { ease: "power3.inOut" }, onComplete: () => setEntranceDone(true) })
        .to(".silk-entrance-copy", { opacity: 0, y: -12, duration: 0.45 }, 0.25)
        .to(".silk-panel-left", { xPercent: -105, rotationY: -22, duration: 1.8 }, 0.4)
        .to(".silk-panel-right", { xPercent: 105, rotationY: 22, duration: 1.8 }, 0.4)
        .fromTo(".journey .site-header", { opacity: 0 }, { opacity: 1, duration: 1, ease: "power2.out" }, 1.1)
        .fromTo(".journey-eyebrow, .journey-description, .journey-enter", { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.14, duration: 0.9, ease: "power2.out" }, 1.3)
        .fromTo(".journey-title .headline-line > span", { yPercent: 110 }, { yPercent: 0, duration: 1.15, stagger: 0.12, ease: "power3.out" }, 1.25)
        .fromTo(".journey-bottom", { opacity: 0 }, { opacity: 1, duration: 1 }, 1.6);
    }, section);
    ScrollTrigger.refresh();
    return () => context.revert();
  }, [ready, reduced]);

  useEffect(() => {
    const element = videoElement.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) element.pause(); else if (played.current && !element.ended && !reduced) element.play().catch(() => {}); }, { threshold: 0.05 });
    if (stage.current) observer.observe(stage.current);
    return () => { observer.disconnect(); element.pause(); };
  }, [reduced]);

  const goToChapter = (amount: number) => {
    if (isStatic) { onExplore(); return; }
    if (!section.current) return;
    const top = section.current.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (section.current.offsetHeight - window.innerHeight) * amount, behavior: reduced ? "instant" : "smooth" });
  };

  return <section className={`journey${isStatic ? " is-static" : ""}`} ref={section} aria-label="Enter the AIRA atelier: an immersive boutique walkthrough">
    <div className="journey-stage" ref={stage} data-journey-progress="0" data-renderer={failed ? "css-3d" : "webgl"}>
      <div className="journey-fallback"><Image src="/images/hero-poster.jpg" alt="Golden silk in the AIRA campaign" fill preload sizes="100vw" quality={90} /></div>
      {!reduced && <div className="boutique-scene">{failed ? <CssBoutiqueScene progress={journeyProgress} reducedMotion={reduced} videoSrc={videoSrc} videoElementRef={videoElement} onReady={onReady} /> : <BoutiqueScene progress={journeyProgress} onReady={onReady} onFailure={onFailure} videoSrc={videoSrc} videoElementRef={videoElement} reducedMotion={reduced} />}</div>}
      <div className="journey-campaign"><Image src="/images/hero-poster.jpg" alt="AIRA: tradition in motion" fill sizes="100vw" quality={90} />{videoSrc && !failed && <video ref={videoElement} muted playsInline preload="auto" poster="/images/hero-poster.jpg" aria-label="AIRA campaign film"><source src={videoSrc} type="video/mp4" /></video>}</div>
      <div className="journey-shade" />
      {children}
      <div className="journey-introduction">
        <p className="journey-eyebrow eyebrow">An Indian soul. A new perspective.</p>
        <h1 id="hero-title" className="journey-title"><span className="headline-line"><span>More than</span></span><span className="headline-line"><span>a saree<span>.</span></span></span></h1>
        <p className="journey-description">Tradition, reimagined.<br />Step inside the world of AIRA.</p>
        <button className="journey-enter" onClick={() => goToChapter(0.27)}>Enter the atelier <svg viewBox="0 0 32 16" fill="none" aria-hidden="true"><path d="M1 8h28M23 1l7 7-7 7" stroke="currentColor" /></svg></button>
      </div>
      <div className="journey-caption caption-thread"><p className="eyebrow">The art of the saree</p><p>Six expressions.<br /><em>One enduring thread.</em></p></div>
      <div className="journey-caption caption-perspective"><p className="eyebrow">Tradition meets tomorrow</p><p>Every fold,<br /><em>a new perspective.</em></p></div>
      <div className="journey-caption caption-campaign"><p className="eyebrow">The AIRA perspective — Chapter 01</p><p>Tradition<br /><em>in motion.</em></p><button className="journey-collection-link" onClick={onExplore}>Discover six moods <span>↗</span></button></div>
      <div className="journey-bottom">
        <button className="journey-scroll-cue" onClick={() => journeyProgress.current > 0.76 ? onExplore() : goToChapter(0.27)}><span className="journey-scroll-cue-copy">Scroll to enter</span><svg viewBox="0 0 8 26" fill="none" aria-hidden="true"><path d="M4 0v24m-3-3 3 3 3-3" stroke="currentColor" /></svg></button>
        <nav className="journey-chapters" aria-label="Walkthrough chapters"><button className="journey-chapter" aria-current="step" onClick={() => goToChapter(0)}><span>01</span> The atelier</button><button className="journey-chapter" aria-current="false" onClick={() => goToChapter(0.5)}><span>02</span> The perspective</button><button className="journey-chapter" aria-current="false" onClick={() => goToChapter(0.94)}><span>03</span> The expression</button></nav>
        <span className="journey-signature">AIRA · India</span>
        <div ref={progressIndicator} className="journey-progress" role="progressbar" aria-label="Boutique walkthrough progress" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100}><span /></div>
      </div>
      {!entranceDone && !reduced && <div className="silk-entrance" aria-live="polite"><div className="silk-panel silk-panel-left"><SilkPattern /></div><div className="silk-panel silk-panel-right"><SilkPattern /></div><div className="silk-entrance-copy"><span>AIRA</span><p>{ready ? "A world woven for you" : "Opening the atelier"}</p><i /><button onClick={() => setEntranceDone(true)}>Skip introduction</button></div></div>}
    </div>
  </section>;
}
