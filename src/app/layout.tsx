import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "JOBSTREAM: The Internet's Live Job Feed",
  description: "Don't search for jobs. Let the jobs find you. Real-time job discovery and canonical aggregation.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2310b981'><path d='M13 2L3 14H12L11 22L21 10H12L13 2Z'/></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090b] text-zinc-100 antialiased selection:bg-emerald-500 selection:text-black flex flex-col justify-between">
        <div>
          <Navbar />
          <main className="pb-20 md:pb-8">{children}</main>
        </div>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}