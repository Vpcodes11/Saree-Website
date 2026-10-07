"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./StoreJourney.module.css";

gsap.registerPlugin(ScrollTrigger);

/** A continuous rendered camera path. Scroll seeks the film, including in reverse. */
export default function StoreJourney({
  src,
  mobileSrc,
  poster,
  mobilePoster,
  loadingArtwork,
  children,
  onExplore,
  onReadyChange,
}: {
  src: string;
  mobileSrc?: string;
  poster: string;
  mobilePoster?: string;
  loadingArtwork: string;
  children: ReactNode;
  onExplore: () => void;
  onReadyChange: (ready: boolean) => void;
}) {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const requestedTime = useRef(0);
  const seekingFrame = useRef(0);
  const [media, setMedia] = useState<string>();
  const [bytesProgress, setBytesProgress] = useState<number | null>(null);
  const [decoded, setDecoded] = useState(false);
  const [posterReady, setPosterReady] = useState(false);
  const [entranceReady, setEntranceReady] = useState(false);
  const [error, setError] = useState(false);
  const [delivery, setDelivery] = useState<{
    src: string;
    reduced: boolean;
    poster: string;
  } | null>(null);
  const reduced = delivery?.reduced ?? false;
  const chosenPoster = delivery?.poster ?? poster;
  const staticPreview = reduced || error;
  const ready =
    Boolean(delivery) &&
    (decoded || (staticPreview && posterReady)) &&
    entranceReady;

  useEffect(() => {
    onReadyChange(ready);
  }, [ready, onReadyChange]);

  useEffect(() => {
    let disposed = false;
    setPosterReady(false);
    const still = new Image();
    const settle = () => {
      if (!disposed) setPosterReady(true);
    };
    const timeout = window.setTimeout(settle, 20000);
    still.src = chosenPoster;
    // The video poster and this decode share the cached resource. A failed image must
    // still release the interface so collections remain available.
    still
      .decode()
      .then(settle, settle)
      .finally(() => window.clearTimeout(timeout));
    return () => {
      disposed = true;
      window.clearTimeout(timeout);
    };
  }, [chosenPoster]);

  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    const compact =
      matchMedia("(max-width: 767px)").matches ||
      connection?.saveData ||
      /(^|-)2g$/.test(connection?.effectiveType ?? "");
    // Choose once per visit so resizing does not restart an already downloaded film.
    const chosenSrc = compact && mobileSrc ? mobileSrc : src;
    const update = () =>
      setDelivery({
        src: chosenSrc,
        reduced: query.matches,
        poster: compact && mobilePoster ? mobilePoster : poster,
      });
    update();
    query.addEventListener("change", update);
    const entrance = window.setTimeout(() => setEntranceReady(true), 1650);
    return () => {
      query.removeEventListener("change", update);
      window.clearTimeout(entrance);
    };
  }, [src, mobileSrc, poster, mobilePoster]);

  useEffect(() => {
    if (ready) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [ready]);

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | undefined;
    let disposed = false;
    setDecoded(false);
    setError(false);
    setBytesProgress(null);
    setMedia(undefined);
    if (!delivery || reduced) return;
    const timeout = window.setTimeout(() => {
      if (!disposed) setError(true);
      controller.abort();
    }, 25000);
    (async () => {
      try {
        const response = await fetch(delivery.src, {
          signal: controller.signal,
        });
        if (!response.ok)
          throw new Error(`Store film unavailable (${response.status})`);
        const contentType = response.headers.get("content-type") || "video/mp4";
        if (!contentType.includes("video/"))
          throw new Error("The store asset is not a film");
        const total = Number(response.headers.get("content-length"));
        const reader = response.body?.getReader();
        let blob: Blob;
        if (reader) {
          const chunks: Uint8Array<ArrayBuffer>[] = [];
          let received = 0;
          let reported = -1;
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(new Uint8Array(value));
            received += value.byteLength;
            const progress =
              total > 0
                ? Math.min(100, Math.floor((received / total) * 100))
                : null;
            if (
              progress !== null &&
              progress !== reported &&
              !controller.signal.aborted
            ) {
              reported = progress;
              setBytesProgress(progress);
            }
          }
          blob = new Blob(chunks, { type: contentType });
        } else blob = await response.blob();
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob);
        setMedia(objectUrl);
        setBytesProgress(100);
      } catch {
        if (!disposed) setError(true);
      } finally {
        window.clearTimeout(timeout);
      }
    })();
    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [delivery?.src, reduced]);

  useEffect(() => {
    if (!media || decoded || error) return;
    const timeout = window.setTimeout(() => setError(true), 20000);
    return () => window.clearTimeout(timeout);
  }, [media, decoded, error]);

  useEffect(() => {
    if (!ready || !section.current) return;
    if (staticPreview) {
      ScrollTrigger.refresh();
      return;
    }
    if (!video.current) return;
    const film = video.current;
    const root = section.current;
    const duration = film.duration;
    if (!Number.isFinite(duration) || duration <= 0) {
      setError(true);
      return;
    }
    film.pause();
    // One decoded seek at a time; pending scroll updates always replace the target.
    const seek = () => {
      if (seekingFrame.current) return;
      seekingFrame.current = requestAnimationFrame(() => {
        seekingFrame.current = 0;
        if (
          !film.seeking &&
          Math.abs(film.currentTime - requestedTime.current) >= 1 / 24
        )
          film.currentTime = requestedTime.current;
      });
    };
    film.addEventListener("seeked", seek);
    const context = gsap.context(() => {
      const position = { value: 0 };
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.22,
          invalidateOnRefresh: true,
        },
      });
      timeline
        .to(
          position,
          {
            value: 1,
            duration: 1,
            ease: "none",
            onUpdate: () => {
              requestedTime.current =
                position.value * Math.max(0, duration - 1 / 24);
              root.dataset.storeProgress = position.value.toFixed(3);
              seek();
            },
          },
          0,
        )
        .to(
          `.${styles.intro}`,
          { autoAlpha: 0, y: -28, duration: 0.055, ease: "none" },
          0.018,
        )
        .to(`.${styles.journeyLine} span`, { scaleX: 1, duration: 1, ease: "none" }, 0)
        .fromTo(
          `.${styles.weave}`,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.06 },
          0.22,
        )
        .to(`.${styles.weave}`, { autoAlpha: 0, duration: 0.06 }, 0.46)
        .fromTo(
          `.${styles.memory}`,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.06 },
          0.6,
        )
        .to(`.${styles.memory}`, { autoAlpha: 0, duration: 0.07 }, 0.86);
    }, root);
    ScrollTrigger.refresh();
    return () => {
      context.revert();
      film.removeEventListener("seeked", seek);
      cancelAnimationFrame(seekingFrame.current);
      seekingFrame.current = 0;
    };
  }, [ready, staticPreview]);

  const enterStore = () => {
    if (staticPreview || !section.current) {
      onExplore();
      return;
    }
    const bounds = section.current.getBoundingClientRect();
    const nextStop = Math.min(1, Math.max(0.27, Number(section.current.dataset.storeProgress ?? 0) + 0.2));
    window.scrollTo({
      top: window.scrollY + bounds.top + (bounds.height - innerHeight) * nextStop,
      behavior: "smooth",
    });
  };

  return (
    <section
      ref={section}
      className={`${styles.journey} ${staticPreview ? styles.static : ""}`}
      data-store-progress="0"
      aria-label="AIRA store walkthrough"
      aria-busy={!ready}
    >
      <div className={styles.stage}>
        <div className={styles.sceneFrame}>
        {staticPreview ? (
          // Reuse the decoded video poster, including its cached original resource.
          // A still is an image rather than an unplayable media control.
          <img
            className={styles.film}
            src={chosenPoster}
            alt="The AIRA private salon: folded saree libraries, individual paisley silk drapes, brass and crystal chandeliers, and ivory marble"
          />
        ) : (
          <video
            ref={video}
            className={styles.film}
            src={media}
            poster={chosenPoster}
            muted
            playsInline
            preload={media ? "auto" : "none"}
            onLoadedData={(event) => {
              // Paint the decoded portrait frame rather than the landscape poster.
              // Paused videos otherwise keep their poster until their first seek.
              event.currentTarget.currentTime = 0.001;
              setDecoded(true);
            }}
            onError={() => {
              if (media && !staticPreview) setError(true);
            }}
            aria-label="Scroll-controlled journey through the AIRA store"
          />
        )}
        <div className={styles.sceneTone} aria-hidden="true" />
        </div>
        {error && (
          <p className="visually-hidden" role="status">
            The store walkthrough could not load. You can still explore the
            collections.
          </p>
        )}
        <div className={styles.header} inert={!ready}>
          {children}
        </div>
        <div className={styles.intro} inert={!ready}>
          <p className={styles.eyebrow}>The private salon</p>
          <h1>
            A world <em>within.</em>
          </h1>
        </div>
        <p className={`${styles.caption} ${styles.weave}`}>
          The quiet of a beautiful drape.
        </p>
        <p className={`${styles.caption} ${styles.memory}`}>
          Made for your kind of occasion.
        </p>
        <button className={styles.scroll} inert={!ready} onClick={enterStore}>
          {staticPreview
            ? "Explore the collections"
            : "Enter the salon"}{" "}
          <span>↓</span>
        </button>
        <div className={styles.filmLabel} aria-hidden="true"><span>Crafted around the extraordinary.</span><span>01 / The private salon</span></div>
        <div className={styles.journeyLine} aria-hidden="true"><span /></div>
        <div
          className={`${styles.loader} ${ready ? styles.loaderReady : ""}`}
          data-loading-screen="aira"
          aria-hidden={ready}
          role={ready ? undefined : "status"}
          aria-live="polite"
        >
          <div className={styles.loaderTop} aria-hidden="true">
            <span>An Indian point of view</span>
            <span>The house of AIRA</span>
            <span>Chapter 01</span>
          </div>
          <div className={styles.loaderInner}>
            <div
              className={styles.loaderPortrait}
              style={{ backgroundImage: `url('${loadingArtwork}')` }}
              aria-hidden="true"
            />
            <div className={styles.loaderIdentity}>
              <span className={styles.loaderMark}>AIRA</span>
              <p className={styles.loaderInvitation}>
                A world <em>of your own.</em>
              </p>
              <span className={styles.loaderEdition}>
                The private salon / Six expressions
              </span>
            </div>
          </div>
          <div className={styles.loaderBottom}>
            <p>
              {error
                ? "The store film could not load."
                : "Preparing the house for your visit"}
            </p>
            {!error && (
              <>
                <div
                  className={styles.loadTrack}
                  role="progressbar"
                  aria-label="Store media loading"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={bytesProgress ?? undefined}
                  aria-live="off"
                >
                  <span
                    style={
                      bytesProgress === null
                        ? undefined
                        : { width: `${bytesProgress}%` }
                    }
                  />
                </div>
                <span className={styles.percentage} aria-hidden="true">
                  {bytesProgress === null
                    ? "Loading"
                    : bytesProgress === 100
                      ? "Preparing your visit"
                      : `${bytesProgress}%`}
                </span>
              </>
            )}
            {error && (
              <button onClick={onExplore}>Explore collections ↗</button>
            )}
            <span className={styles.loaderNote} aria-hidden="true">
              Colour. Cloth. A little possibility.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
