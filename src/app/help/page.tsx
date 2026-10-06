import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = { title: "Here to help | AIRA", description: "A guide to the AIRA concept boutique, collection preview and caring for cloth." };

const sections = [
  { id: "shipping", number: "01", title: "The collection & delivery", questions: [
    { question: "Can I buy the sarees shown here?", answer: "AIRA is a fictional label and this is a concept boutique. The catalogue, prices and product descriptions illustrate the shopping experience. Products are not available to purchase, payment is not live, and adding a piece to your bag does not place an order." },
    { question: "Are shipping times or charges available?", answer: "No orders are fulfilled through this preview, so there are no actual delivery times, shipping charges or service regions. A real store would confirm these details before taking payment. Nothing on this concept website constitutes a delivery promise." },
    { question: "What do the photographs represent?", answer: "The imagery illustrates the mood and styling direction of the collection. It is not a guarantee of a purchasable garment’s colour, fibre composition, craftsmanship or provenance. The textile study is an illustrative image, rather than a record of a real maker or workshop." },
  ] },
  { id: "returns", number: "02", title: "Orders & returns", questions: [
    { question: "What is the return or exchange policy?", answer: "There are no purchases in this demonstration, so no real return or exchange policy applies. No return window, refund entitlement or exchange commitment is offered here. Any future store would need to publish its actual terms before accepting orders." },
    { question: "Will I be charged at checkout?", answer: "Payment processing is not connected. No payment details are collected and no charge is made. Any bag or checkout preview represents a demonstration only; it is not an order confirmation." },
  ] },
  { id: "care", number: "03", title: "Cloth & care", questions: [
    { question: "How should I care for a saree?", answer: "Start with the specific garment’s care label. Fibre, dye, finish and embellishment can all change the right care method. Follow the maker’s instructions, and ask a qualified cleaner when those instructions or the material are unclear. General journal notes do not replace care advice for a particular garment." },
    { question: "Are the listed materials verified?", answer: "Product details in this catalogue are illustrative. They are not verified specifications for stock offered for sale. For any real purchase, confirm the composition, dimensions, included pieces and care instructions with the seller before ordering." },
    { question: "Where can I find styling ideas?", answer: "The journal includes notes on personal draping, dressing as a wedding guest and keeping a considered wardrobe. Use them as a starting point, and adapt them to your comfort, the garment and the occasion." },
  ] },
  { id: "contact", number: "04", title: "Styling & contact", questions: [
    { question: "Can I book a styling appointment?", answer: "The styling page offers a local preview form. Saving it stores your name, email, occasion and preferred date in your browser. It does not book an appointment, send a message or email, or share information with a team." },
    { question: "Is there an AIRA boutique I can visit?", answer: "There is no physical boutique, real address or opening schedule attached to this fictional brand. The visit page is a demonstration of a private styling experience." },
    { question: "How do I remove my preview details?", answer: "Use ‘Clear saved preview details’ on the styling page. You can also remove this website’s stored data through your browser settings. Details are saved only on the device and browser where you entered them." },
  ] },
];

export default function HelpPage() {
  return <><SiteHeader /><main className="aira-page editorial-page" id="main-content">
    <header className="editorial-heading"><p className="editorial-eyebrow">A few useful notes</p><h1>Here to <em>help.</em></h1><p>A guide to the collection, the concept boutique<br />and the cloth you love.</p></header>
    <div className="help-layout"><nav className="help-navigation" aria-label="Help topics">{sections.map((section) => <a href={`#${section.id}`} key={section.id}><span>{section.number}</span>{section.title}<span aria-hidden="true">↗</span></a>)}<p>This website is an illustrative concept. Its catalogue and experience do not create purchase, delivery or appointment commitments.</p></nav><div className="help-sections">{sections.map((section) => <section id={section.id} className="help-section" key={section.id}><p className="editorial-eyebrow">{section.number} / AIRA guide</p><h2>{section.title}</h2>{section.questions.map((item) => <details key={item.question}><summary>{item.question}<span className="help-plus" aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}{section.id === "care" && <Link href="/journal/cloth-worth-keeping" className="editorial-text-link">Read our care notes <span aria-hidden="true">↗</span></Link>}{section.id === "contact" && <Link href="/visit" className="editorial-text-link">Explore the styling preview <span aria-hidden="true">↗</span></Link>}</section>)}</div></div>
    <section className="editorial-closing"><p className="editorial-eyebrow">Get to know us</p><h2>A different perspective<br />on <em>the familiar.</em></h2><Link href="/story" className="editorial-solid-link">Our story <span aria-hidden="true">↗</span></Link></section>
  </main><SiteFooter /></>;
}
