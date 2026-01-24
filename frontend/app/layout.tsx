import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kerala Win | Official Live Kerala Lottery Results",
  description: "Check the latest Kerala state lottery results live. Fast, accurate, and gold-standard updates for all daily draws including Win-Win, Akshaya, and more.",
  keywords: ["kerala lottery results", "live lottery result kerala", "kerala win", "lottery result today"],
  openGraph: {
    title: "Kerala Win - Fast & Accurate Lottery Results",
    description: "Your trusted source for Kerala State Lottery updates.",
    images: ["/og-image.jpg"], // Create a gold/green image for social sharing
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Kerala Win",
    "url": "https://yourdomain.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://yourdomain.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en" className="dark">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}