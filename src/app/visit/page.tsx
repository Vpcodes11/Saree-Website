import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import VisitForm from "@/components/VisitForm";

export const metadata: Metadata = { title: "A private styling moment | AIRA", description: "Explore the AIRA styling experience with a local appointment preview." };

export default function VisitPage() {
  return <><SiteHeader /><main className="aira-page editorial-page" id="main-content">
    <header className="editorial-heading"><p className="editorial-eyebrow">A moment, just for you</p><h1>The art of<br /><em>finding your own.</em></h1><p>A considered conversation about colour, cloth<br />and the occasion you have in mind.</p></header>
    <section className="visit-composition"><div className="visit-image"><Image src="/images/bridal.jpg" alt="A richly detailed saree from the AIRA bridal concept edit" fill sizes="(max-width: 760px) 100vw, 48vw" loading="eager" style={{ objectFit: "cover", objectPosition: "center 28%" }} /><p>Something that feels<br /><em>entirely like you.</em></p></div><VisitForm /></section>
    <section className="visit-notes"><p className="editorial-eyebrow">Before your imagined visit</p><div><h2>A little preparation.<br /><em>A world of possibilities.</em></h2><p>Begin with the occasion, then gather the colours and silhouettes you are drawn to. Browse a few pieces, save your favourites, and think about what makes you feel at ease.</p><p>AIRA is a concept boutique, with no physical location or appointment service. The form above lets you explore the experience by saving a preview on your own device.</p><div className="editorial-link-pair"><Link href="/shop?mood=Bridal" className="editorial-text-link">Explore the bridal edit <span aria-hidden="true">↗</span></Link><Link href="/help#contact" className="editorial-text-link">About this preview <span aria-hidden="true">↗</span></Link></div></div></section>
  </main><SiteFooter /></>;
}
