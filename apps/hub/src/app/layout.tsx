import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DOMUS | Plataforma Consultiva & Apresentação Interativa",
  description:
    "Negociação ética, técnica e transparente no mercado imobiliário brasileiro. Diagnóstico de perfil, educação financeira e simulação de ciclos patrimoniais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Source+Serif+4:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#060b1e] text-white">
        {children}
      </body>
    </html>
  );
}
