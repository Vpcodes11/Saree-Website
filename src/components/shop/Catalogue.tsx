"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { collections } from "@/lib/collections";
import { products } from "@/lib/products";
import ProductCard from "./ProductCard";
import { useShop } from "./ShopProvider";

export default function Catalogue() {
  const params = useSearchParams();
  return <CatalogueFilters key={params.toString()} initialMood={params.get("mood") || params.get("collection") || "all"} initialQuery={params.get("q") || ""} initialCategory={params.get("category") || (params.get("new") === "true" ? "new" : "all")} />;
}

function CatalogueFilters({ initialMood, initialQuery, initialCategory }: { initialMood: string; initialQuery: string; initialCategory: string }) {
  const router = useRouter();
  const { wishlist } = useShop();
  const [mood, setMood] = useState(collections.find((collection) => collection.name.toLowerCase() === initialMood.toLowerCase())?.name || initialMood);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(["new", "saved"].includes(initialCategory) ? initialCategory : "all");
  const [sort, setSort] = useState("curated");
  const selection = products.filter((product) => (mood === "all" || product.mood.toLowerCase() === mood.toLowerCase()) && (category !== "new" || product.isNew) && (category !== "saved" || wishlist.includes(product.id)) && `${product.name} ${product.mood} ${product.color} ${product.composition}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : sort === "name" ? a.name.localeCompare(b.name) : 0);
  const reset = () => { setMood("all"); setCategory("all"); setQuery(""); setSort("curated"); router.replace("/shop", { scroll: false }); };
  return <>
    <div className="shop-filter-bar">
      <label className="shop-search">Search pieces<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="A name, a colour, a feeling…" /></label>
      <label>Collection<select value={mood} onChange={(event) => setMood(event.target.value)}><option value="all">All collections</option>{collections.map((collection) => <option key={collection.name} value={collection.name}>{collection.name}</option>)}{mood !== "all" && !collections.some((collection) => collection.name.toLowerCase() === mood.toLowerCase()) && <option value={mood}>{mood}</option>}</select></label>
      <label>Selection<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All pieces</option><option value="new">New arrivals</option><option value="saved">Saved pieces</option></select></label>
      <label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="curated">Curated order</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="name">Name: A to Z</option></select></label>
    </div>
    <div className="shop-results"><p role="status">{selection.length} {selection.length === 1 ? "piece" : "pieces"} to discover</p><button type="button" className="aira-text-link" onClick={reset}>Reset filters</button></div>
    {selection.length ? <div className="shop-grid">{selection.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="shop-empty"><h2>A different direction, perhaps.</h2><p>{category === "saved" && !wishlist.length ? "Save a piece with the heart beside its portrait and find it here." : "No pieces match this selection. Try another colour or explore every collection."}</p><button type="button" className="aira-button aira-button--outline" onClick={reset}>Explore all pieces</button></div>}
    <p className="shop-concept-note">A concept collection. Names, fabric details and prices are illustrative; campaign imagery expresses the mood of each piece.</p>
  </>;
}
