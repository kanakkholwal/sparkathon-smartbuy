import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Walmart SmartBuy",
  keywords: ["Walmart", "SmartBuy", "Shopping", "AI", "Navigation", "Grocery"],
  description: "SmartBuy+ is an AI-powered shopping assistant that optimizes your grocery shopping experience at Walmart. It helps you find items quickly, suggests products, and reduces decision fatigue.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn('antialiased',geistSans.className, geistMono.className)}
      >
        {children}
      </body>
    </html>
  );
}
