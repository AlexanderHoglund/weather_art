import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Kept per the plan; exposed as --font-arcade for optional use.
const arcade = localFont({
  src: "../public/Fonts/ARCADECLASSIC.ttf",
  variable: "--font-arcade",
  display: "swap",
});

export const metadata: Metadata = {
  title: "pixelWeather",
  description: "LoFi pixel-art weather.",
};

// Lock the viewport to the device, disable pinch-zoom (the original app did this
// via a gesturestart listener), and extend under notches for the full-bleed
// canvas scene.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0b0b16",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={arcade.variable}>
      <body>{children}</body>
    </html>
  );
}
