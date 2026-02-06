import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Patience Pays | SIP/DCA Backtester",
  description: "Backtest your Systematic Investment Plan (SIP/DCA) strategy and see how patience and recurring investing compounds over time.",
  keywords: ["SIP", "DCA", "Dollar Cost Averaging", "Investment", "Backtester", "Stock Market"],
  authors: [{ name: "Patience Pays" }],
  openGraph: {
    title: "Patience Pays | SIP/DCA Backtester",
    description: "Long-term investing rewards consistency. Backtest your strategy today.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
