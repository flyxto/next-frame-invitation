import type { Metadata, Viewport } from "next";
import { Tinos } from "next/font/google";
import "./globals.css";

// Tinos is metric-compatible with Times New Roman, which the invitation uses.
const tinos = Tinos({
  variable: "--font-tinos",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Next Frame Short Film Festival 2026",
  description:
    "You're invited to Next Frame Short Film Festival 2026, organized by the Film and Television Studies Students' Association, University of Kelaniya.",
  icons: {
    icon: [{ url: "/images/logo.png", type: "image/png" }],
    apple: [{ url: "/images/logo.png", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0805",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={tinos.variable}>
      <body>{children}</body>
    </html>
  );
}
