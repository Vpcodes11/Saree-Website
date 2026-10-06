import Link from "next/link";
export default function SiteFooter() {
  return (
    <footer className="aira-footer">
      <div className="footer-top">
        <p className="aira-eyebrow">Many moods. One you.</p>
        <Link href="/shop">
          Find your next expression <span>↗</span>
        </Link>
      </div>
      <div className="footer-main">
        <Link className="footer-mark" href="/">
          AIRA
        </Link>
        <div>
          <p>The house</p>
          <Link href="/story">Our point of view</Link>
          <Link href="/journal">The journal</Link>
          <Link href="/visit">Personal styling</Link>
        </div>
        <div>
          <p>The wardrobe</p>
          <Link href="/shop">All expressions</Link>
          <Link href="/shop?mood=Bridal">The bridal edit</Link>
          <Link href="/saved">Your moodboard</Link>
          <Link href="/bag">Your bag</Link>
        </div>
        <div>
          <p>A little help</p>
          <Link href="/help#shipping">Shipping</Link>
          <Link href="/help#returns">Returns</Link>
          <Link href="/help#care">Care & keeping</Link>
          <Link href="/help#contact">Contact</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} AIRA</span>
        <span>
          An imagined fashion house. Catalogue and checkout are previews.
        </span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
