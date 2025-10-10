'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function ComingSoon() {
  return (
    <div className="min-h-[100dvh] bg-black flex items-center justify-center relative overflow-hidden">
      {/* Animation de fond */}
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover z-0 motion-safe:opacity-100 motion-reduce:hidden"
      >
        <source src="/Animation intro.mp4" type="video/mp4" />
        Votre navigateur ne supporte pas la lecture vidéo.
      </video>

      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Contenu */}
      <div className="relative z-20 text-center max-w-4xl mx-auto px-4 sm:px-8">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/Logo-Axone.webp"
              alt="AXONE Logo"
              width={200}
              height={67}
              sizes="(min-width: 768px) 200px, 150px"
              className="h-16 w-auto sm:h-20 md:h-24 mx-auto"
              priority
            />
          </Link>
        </div>

        {/* Titre principal */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 inline-block bg-gradient-to-r from-[#fab062] to-[#5a9a9a] bg-clip-text text-transparent">
          Coming Soon
        </h1>

        {/* Sous-titre */}
        <p className="text-lg sm:text-xl md:text-2xl text-[#5a9a9a] mb-8 leading-relaxed font-medium max-w-2xl mx-auto">
          The Axone application will be available soon. Stay connected to be among the first to discover our revolutionary platform.
        </p>

        {/* Bouton retour */}
        <div className="mt-12">
          <Link
            href="/"
            className="inline-flex items-center px-8 py-3 md:px-10 md:py-4 rounded-lg bg-[#fab062] text-[#011f26] font-semibold text-lg md:text-xl shadow-2xl transition-all duration-300 hover:bg-[#e89a4a] hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#fab062] focus:ring-offset-2 focus:ring-offset-[#011f26] tracking-tight"
          >
            Back to Home
          </Link>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-16 text-center">
          <p className="text-sm sm:text-base text-[#5a9a9a] mb-4">
            Follow us for the latest updates
          </p>
          <div className="flex justify-center gap-6">
            <Link
              href="/x"
              className="text-[#5a9a9a] hover:text-[#fab062] transition-colors"
              aria-label="X (Twitter)"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </Link>

            <Link
              href="/discord"
              className="text-[#5a9a9a] hover:text-[#fab062] transition-colors"
              aria-label="Discord"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
