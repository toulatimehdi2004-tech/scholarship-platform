import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AnimatedBackground from "@/components/AnimatedBackground";
import RouteTracker from "@/components/RouteTracker";
import { ThemeProvider } from "@/lib/ThemeContext";
import { LanguageProvider } from "@/lib/i18n";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moroccan Scholar (منحة المغرب) — Chinese University Scholarships & 3D Tours",
  description:
    "Exclusively for Moroccan scholars: CSC full scholarships, 100+ Chinese university campuses in 3D VR, sworn document translations, and admissions tracking.",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full bg-background text-foreground antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <RouteTracker />
            <AnimatedBackground />
            <Navbar />
            <main className="relative z-10 pt-16">{children}</main>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
