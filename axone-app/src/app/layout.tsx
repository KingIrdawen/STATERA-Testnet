import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "STATERA - Plateforme de gestion de vaults crypto",
  description: "La plateforme de gestion de vaults crypto nouvelle génération. Maximisez vos rendements avec notre technologie blockchain avancée.",
  icons: {
    icon: '/Logo-Axone.png',
    shortcut: '/Logo-Axone.png',
    apple: '/Logo-Axone.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
