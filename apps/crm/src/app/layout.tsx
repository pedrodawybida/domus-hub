import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const barlow = Barlow_Condensed({ subsets: ["latin"], weight: ["400", "500", "700", "800"], variable: "--font-barlow", display: "swap" });

export const metadata: Metadata = {
  title: "Domus CRM",
  description: "Sistema de Gestão Domus Consórcios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${barlow.variable} h-full antialiased`}>
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
