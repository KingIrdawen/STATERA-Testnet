'use client';

import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

interface ReliefImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export default function ReliefImage({ src, alt, width, height, className = "" }: ReliefImageProps) {
  const [reliefProgress, setReliefProgress] = useState(0);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  useEffect(() => {
    if (inView) {
      // Animation de 0 à 1 sur 4 secondes pour plus de visibilité
      const startTime = Date.now();
      const duration = 4000; // 4 secondes

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function plus douce pour mieux voir l'effet
        const easeOut = 1 - Math.pow(1 - progress, 2);
        
        setReliefProgress(easeOut);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [inView]);

  // Calcul des valeurs interpolées - Effet bombé très visible
  const shadowOpacity = reliefProgress * 0.9; // De 0 à 0.9
  const shadowBlur = reliefProgress * 100; // De 0 à 100 (plus flou)
  const shadowOffsetY = reliefProgress * 35; // De 0 à 35 (plus éloigné)
  const borderRadius = reliefProgress * 50; // De 0 à 50px (beaucoup plus arrondi)
  
  // Effet bombé - gradients radiaux et surbrillances centrales
  const bulgeIntensity = reliefProgress * 0.6;
  const centerGlow = reliefProgress * 0.4;
  const edgeHighlight = reliefProgress * 0.5;
  
  const dynamicStyles = {
    boxShadow: `
      0 ${shadowOffsetY}px ${shadowBlur}px rgba(0,0,0,${shadowOpacity}),
      0 ${shadowOffsetY * 0.8}px ${shadowBlur * 0.7}px rgba(0,0,0,${shadowOpacity * 0.8}),
      0 ${shadowOffsetY * 0.5}px ${shadowBlur * 0.4}px rgba(0,0,0,${shadowOpacity * 0.6}),
      0 ${shadowOffsetY * 0.2}px ${shadowBlur * 0.2}px rgba(0,0,0,${shadowOpacity * 0.4}),
      inset 0 0 ${bulgeIntensity * 20}px rgba(255,255,255,${centerGlow}),
      inset 0 0 ${bulgeIntensity * 10}px rgba(255,255,255,${centerGlow * 0.6}),
      inset ${bulgeIntensity * 2}px ${bulgeIntensity * 2}px ${bulgeIntensity * 8}px rgba(255,255,255,${edgeHighlight * 0.3}),
      inset -${bulgeIntensity * 2}px -${bulgeIntensity * 2}px ${bulgeIntensity * 6}px rgba(200,200,200,${edgeHighlight * 0.2}),
      inset ${bulgeIntensity * 1}px ${bulgeIntensity * 1}px 0 rgba(255,255,255,${edgeHighlight * 0.4}),
      inset -${bulgeIntensity * 1}px -${bulgeIntensity * 1}px 0 rgba(100,100,100,${reliefProgress * 0.2})
    `,
    border: `1px solid rgba(180,180,180,${reliefProgress * 0.5})`,
    borderRadius: `${borderRadius}px`,
    transform: `translateZ(${reliefProgress * 40}px) scale(${1 + reliefProgress * 0.02})`,
    background: `radial-gradient(circle at center, rgba(255,255,255,${reliefProgress * 0.1}) 0%, transparent 70%)`,
    animationDelay: `${reliefProgress * 0.1}s`,
  };

  return (
    <div 
      ref={ref} 
      className={`transition-all duration-1000 ease-out ${className}`}
      style={dynamicStyles}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-auto"
      />
    </div>
  );
}
