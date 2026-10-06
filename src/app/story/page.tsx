import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = { title: "Our story | AIRA", description: "A perspective on sarees, personal style and the beauty of cloth." };

export default function StoryPage() {
  return <><SiteHeader /><main className="aira-page editorial-page" id="main-content">
    <header className="editorial-heading story-heading"><p className="editorial-eyebrow">The world of AIRA</p><h1>Rooted in feeling.<br /><em>Made for the present.</em></h1><p>A saree is never only what it is made of.<br />It is also what you bring to it.</p></header>
    <figure className="story-wide-image"><Image src="/images/campaign.jpg" alt="An expressive saree portrait from the AIRA concept collection" fill sizes="100vw" loading="eager" style={{ objectFit: "cover", objectPosition: "center 35%" }} /><figcaption>A study in movement, texture and personal expression.</figcaption></figure>
    <section className="editorial-prose-section"><p className="editorial-eyebrow">Our perspective</p><div><h2>Six yards.<br /><em>Endless ways to belong.</em></h2><p>AIRA imagines an Indian wardrobe where the familiar and the unexpected sit comfortably together. A border that catches the light. A colour that changes with the hour. A drape that becomes your own.</p><p>Our starting point is the saree: a form with many regional histories and ways of wearing. We approach that richness with curiosity and respect. No single story could contain it, and no single silhouette should define the woman who wears it.</p><p>We are drawn to clothes that make an occasion feel personal, whether that occasion is a celebration or an ordinary day made a little more beautiful.</p></div></section>
    <section className="story-detail"><figure><div className="story-detail-image"><Image src="/images/editorial-silk.webp" alt="Illustrative editorial study of silk texture and folded cloth" fill sizes="(max-width: 760px) 100vw, 48vw" style={{ objectFit: "cover" }} /></div><figcaption>An illustrative textile study created for the AIRA concept.</figcaption></figure><div className="story-detail-copy"><p className="editorial-eyebrow">The beauty is in the detail</p><h2>A closer look<br />at <em>the cloth.</em></h2><p>Before an outfit takes shape, there is the pleasure of noticing: the fall of a fabric, the rhythm of a motif, the quiet contrast between a surface and its edge.</p><p>This collection is an exploration of those details. AIRA is a fictional label and this website is a concept boutique. The images and catalogue illustrate a creative direction; they do not document a real workshop, production history or maker partnership.</p><Link href="/journal/cloth-worth-keeping" className="editorial-text-link">Notes on caring for cloth <span aria-hidden="true">↗</span></Link></div></section>
    <section className="editorial-closing"><p className="editorial-eyebrow">Find your own expression</p><h2>What will you<br /><em>make of six yards?</em></h2><Link href="/shop" className="editorial-solid-link">Explore the collection <span aria-hidden="true">↗</span></Link></section>
  </main><SiteFooter /></>;
}
