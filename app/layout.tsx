import type React from "react";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "THOR → METRO Migration & Staking",
  description: "Migrate THOR/yTHOR to METRO and stake on Base chain",
  generator: "v0.app"
};

export const viewport: Viewport = {
  themeColor: "#1a1d24"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased min-h-screen">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
