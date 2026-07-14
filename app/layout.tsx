import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import FloatingChatbot from "@/components/FloatingChatbot";
import { Montserrat, Cinzel_Decorative } from "next/font/google";
import { Metadata } from "next";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const cinzelDecorative = Cinzel_Decorative({ subsets: ["latin"], weight: ["400", "700", "900"], variable: "--font-cinzel-decorative" });

export const metadata: Metadata = {
  title: {
    default: "Glaze & Gear — Premium Ceramics & Automotive Gifts",
    template: "%s | Glaze & Gear",
  },
  description: "Discover handcrafted ceramic glazeware and premium automotive gear at Glaze & Gear. Unique gifts for car lovers and homemakers. Shop now — free gift wrapping available.",
  keywords: ["ceramic gifts", "automotive gear", "premium gifts India", "car accessories", "glaze pottery"],
  openGraph: {
    type: "website",
    siteName: "Glaze & Gear",
    title: "Glaze & Gear — Premium Ceramics & Automotive Gifts",
    description: "Unique handcrafted ceramics and premium automotive gear. Perfect for every occasion.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Glaze & Gear — Premium Gifts",
    description: "Handcrafted ceramics & automotive gear for every occasion.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${cinzelDecorative.variable} font-sans bg-[#F9EAEA]/30 text-[#0a0a0a]`}>
        <Providers>
          <div className="print:hidden">
            <Navbar />
          </div>
          {children}
          <div className="print:hidden">
            <Footer />
            <FloatingChatbot />
          </div>
        </Providers>
      </body>
    </html>
  );
}