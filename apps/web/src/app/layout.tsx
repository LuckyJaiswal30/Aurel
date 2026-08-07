import type { Metadata, Viewport } from "next";
import { Tiro_Devanagari_Hindi } from "next/font/google";
import localFont from "next/font/local";
import { applySavedThemeScript } from "@/lib/theme/theme";
import "./globals.css";

const anek = localFont({
  src: "./fonts/anek-devanagari-latin.woff2",
  variable: "--font-anek",
  weight: "100 800",
  declarations: [
    { prop: "ascent-override", value: "90%" },
    { prop: "descent-override", value: "30%" },
    { prop: "line-gap-override", value: "0%" },
    { prop: "font-stretch", value: "75% 125%" },
  ],
});

const anekDevanagari = localFont({
  src: "./fonts/anek-devanagari-devanagari.woff2",
  variable: "--font-anek-devanagari",
  weight: "100 800",
  preload: false,
  declarations: [
    { prop: "ascent-override", value: "90%" },
    { prop: "descent-override", value: "30%" },
    { prop: "line-gap-override", value: "0%" },
    { prop: "font-stretch", value: "75% 125%" },
  ],
});

const tiro = Tiro_Devanagari_Hindi({
  variable: "--font-tiro",
  subsets: ["latin", "devanagari"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: { default: "Aurel", template: "%s · Aurel" },
  description: "A study tutor that learns from your own notes.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfb" },
    { media: "(prefers-color-scheme: dark)", color: "#151515" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${anek.variable} ${anekDevanagari.variable} ${tiro.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: applySavedThemeScript }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
