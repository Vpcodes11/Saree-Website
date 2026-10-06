"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice, type Product } from "@/lib/products";
import { useShop } from "./ShopProvider";

export default function ProductCard({ product }: { product: Product }) {
  const { wishlist, toggleWishlist, ready } = useShop();
  const saved = wishlist.includes(product.id);
  return (
    <article className="product-card">
      <div className="product-card-portrait" data-mood={product.mood}>
        <Link
          href={`/products/${product.slug}`}
          aria-label={`Discover ${product.name}`}
        >
          <Image
            src={product.image}
            alt={`${product.name} saree in ${product.color.toLowerCase()}`}
            fill
            sizes="(max-width: 700px) 130vw, 82vw"
            style={{ objectFit: "cover", objectPosition: product.position }}
          />
        </Link>
        {product.isNew && <span className="product-new">New chapter</span>}
        <button
          type="button"
          className="product-save"
          disabled={!ready}
          onClick={() => toggleWishlist(product.id)}
          aria-pressed={saved}
          aria-label={`${saved ? "Remove" : "Save"} ${product.name}${saved ? " from saved pieces" : " to saved pieces"}`}
        >
          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill={saved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.4"
            aria-hidden="true"
          >
            <path d="M20.5 4.9a5.3 5.3 0 0 0-7.5 0L12 6l-1.1-1.1a5.3 5.3 0 0 0-7.5 7.5L12 21l8.5-8.6a5.3 5.3 0 0 0 0-7.5Z" />
          </svg>
        </button>
      </div>
      <div className="product-card-caption">
        <p className="aira-eyebrow">
          {product.mood} / {product.color}
        </p>
        <Link href={`/products/${product.slug}`}>
          <h3>{product.name}</h3>
        </Link>
        <p className="product-price">{formatPrice(product.price)}</p>
      </div>
    </article>
  );
}
