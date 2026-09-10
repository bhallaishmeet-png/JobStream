import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "JOBSTREAM: The Internet's Live Job Feed",
  description: "Don't search for jobs. Let the jobs find you. Real-time job discovery and canonical aggregation.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2310b981'><path d='M13 2L3 14H12L11 22L21 10H12L13 2Z'/></svg>",
  },
};

const themeScript = `(function() {
  try {
    var savedTheme = localStorage.getItem('jobstream-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = savedTheme ? savedTheme : (prefersDark ? 'dark' : 'light');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  } catch (e) {}
})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 antialiased selection:bg-emerald-500 selection:text-black flex flex-col justify-between transition-colors duration-150">
        <ThemeProvider>
          <div>
            <Navbar />
            <main className="pb-20 md:pb-8">{children}</main>
          </div>
          <Footer />
          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  );
}