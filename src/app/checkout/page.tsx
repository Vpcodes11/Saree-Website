import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CheckoutPage from "@/components/shop/CheckoutPage";

export const metadata: Metadata = { title: "Checkout Preview | AIRA" };
export default function Page() {
  return <><SiteHeader /><main className="aira-page checkout-page" id="main-content"><nav className="shop-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/bag">Your bag</Link><span aria-hidden="true">/</span><span aria-current="page">Checkout preview</span></nav><header className="shop-page-heading"><p className="aira-eyebrow">An imagined beginning</p><h1>Checkout preview.</h1></header><CheckoutPage /></main><SiteFooter /></>;
}
