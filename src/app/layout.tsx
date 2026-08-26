import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinPulse | Stock & Crypto Intelligence Hub",
  description: "Real-time stock, crypto, and macroeconomic intelligence hub with AI market takeaways, Bull/Bear sentiment voting, and Wall Street native voice audio briefing.",
  keywords: ["stock news", "crypto news", "bitcoin", "nvidia", "nasdaq", "finpulse", "ai summarizer", "wall street briefing"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
