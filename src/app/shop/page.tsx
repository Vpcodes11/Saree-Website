import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Catalogue from "@/components/shop/Catalogue";

export const metadata: Metadata = { title: "The Collection | AIRA", description: "Explore six moods of the AIRA concept saree collection." };
export default function ShopPage() {
  return <><SiteHeader /><main className="aira-page shop-page" id="main-content"><nav className="shop-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">The collection</span></nav><header className="shop-page-heading"><p className="aira-eyebrow">Considered pieces. Enduring stories.</p><h1>A mood for every you.</h1><p>Six expressions of a timeless drape. Find the one that feels like you.</p></header><Suspense fallback={<p className="shop-loading" role="status">Gathering the collection…</p>}><Catalogue /></Suspense></main><SiteFooter /></>;
}
