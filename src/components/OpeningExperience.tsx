"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import StoreJourney from "./StoreJourney";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import ProductCard from "./shop/ProductCard";
import { products } from "../lib/products";
import MoodAtelier from "./MoodAtelier";
import { journalArticles } from "../lib/journal";
export default function OpeningExperience({ videoSrc }: { videoSrc: string }) {
  const home = useRef<HTMLElement>(null);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const root = home.current;
    if (!root || !entered || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("editorial-visible");
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.08 });
    root.dataset.editorialReady = "true";
    root.querySelectorAll(".editorial-enter").forEach((element) => observer.observe(element));
    return () => { observer.disconnect(); delete root.dataset.editorialReady; };
  }, [entered]);
  const explore = () =>
    document.getElementById("collections")?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  return (
    <>
      <main id="main-content" className="aira-home" ref={home}>
        <StoreJourney
          src={videoSrc}
          mobileSrc="/video/aira-store-mobile-v9.mp4"
          poster="/images/store-poster-v9.jpg"
          mobilePoster="/images/store-poster-mobile-v9.jpg"
          loadingArtwork="/images/editorial-silk.webp"
          onExplore={explore}
          onReadyChange={setEntered}
        >
          <SiteHeader appearance="immersive" />
        </StoreJourney>
        <div className="home-body" inert={!entered}>
          <section className="house-invitation editorial-enter" aria-labelledby="invitation-title">
            <p className="aira-eyebrow">The extraordinary in the familiar</p>
            <h2 id="invitation-title">One continuous thread.<br /><em>Endless ways to be.</em></h2>
            <svg className="silk-thread" viewBox="0 0 1000 130" fill="none" aria-hidden="true"><path d="M0 80C170 80 160 22 295 22C400 22 342 119 437 119C554 119 503 10 610 10C724 10 693 90 794 90C890 90 892 48 1000 48" /><path d="M0 85C175 85 164 28 295 28C392 28 340 124 437 124C564 124 509 16 610 16C718 16 690 96 794 96C890 96 898 54 1000 54" /></svg>
            <p>Six yards of possibility. The rest is entirely you.</p>
          </section>
          <MoodAtelier />
          <section className="home-section curated-section editorial-enter" aria-labelledby="featured-title">
            <div className="section-title-row">
              <div>
                <p className="aira-eyebrow">02 — The considered edit</p>
                <h2 id="featured-title" className="aira-section-heading">
                  Pieces to <em>come back to.</em>
                </h2>
              </div>
              <Link className="aira-text-link" href="/shop?category=new">
                Discover the new edit <span>↗</span>
              </Link>
            </div>
            <div className="featured-grid">
              {[products[2], products[1], products[5]].map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
          <section className="house-section editorial-enter">
            <figure className="house-portrait">
              <Image
                src="/images/editorial-silk.webp"
                alt="An editorial study of wine, ivory, and olive silk folds on linen"
                fill
                sizes="(max-width:767px) 82vw, 44vw"
              />
              <figcaption>A study in texture / The AIRA journal</figcaption>
            </figure>
            <div className="house-copy">
              <p className="aira-eyebrow">03 — The house philosophy</p>
              <h2 className="aira-section-heading">
                A little slower.
                <br />
                <em>A little closer.</em>
              </h2>
              <p>
                There is a quiet kind of confidence in clothes you choose for
                yourself. AIRA explores that space — between a familiar drape
                and a new point of view.
              </p>
              <Link href="/story" className="aira-text-link">
                Meet the house <span>↗</span>
              </Link>
            </div>
          </section>
          <section className="campaign-section editorial-enter">
            <Image
              src="/images/campaign.jpg"
              alt="A woman in an ivory and wine saree in a sunlit sandstone courtyard"
              fill
              sizes="100vw"
            />
            <div className="campaign-copy">
              <p className="aira-eyebrow">For the moments you make your own</p>
              <h2>
                The occasion
                <br />
                <em>is you.</em>
              </h2>
              <Link href="/shop?mood=Bridal" className="aira-text-link">
                Explore the bridal mood <span>↗</span>
              </Link>
            </div>
          </section>
          <section className="home-section journal-section editorial-enter">
            <div className="section-title-row">
              <div>
                <p className="aira-eyebrow">04 — Notes from the house</p>
                <h2 className="aira-section-heading">Beyond the drape.</h2>
              </div>
              <Link href="/journal" className="aira-text-link">
                Open the journal <span>↗</span>
              </Link>
            </div>
            <div className="journal-home-grid">
              {journalArticles.map((article) => (
                <article key={article.slug}>
                  <Link
                    href={`/journal/${article.slug}`}
                    className="journal-home-image"
                  >
                    <Image
                      src={article.image}
                      alt={article.imageAlt}
                      fill
                      sizes="(max-width:767px) 76vw, 30vw"
                      style={{ objectPosition: article.position }}
                    />
                  </Link>
                  <p className="aira-eyebrow">{article.eyebrow}</p>
                  <h3>
                    <Link href={`/journal/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h3>
                  <p>{article.excerpt}</p>
                  <Link
                    href={`/journal/${article.slug}`}
                    className="aira-text-link"
                  >
                    Read the story <span>↗</span>
                  </Link>
                </article>
              ))}
            </div>
          </section>
          <section className="styling-section editorial-enter">
            <div>
              <p className="aira-eyebrow">A wardrobe that feels like you</p>
              <h2>
                A little guidance.
                <br />
                <em>Your own instinct.</em>
              </h2>
              <p>
                Explore colour, occasion, and the way you want to feel with a
                personal styling preview.
              </p>
            </div>
            <Link href="/visit" className="aira-button">
              Find your direction <span>↗</span>
            </Link>
          </section>
        </div>
      </main>
      <div inert={!entered}>
        <SiteFooter />
      </div>
    </>
  );
}
