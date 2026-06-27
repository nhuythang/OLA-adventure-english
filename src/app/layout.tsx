import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";

// Nunito (body) + Fredoka (display) — friendly rounded forms, Latin coverage.
// next/font self-hosts these so there's no layout shift and they work offline.
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OLA English Adventure",
  description: "A sticker-collecting English game for children aged 4–7.",
  applicationName: "OLA English",
  // Installable-app hints for iPadOS: launch fullscreen, no Safari chrome. The
  // manifest (src/app/manifest.ts) and icons (icon.svg / apple-icon.png) are
  // auto-linked by Next from the App Router file conventions.
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OLA English",
  },
  // Next emits the modern `mobile-web-app-capable`; add the legacy Apple tag too
  // so older iPadOS also launches fullscreen from the home screen.
  other: { "apple-mobile-web-app-capable": "yes" },
};

// Mobile-first, locked viewport — we want kids tapping, not pinching/zooming.
// viewportFit: cover supports safe-area insets on iPad (native-feel rules).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FF6B5E", // coral — tints the iOS status bar / Android chrome
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${fredoka.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
