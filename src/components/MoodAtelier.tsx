"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { collections } from "../lib/collections";
import styles from "./MoodAtelier.module.css";

const expressions = [
  { background: "#3c1820", accent: "#c6a77d", paper: "#f6eadb", note: "An old soul. A new story.", description: "Rich silk, quiet grandeur, and the beauty of carrying something forward.", detail: "The golden hour", crop: "30% 73%" },
  { background: "#8a482e", accent: "#e6bc7b", paper: "#fff0d7", note: "Let the occasion find you.", description: "For the light, the laughter, and the moments that ask for a little more.", detail: "A touch of warmth", crop: "55% 65%" },
  { background: "#ded7c8", accent: "#6d5a3d", paper: "#302c25", note: "Nothing more. Nothing less.", description: "An effortless drape. A softer palette. Space to be entirely yourself.", detail: "The quiet gesture", crop: "50% 66%" },
  { background: "#251e30", accent: "#bd9a83", paper: "#f4e7df", note: "Stay a little longer.", description: "Deep tones and fluid silhouettes, made for the hours after golden hour.", detail: "After the light", crop: "51% 69%" },
  { background: "#631923", accent: "#d6ad76", paper: "#f7e8d4", note: "A moment. A lifetime.", description: "A celebration of the woman, the day, and every story still to come.", detail: "An enduring romance", crop: "51% 73%" },
  { background: "#343a35", accent: "#b9b59c", paper: "#efece0", note: "Tradition, in your own words.", description: "A familiar form with a fresh point of view. Follow your own line.", detail: "A different rhythm", crop: "50% 72%" },
] as const;

export default function MoodAtelier() {
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const mood = collections[selected];
  const expression = expressions[selected];
  const palette = {
    "--atelier-background": expression.background,
    "--atelier-accent": expression.accent,
    "--atelier-paper": expression.paper,
  } as CSSProperties;

  function selectFromKeyboard(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % collections.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + collections.length) % collections.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = collections.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus({ preventScroll: true });
    tabs.current[next]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
  }

  return (
    <section id="collections" className={styles.atelier} style={palette} aria-labelledby="atelier-title">
      <header className={styles.masthead}>
        <span>The AIRA wardrobe</span>
        <span className={styles.mastheadMark} aria-hidden="true">a.</span>
        <span>Six expressions. One you.</span>
      </header>
      <div className={styles.layout}>
        <div className={styles.navigation}>
          <h2 id="atelier-title" className={styles.heading}>Dress for<br /><em>a feeling.</em></h2>
          <div role="tablist" aria-label="Collection moods" className={styles.tabs}>
            {collections.map((collection, index) => (
              <button
                type="button"
                role="tab"
                id={`atelier-tab-${index}`}
                aria-controls="atelier-panel"
                aria-selected={selected === index}
                tabIndex={selected === index ? 0 : -1}
                key={collection.name}
                ref={(element) => { tabs.current[index] = element; }}
                className={styles.tab}
                onClick={() => setSelected(index)}
                onKeyDown={(event) => selectFromKeyboard(event, index)}
              >
                <span className={styles.tabNumber}>0{index + 1}</span>
                <span>{collection.name}</span>
                <span className={styles.tabArrow} aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
          <span className={styles.navigationFoot}>An Indian point of view.</span>
        </div>

        <div id="atelier-panel" role="tabpanel" aria-labelledby={`atelier-tab-${selected}`} tabIndex={0} className={styles.stage}>
          <span className={styles.number} aria-hidden="true">0{selected + 1}</span>
          <figure className={styles.portrait}>
            {collections.map((collection, index) => (
              <div className={`${styles.imageLayer} ${selected === index ? styles.imageActive : ""}`} key={collection.name} aria-hidden={selected !== index}>
                <Image
                  src={collection.image}
                  alt={selected === index ? collection.description : ""}
                  fill
                  sizes="(max-width: 700px) 85vw, (max-width: 1000px) 50vw, 36vw"
                  style={{ objectPosition: collection.position }}
                />
              </div>
            ))}
            <figcaption className={styles.portraitCaption}>AIRA / {mood.name} / 0{selected + 1}</figcaption>
          </figure>

          <div className={styles.detail} aria-hidden="true">
            <div className={styles.detailImage}>
              {collections.map((collection, index) => (
                <div className={`${styles.imageLayer} ${selected === index ? styles.imageActive : ""}`} key={collection.name}>
                  <Image src={collection.image} alt="" fill sizes="(max-width: 700px) 28vw, 18vw" style={{ objectPosition: expressions[index].crop, transformOrigin: expressions[index].crop }} />
                </div>
              ))}
            </div>
            <span className={styles.detailCaption}>{expression.detail}</span>
          </div>

          <div className={styles.story} key={mood.name}>
            <p className={styles.note}>{expression.note}</p>
            <h3 className={`${styles.moodTitle} ${mood.name === "Contemporary" ? styles.longTitle : ""}`}>{mood.name}<span aria-hidden="true">.</span></h3>
            <div className={styles.description}>
              <p>{expression.description}</p>
              <Link href={`/shop?mood=${encodeURIComponent(mood.name)}`} className={styles.shopLink}>Explore {mood.name.toLowerCase()} <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
          <span className={styles.edgeLabel} aria-hidden="true">A study in self-expression</span>
        </div>
      </div>
      <footer className={styles.footer}>
        <span>Cloth. Culture. A feeling.</span>
        <Link href="/shop">The complete wardrobe <span aria-hidden="true">↗</span></Link>
      </footer>
    </section>
  );
}
