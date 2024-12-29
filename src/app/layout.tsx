import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { InputDataProvider } from "@/context/InputDataContext";
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
  title: "FLAC Selecter",
  description: "トンネル構造パラメータ計算ツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <InputDataProvider>
          {children}
        </InputDataProvider>
      </body>
    </html>
  );
}
