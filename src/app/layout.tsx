import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

// Load a clean, modern font and expose it as a CSS variable used in globals.css.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dorm Living OS",
  description:
    "Plan your dorm essentials. Answer a few questions and get a personalized, exportable checklist.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
