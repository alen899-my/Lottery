import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kerala Win | Official Live Kerala Lottery Results",
  description: "Check the latest Kerala state lottery results live. Fast, accurate, and gold-standard updates for all daily draws including Win-Win, Akshaya, and more.",
  keywords: ["kerala lottery results", "live lottery result kerala", "kerala win", "lottery result today"],
  
  // 1. UPDATED: New Google Search Console Verification Code
  verification: {
    google: "p1V4dZZtxMUqIYDIxFs2v3ig_OlOGMEfHt60Bgnzjmg",
  },

  openGraph: {
    title: "Kerala Win - Fast & Accurate Lottery Results",
    description: "Your trusted source for Kerala State Lottery updates.",
    url: "https://kerala-win.vercel.app",
    siteName: "Kerala Win",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Kerala Win Lottery Results",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kerala Win | Live Lottery Results",
    description: "Instant Kerala State Lottery updates.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Kerala Win",
    "url": "https://kerala-win.vercel.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://kerala-win.vercel.app/results?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0a0a0a]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}