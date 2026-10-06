import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="saved-page saved-heading">
        <p className="aira-eyebrow">A turn in the story</p>
        <h1>Another direction?</h1>
        <p>
          This page could not be found. The collection is a lovely place to
          begin again.
        </p>
        <Link href="/shop" className="aira-button" style={{ marginTop: 30 }}>
          Explore AIRA ↗
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
