"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useShop } from "./shop/ShopProvider";
import { products, formatPrice } from "../lib/products";
const navigation = [
  { label: "The edit", href: "/shop" },
  { label: "Six moods", href: "/#collections" },
  { label: "Bridal", href: "/shop?mood=Bridal" },
  { label: "The house", href: "/story" },
  { label: "Journal", href: "/journal" },
];
export default function SiteHeader({
  appearance = "paper",
}: {
  appearance?: "paper" | "immersive";
}) {
  const { count, wishlist } = useShop();
  const [query, setQuery] = useState("");
  const [panel, setPanel] = useState<"search" | "menu">("search");
  const [isOpen, setIsOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);
  const matches = products.filter((p) =>
    `${p.name} ${p.mood} ${p.color}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const open = (kind: "search" | "menu") => {
    setPanel(kind);
    dialog.current?.showModal();
    setIsOpen(true);
  };
  return (
    <>
      <header className={`site-header aira-header aira-header--${appearance}`}>
        <Link
          className="wordmark aira-mark"
          href="/"
          aria-label="AIRA homepage"
        >
          AIRA
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="nav-utilities">
          <button
            className="search-button"
            aria-label="Search the collection"
            onClick={() => open("search")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              aria-hidden="true"
            >
              <circle cx="10" cy="10" r="6.5" />
              <path d="m15 15 6 6" />
            </svg>
          </button>
          <Link
            className="saved-link"
            href="/saved"
            aria-label={`Your moodboard, ${wishlist.length} saved pieces`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              aria-hidden="true"
            >
              <path d="M12 20S3 14.8 3 8.5a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1C21 14.8 12 20 12 20Z" />
            </svg>
          </Link>
          <Link className="bag-link" href="/bag">
            Bag <span>({count})</span>
          </Link>
          <button
            className="menu-button"
            aria-label="Open navigation"
            onClick={() => open("menu")}
          >
            <span />
            <span />
          </button>
        </div>
      </header>
      <dialog
        ref={dialog}
        className="aira-dialog"
        aria-labelledby="header-dialog-title"
        onClose={() => setIsOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <div className="aira-dialog-inner">
          <button
            className="dialog-close"
            aria-label="Close panel"
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
          <p className="aira-eyebrow">The house of AIRA</p>
          <h2 id="header-dialog-title">
            {panel === "search"
              ? "Find your expression."
              : "A world of your own."}
          </h2>
          {panel === "menu" ? (
            <nav className="mobile-nav" aria-label="Mobile navigation">
              {[
                ...navigation,
                { label: "Your moodboard", href: "/saved" },
                { label: "Personal styling", href: "/visit" },
              ].map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => dialog.current?.close()}
                >
                  {n.label}
                  <span>↗</span>
                </Link>
              ))}
            </nav>
          ) : (
            <>
              <label className="search-field">
                <span className="visually-hidden">Search sarees</span>
                <input
                  type="search"
                  placeholder="Try ivory, bridal, or Gulnaar…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
              </label>
              <p className="search-count" aria-live="polite">
                {matches.length} expressions found
              </p>
              <div className="search-results">
                {matches.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    onClick={() => dialog.current?.close()}
                  >
                    <Image
                      src={p.image}
                      alt=""
                      style={{ objectFit: "cover", objectPosition: p.position }}
                      width={60}
                      height={75}
                      sizes="60px"
                    />
                    <span>
                      <small>{p.mood}</small>
                      <strong>{p.name}</strong>
                      <small>{formatPrice(p.price)}</small>
                    </span>
                    <span>↗</span>
                  </Link>
                ))}
              </div>
              {!matches.length && (
                <p className="search-empty">
                  Try a colour, mood, or another name.
                </p>
              )}
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
