"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice, products } from "@/lib/products";
import { useShop } from "./ShopProvider";

export default function BagPage() {
  const { items, setQuantity, removeItem, total, count, ready } = useShop();
  if (!ready) return <p className="shop-loading" role="status">Opening your bag…</p>;
  if (!items.length) return <div className="shop-empty"><p className="aira-eyebrow">Room for something beautiful</p><h2>Your story starts with a piece.</h2><p>Your bag is waiting. Discover six moods, from quiet ivory to the richness of wine silk.</p><Link className="aira-button" href="/shop">Explore the collection ↗</Link><Link className="aira-text-link shop-empty-secondary" href="/shop?category=saved">Visit your saved pieces</Link></div>;
  return <div className="bag-layout"><section aria-label="Pieces in your bag" className="bag-items">
    <p className="bag-count" role="status">{count} {count === 1 ? "piece" : "pieces"} in your bag</p>
    {items.map((item) => {
      const product = products.find((candidate) => candidate.id === item.productId)!;
      return <article className="bag-item" key={item.productId}><Link className="bag-item-image" href={`/products/${product.slug}`}><Image src={product.image} alt={`${product.name} in ${product.color}`} fill sizes="(max-width: 600px) 110px, 150px" style={{ objectFit: "cover", objectPosition: product.position }} /></Link><div className="bag-item-copy"><p className="aira-eyebrow">{product.mood}</p><Link href={`/products/${product.slug}`}><h2>{product.name}</h2></Link><p>{product.color}</p><p>{formatPrice(product.price)} each</p><div className="bag-item-controls"><div className="shop-quantity"><button type="button" onClick={() => setQuantity(product.id, item.quantity - 1)} disabled={item.quantity === 1} aria-label={`Decrease quantity of ${product.name}`}>−</button><output aria-label={`Quantity of ${product.name}`}>{item.quantity}</output><button type="button" onClick={() => setQuantity(product.id, item.quantity + 1)} disabled={item.quantity === 10} aria-label={`Increase quantity of ${product.name}`}>+</button></div><button type="button" className="aira-text-link" onClick={() => removeItem(product.id)} aria-label={`Remove ${product.name} from bag`}>Remove</button></div></div><p className="bag-item-total">{formatPrice(product.price * item.quantity)}</p></article>;
    })}
    <Link className="aira-text-link" href="/shop">← Continue discovering</Link>
  </section><aside className="bag-summary"><p className="aira-eyebrow">Your selection</p><h2>A beautiful beginning.</h2><div className="bag-summary-row"><span>Subtotal</span><strong>{formatPrice(total)}</strong></div><div className="bag-summary-row"><span>Shipping</span><span>Preview only</span></div><p className="bag-preview-note">This is a concept boutique. Checkout is a local preview; no payment will be taken and no real order will be placed.</p><Link href="/checkout" className="aira-button">Preview checkout ↗</Link><p className="shop-small-note">Your bag is saved in this browser where storage is available. Up to 10 of each piece.</p></aside></div>;
}
