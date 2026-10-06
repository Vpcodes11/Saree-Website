import { collections } from "./collections";

export type Product = {
  id: string; slug: string; name: string; mood: string; image: string; position: string;
  price: number; description: string; color: string; composition: string; weave: string;
  care: string; isNew: boolean;
};

const designs = [
  { slug: "gulnaar-silk", name: "Gulnaar Silk", price: 18900, color: "Mulberry wine", composition: "Silk with metallic yarn accents", weave: "Brocade-inspired jacquard", description: "A deep wine drape, touched with antique gold. A quiet tribute to the richness of Indian textile traditions.", isNew: false },
  { slug: "sunehri-silk", name: "Sunehri Silk", price: 16400, color: "Saffron gold", composition: "Silk with metallic yarn accents", weave: "Textured silk weave", description: "Saffron warmth and a luminous border, imagined for moments that turn into memories. A celebratory drape with an effortless spirit.", isNew: true },
  { slug: "noor-ivory", name: "Noor Ivory", price: 12800, color: "Warm ivory", composition: "Cotton and silk blend", weave: "Fine plain weave", description: "An ivory canvas for the everyday extraordinary. Soft texture, a restrained border, and the beauty of leaving a little unsaid.", isNew: true },
  { slug: "shaam-burgundy", name: "Shaam Burgundy", price: 17200, color: "Deep burgundy", composition: "Silk blend", weave: "Smooth satin weave", description: "The colour of dusk, with a fluid fall that catches the light. An elegant companion for evenings that unfold slowly.", isNew: false },
  { slug: "mehr-red", name: "Mehr Red", price: 28900, color: "Vermilion red", composition: "Silk with metallic yarn accents", weave: "Ornamental jacquard", description: "An heirloom in the making. Vermilion and golden detail come together in a drape imagined for a beautiful new beginning.", isNew: false },
  { slug: "reva-charcoal", name: "Reva Charcoal", price: 14900, color: "Stone charcoal", composition: "Cotton and silk blend", weave: "Textured plain weave", description: "Architectural lines meet the ease of a classic drape. A charcoal palette and an understated finish for a modern point of view.", isNew: true },
];

export const products: Product[] = designs.map((design, index) => ({
  ...design, id: design.slug, mood: collections[index].name, image: collections[index].image,
  position: collections[index].position,
  care: "Professional dry clean recommended. Air after wearing, store folded in breathable cotton, and avoid direct sunlight. Product specifications are illustrative for this concept store.",
}));

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export function getProduct(slug: string) { return products.find((product) => product.slug === slug); }
