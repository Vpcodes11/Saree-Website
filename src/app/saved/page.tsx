"use client";
import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import ProductCard from "../../components/shop/ProductCard";
import { useShop } from "../../components/shop/ShopProvider";
import { products } from "../../lib/products";
export default function SavedPage() {
  const { wishlist, ready } = useShop();
  const saved = products.filter((p) => wishlist.includes(p.id));
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="aira-page saved-page">
        <div className="saved-heading">
          <p className="aira-eyebrow">A collection of your own</p>
          <h1>Your moodboard.</h1>
          <p>
            Keep the pieces that speak to you. Come back to them when the moment
            feels right.
          </p>
        </div>
        {!ready ? (
          <p className="shop-loading">Opening your moodboard…</p>
        ) : saved.length ? (
          <div className="shop-grid">
            {saved.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="saved-empty">
            <p>A little room for inspiration.</p>
            <Link href="/shop" className="aira-button">
              Find your first piece ↗
            </Link>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
