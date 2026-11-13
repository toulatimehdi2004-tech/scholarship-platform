import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PortalGate from "@/components/PortalGate";
import AnimatedBackground from "@/components/AnimatedBackground";
import RouteTracker from "@/components/RouteTracker";
import { ThemeProvider } from "@/lib/ThemeContext";
import { LanguageProvider } from "@/lib/i18n";
import { ApplicationModeProvider } from "@/lib/ApplicationModeContext";

export const metadata: Metadata = {
  title: "ScholarChina — Chinese University Scholarships & 3D Campus Tours",
  description:
    "ScholarChina: Official gateway to CSC full scholarships, 100+ prestigious Chinese university campuses in 3D VR, document checklists, and application pipeline tracking.",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var l = localStorage.getItem('site-lang');
                if (l === 'ar') {
                  document.documentElement.dir = 'rtl';
                  document.documentElement.lang = 'ar';
                } else if (l === 'fr') {
                  document.documentElement.lang = 'fr';
                  document.documentElement.dir = 'ltr';
                }

                // Enforce Dark Mode as the Default Theme
                var t = localStorage.getItem('theme');
                if (!t || t === 'light') {
                  localStorage.setItem('theme', 'dark');
                }
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
              } catch(e) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-[#030712] text-foreground antialiased selection:bg-cyan/30">
        <ThemeProvider>
          <LanguageProvider>
            <ApplicationModeProvider>
              <RouteTracker />
              <AnimatedBackground />
              <PortalGate navbar={<Navbar />} footer={<Footer />}>
                {children}
              </PortalGate>
            </ApplicationModeProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
