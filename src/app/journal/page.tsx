import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { journalArticles } from "@/lib/journal";

export const metadata: Metadata = { title: "The journal | AIRA", description: "Notes on sarees, dressing for the occasion and caring for the cloth you love." };

export default function JournalPage() {
  return <><SiteHeader /><main className="aira-page editorial-page" id="main-content">
    <header className="editorial-heading"><p className="editorial-eyebrow">Stories, slowly told</p><h1>The <em>journal.</em></h1><p>On the cloth we love, the ways we wear it,<br />and the moments we dress for.</p></header>
    <section className="journal-index" aria-label="Journal articles">{journalArticles.map((article, index) => <article className="journal-index-item" key={article.slug}>
      <Link href={`/journal/${article.slug}`} className="journal-index-image" aria-label={`Read ${article.title}`}><Image src={article.image} alt={article.imageAlt} fill sizes="(max-width: 760px) 100vw, 48vw" loading={index === 0 ? "eager" : "lazy"} style={{ objectFit: "cover", objectPosition: article.position }} /></Link>
      <div className="journal-index-copy"><p className="editorial-eyebrow">{article.eyebrow} <span aria-hidden="true">/</span> {article.readTime}</p><h2><Link href={`/journal/${article.slug}`}>{article.title}</Link></h2><p>{article.excerpt}</p><Link href={`/journal/${article.slug}`} className="editorial-text-link">Read the story <span aria-hidden="true">↗</span></Link></div>
    </article>)}</section>
    <section className="editorial-closing"><p className="editorial-eyebrow">From inspiration to expression</p><h2>A little closer<br />to <em>your kind of saree.</em></h2><Link href="/shop" className="editorial-solid-link">Explore the collection <span aria-hidden="true">↗</span></Link></section>
  </main><SiteFooter /></>;
}
