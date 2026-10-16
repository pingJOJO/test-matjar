import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Cairo } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { StoreInitializer } from "@/components/common/StoreInitializer";
import { GoogleAuthProviderWrapper } from "@/components/auth/GoogleAuthProviderWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "A2Z Parts | Heavy Equipment Aftermarket Parts",
  description: "Global aftermarket parts for Caterpillar, Komatsu, Bobcat, JCB, Kubota, Yanmar, Cummins, and heavy machinery. Fast jobsite delivery and 100% OEM interchange compatibility.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} ${jetbrainsMono.variable} ${cairo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900 font-sans">
        <GoogleAuthProviderWrapper>
          <StoreInitializer />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <MobileBottomNav />
        </GoogleAuthProviderWrapper>
      </body>
    </html>
  );
}
