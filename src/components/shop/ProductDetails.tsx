"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice, products, type Product } from "@/lib/products";
import { useShop } from "./ShopProvider";
import ProductCard from "./ProductCard";

export default function ProductDetails({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem, items, wishlist, toggleWishlist, ready } = useShop();
  const saved = wishlist.includes(product.id);
  const inBag = items.find((item) => item.productId === product.id)?.quantity || 0;
  return <>
    <div className="product-detail-grid">
      <div className="product-detail-portrait"><Image src={product.image} alt={`${product.color} ${product.name} saree, styled in the ${product.mood.toLowerCase()} campaign`} fill sizes="(max-width: 800px) 100vw, 55vw" preload style={{ objectFit: "cover", objectPosition: product.position }} /></div>
      <div className="product-detail-copy">
        <p className="aira-eyebrow">The {product.mood} collection</p><h1>{product.name}</h1><p className="product-detail-price">{formatPrice(product.price)} <span>Illustrative price</span></p><p className="product-description">{product.description}</p>
        <dl className="product-specs"><div><dt>Colour</dt><dd>{product.color}</dd></div><div><dt>Composition</dt><dd>{product.composition}</dd></div><div><dt>Weave</dt><dd>{product.weave}</dd></div><div><dt>Dimensions</dt><dd>5.5 m saree + 0.8 m unstitched blouse fabric</dd></div></dl>
        <div className="product-purchase"><label htmlFor="product-quantity">Quantity</label><div className="shop-quantity"><button type="button" aria-label="Decrease quantity" onClick={() => { setQuantity((value) => value - 1); setAdded(false); }} disabled={quantity === 1}>−</button><output id="product-quantity" aria-live="polite">{quantity}</output><button type="button" aria-label="Increase quantity" onClick={() => { setQuantity((value) => value + 1); setAdded(false); }} disabled={quantity === 10}>+</button></div><button type="button" className="aira-button product-add" disabled={!ready} onClick={() => { addItem(product.id, quantity); setAdded(true); }}>Add to bag <span aria-hidden="true">↗</span></button></div>
        <button type="button" className="aira-text-link product-save-text" disabled={!ready} aria-pressed={saved} onClick={() => toggleWishlist(product.id)}>{saved ? "Saved to your pieces ♡" : "Save this piece ♡"}</button>
        <div className="product-feedback" role="status">{added && <>Your bag contains {inBag} {inBag === 1 ? "piece" : "pieces"} of {product.name}. <Link className="aira-text-link" href="/bag">View bag →</Link><span className="product-feedback-note">A maximum of 10 of each piece can be kept in your preview bag.</span></>}</div>
        <div className="product-accordions"><details><summary>The details</summary><p>A flowing, unstitched saree with a coordinating blouse fabric. Styling and jewellery shown are inspiration and are not included.</p></details><details><summary>Care for your piece</summary><p>{product.care}</p></details><details><summary>About this concept collection</summary><p>AIRA is a demonstration boutique. These products, prices and textile specifications are fictional. Images are editorial mood references. You can explore a bag and checkout preview; no products are sold or shipped.</p></details></div>
      </div>
    </div>
    <section className="product-related"><div className="section-title-row"><div><p className="aira-eyebrow">Another possibility</p><h2 className="aira-section-heading">Continue the story.</h2></div><Link className="aira-text-link" href="/shop">View all pieces ↗</Link></div><div className="shop-grid">{products.filter((candidate) => candidate.id !== product.id).slice(0, 3).map((candidate) => <ProductCard key={candidate.id} product={candidate} />)}</div></section>
  </>;
}
