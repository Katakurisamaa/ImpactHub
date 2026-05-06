import type { Metadata } from "next";
import { Outfit, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import NextTopLoader from 'nextjs-toploader';
import ThreeJsBackground from '@/components/ThreeJsBackground';
import RevealObserver from '@/components/RevealObserver';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "ImpactHub - Connect, Grow, Delegate",
  description: "The modular church management platform for communities.",
};

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const cormorant = Cormorant_Garamond({ weight: ["300", "400", "500", "600", "700"], subsets: ["latin"], variable: "--font-heading", display: "swap" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={`${outfit.variable} ${cormorant.variable} font-sans`}>
        <NextTopLoader color="#d4a843" height={3} showSpinner={false} />
        <RevealObserver />
        <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-navy text-foreground">
          <ThreeJsBackground />
          <main className="flex-1 relative z-10 w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
