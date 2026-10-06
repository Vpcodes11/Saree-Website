import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { ShopProvider } from "../components/shop/ShopProvider";
import "./globals.css";
import "../styles/aira.css";
import "../styles/shop.css";
import "../styles/editorial.css";
import "../styles/maison.css";
const editorial = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-editorial",
  display: "swap",
});
const sans = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});
export const metadata: Metadata = {
  title: "AIRA — Wear your own story",
  description:
    "An Indian point of view. Discover six moods, an immersive showroom, and a wardrobe of your own.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body id="top" className={`${editorial.variable} ${sans.variable}`}>
        <ShopProvider>
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          {children}
        </ShopProvider>
      </body>
    </html>
  );
}
