import type { Metadata } from "next";
import { Bungee, IBM_Plex_Mono, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const displayFont = Bungee({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const bodyFont = Noto_Sans_SC({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "PKYourCV",
  description: "把个人主页和 PDF 简历丢进来，接受刻薄大厂 HR 的综艺式审判。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full body-type text-[var(--ink)]">{children}</body>
    </html>
  );
}
