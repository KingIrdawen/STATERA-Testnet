import { Playfair_Display, Cinzel } from 'next/font/google';

export const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  style: ['italic'],
  weight: ['400', '500'],
  display: 'swap',
});

export const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

// Canela Sans - Note: Font files (CanelaSans*.woff2/.otf/.ttf) must be added to the project
// and loaded via next/font/local to perfectly match the Statera brand charter.
// Until then, we use "Canela Sans" as the first font family with serif fallbacks.
// Once font files are available, create a localFont configuration here and expose as --font-canela.
