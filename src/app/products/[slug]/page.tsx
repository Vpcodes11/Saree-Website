import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductDetails from "@/components/shop/ProductDetails";
import { getProduct, products } from "@/lib/products";

export function generateStaticParams() { return products.map((product) => ({ slug: product.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = getProduct((await params).slug);
  return { title: product ? `${product.name} | AIRA` : "Piece not found | AIRA", description: product?.description };
}
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  return <><SiteHeader /><main className="aira-page product-page" id="main-content"><nav className="shop-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/shop">The collection</Link><span aria-hidden="true">/</span><span aria-current="page">{product.name}</span></nav><ProductDetails product={product} /></main><SiteFooter /></>;
}
