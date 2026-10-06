"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { formatPrice, products } from "@/lib/products";
import { useShop } from "./ShopProvider";

type Preview = { id: string; createdAt: string; items: { productId: string; quantity: number }[]; total: number };
type Field = "name" | "email" | "address" | "city" | "postcode";
type Errors = Partial<Record<Field, string>>;
const fields: { key: Field; label: string; type?: string; autoComplete: string; placeholder: string }[] = [
  { key: "name", label: "Full name", autoComplete: "name", placeholder: "Your name" },
  { key: "email", label: "Email address", type: "email", autoComplete: "email", placeholder: "you@example.com" },
  { key: "address", label: "Street address", autoComplete: "street-address", placeholder: "House, street and area" },
  { key: "city", label: "City", autoComplete: "address-level2", placeholder: "Your city" },
  { key: "postcode", label: "PIN code", autoComplete: "postal-code", placeholder: "6-digit PIN code" },
];

export default function CheckoutPage() {
  const { items, total, ready } = useShop();
  const [errors, setErrors] = useState<Errors>({});
  const [preview, setPreview] = useState<Preview | null>(null);
  const [saved, setSaved] = useState(false);
  const confirmation = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (preview) confirmation.current?.focus(); }, [preview]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const values = Object.fromEntries(fields.map((field) => [field.key, String(data.get(field.key) || "").trim()])) as Record<Field, string>;
    const next: Errors = {};
    if (values.name.length < 2) next.name = "Enter your full name (at least 2 characters).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Enter a valid email address.";
    if (values.address.length < 10) next.address = "Enter a street address (at least 10 characters).";
    if (values.city.length < 2) next.city = "Enter your city.";
    if (!/^[1-9]\d{5}$/.test(values.postcode)) next.postcode = "Enter a valid 6-digit Indian PIN code.";
    setErrors(next);
    const first = fields.find((field) => next[field.key]);
    if (first) { (event.currentTarget.elements.namedItem(first.key) as HTMLInputElement)?.focus(); return; }
    if (!items.length) return;
    const order: Preview = { id: `AIRA-PREVIEW-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, createdAt: new Date().toISOString(), items: items.map((item) => ({ ...item })), total };
    try { localStorage.setItem("aira-last-preview-v1", JSON.stringify(order)); setSaved(true); } catch { setSaved(false); }
    setPreview(order);
  }

  if (!ready) return <p className="shop-loading" role="status">Preparing your preview…</p>;
  if (preview) return <section className="checkout-confirmation" aria-labelledby="preview-title"><p className="aira-eyebrow">A moment imagined</p><h2 id="preview-title" ref={confirmation} tabIndex={-1}>Your preview is complete.</h2><p>No payment was taken. No real order was placed.</p><p className="checkout-confirmation-detail">{saved ? "A summary of your selection is saved in this browser." : "Browser storage is unavailable; your summary is available for this visit."} Your name, email and address were not stored or sent anywhere.</p><p className="shop-small-note">Preview reference: {preview.id}</p><div className="checkout-confirmation-items">{preview.items.map((item) => <div className="bag-summary-row" key={item.productId}><span>{products.find((product) => product.id === item.productId)?.name} × {item.quantity}</span><span>{formatPrice((products.find((product) => product.id === item.productId)?.price || 0) * item.quantity)}</span></div>)}<div className="bag-summary-row"><strong>Illustrative total</strong><strong>{formatPrice(preview.total)}</strong></div></div><Link className="aira-button" href="/shop">Continue the story ↗</Link><Link className="aira-text-link shop-empty-secondary" href="/bag">Return to your bag</Link></section>;
  if (!items.length) return <div className="shop-empty"><h2>Find your first piece.</h2><p>Add a saree to your bag to explore the checkout preview.</p><Link className="aira-button" href="/shop">Explore the collection ↗</Link></div>;
  return <div className="checkout-layout"><section><div className="checkout-intro"><p className="aira-eyebrow">A local experience</p><h2>The finishing details.</h2><p>This is a demonstration. Use sample details to try the form. Nothing is sent to a server, and no email, payment or shipment is created.</p></div><form className="checkout-form" noValidate onSubmit={submit}>
    {Object.values(errors).some(Boolean) && <p role="alert" className="checkout-error-summary">Please check the highlighted details below.</p>}
    {fields.map((field) => <div className={`checkout-field checkout-field--${field.key}`} key={field.key}><label htmlFor={`checkout-${field.key}`}>{field.label} <span aria-hidden="true">*</span></label><input id={`checkout-${field.key}`} name={field.key} type={field.type || "text"} autoComplete={field.autoComplete} placeholder={field.placeholder} required maxLength={field.key === "address" ? 200 : field.key === "postcode" ? 6 : 100} inputMode={field.key === "postcode" ? "numeric" : undefined} aria-invalid={Boolean(errors[field.key])} aria-describedby={errors[field.key] ? `checkout-error-${field.key}` : undefined} onChange={() => { if (errors[field.key]) setErrors((current) => ({ ...current, [field.key]: undefined })); }} />{errors[field.key] && <p className="checkout-field-error" id={`checkout-error-${field.key}`}>{errors[field.key]}</p>}</div>)}
    <p className="shop-small-note checkout-form-note">All fields are required to demonstrate validation. Only the selection summary is saved locally; personal details are discarded after this preview.</p><button type="submit" className="aira-button">Complete preview <span aria-hidden="true">↗</span></button>
  </form></section><aside className="bag-summary checkout-summary"><p className="aira-eyebrow">The pieces you chose</p><h2>Your selection.</h2>{items.map((item) => { const product = products.find((candidate) => candidate.id === item.productId)!; return <div className="checkout-summary-piece" key={item.productId}><span>{product.name}<small>{product.color} · Quantity {item.quantity}</small></span><span>{formatPrice(product.price * item.quantity)}</span></div>; })}<div className="bag-summary-row"><span>Illustrative total</span><strong>{formatPrice(total)}</strong></div><p className="bag-preview-note">No payment details are requested. No payment will be taken and no real order will be placed.</p><Link className="aira-text-link" href="/bag">Edit your bag →</Link></aside></div>;
}
