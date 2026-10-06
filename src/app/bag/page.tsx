import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BagPage from "@/components/shop/BagPage";

export const metadata: Metadata = { title: "Your Bag | AIRA" };
export default function Page() {
  return <><SiteHeader /><main className="aira-page bag-page" id="main-content"><nav className="shop-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Your bag</span></nav><header className="shop-page-heading"><p className="aira-eyebrow">A few things to fall for</p><h1>Your bag.</h1></header><BagPage /></main><SiteFooter /></>;
}
