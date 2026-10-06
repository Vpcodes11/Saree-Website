import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { journalArticles } from "@/lib/journal";

export function generateStaticParams() { return journalArticles.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = journalArticles.find((item) => item.slug === slug);
  return { title: article ? `${article.title} | AIRA Journal` : "Story not found | AIRA", description: article?.excerpt };
}

export default async function JournalArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = journalArticles.find((item) => item.slug === slug);
  if (!article) notFound();
  const nextArticle = journalArticles[(journalArticles.indexOf(article) + 1) % journalArticles.length];
  return <><SiteHeader /><main className="aira-page editorial-page" id="main-content">
    <article><header className="editorial-heading article-heading"><Link href="/journal" className="editorial-back-link">← The journal</Link><p className="editorial-eyebrow">{article.eyebrow} · {article.readTime}</p><h1>{article.title}</h1><p>{article.excerpt}</p></header>
    <figure className="article-hero-image"><Image src={article.image} alt={article.imageAlt} fill sizes="(max-width: 760px) 100vw, 80vw" loading="eager" style={{ objectFit: "cover", objectPosition: article.position }} /></figure>
    <div className="article-prose"><p className="article-introduction">{article.introduction}</p>{article.sections.map((section) => <section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}<p className="article-colophon">Words from the AIRA concept journal. Images illustrate the creative direction.</p></div></article>
    <nav className="article-next" aria-label="Continue reading"><p className="editorial-eyebrow">Another quiet moment</p><Link href={`/journal/${nextArticle.slug}`}>{nextArticle.title} <span aria-hidden="true">↗</span></Link><Link href="/shop" className="editorial-text-link">Find a saree for your story <span aria-hidden="true">↗</span></Link></nav>
  </main><SiteFooter /></>;
}
