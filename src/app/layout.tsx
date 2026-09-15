import type { Metadata } from "next";
import {
  Anek_Telugu,
  Barlow,
  Barlow_Condensed,
  Caveat,
  Geist_Mono,
  Ramabhadra,
} from "next/font/google";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/** Modern UI Telugu — sleek, readable on web */
const anekTelugu = Anek_Telugu({
  variable: "--font-anek-telugu",
  subsets: ["telugu"],
  weight: ["400", "500", "600", "700", "800"],
});

/** Bold Telugu display — thick round forms for headlines */
const ramabhadra = Ramabhadra({
  variable: "--font-ramabhadra",
  subsets: ["telugu"],
  weight: "400",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kurupam Premier League | Cricket + Volleyball",
  description:
    "Kurupam Premier League — a free cricket and volleyball tournament hosted by Viresh Sir. Register your team. Launch 17 September 2026.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="te"
      className={`${barlow.variable} ${barlowCondensed.variable} ${caveat.variable} ${anekTelugu.variable} ${ramabhadra.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
