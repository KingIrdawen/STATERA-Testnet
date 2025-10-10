import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AXONE - Plateforme de gestion de vaults crypto",
  description: "La plateforme de gestion de vaults crypto nouvelle génération. Maximisez vos rendements avec notre technologie blockchain avancée.",
  icons: {
    icon: '/favicon.webp',
    shortcut: '/favicon.webp',
    apple: '/favicon.webp',
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
        {children}
      </body>
    </html>
  );
}
