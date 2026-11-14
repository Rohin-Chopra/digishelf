import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const sans = Inter({
  variable: "--next-font-sans",
  subsets: ["latin"],
});

const display = Bebas_Neue({
  variable: "--next-font-display",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Digishelf",
    template: "%s | Digishelf",
  },
  description:
    "A digital shelf for the movies and TV shows you love, so you can cherish them later.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
