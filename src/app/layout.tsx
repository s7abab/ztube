import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ztube | Cinematic Movie Discovery",
  description: "A mobile-first TMDB-powered movie discovery app with reels and AI recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
