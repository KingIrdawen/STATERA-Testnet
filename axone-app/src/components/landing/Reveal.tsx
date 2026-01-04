'use client';

import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
}

export function Reveal({ children, delayMs = 0, className = '' }: RevealProps) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.05,
    triggerOnce: true,
    rootMargin: '100px 0px',
  });

  useEffect(() => {
    if (inView && !hasAnimated) {
      const timer = setTimeout(() => {
        setHasAnimated(true);
      }, delayMs);
      return () => clearTimeout(timer);
    }
  }, [inView, delayMs, hasAnimated]);

  const shouldAnimate = hasAnimated || inView;
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div
      ref={ref}
      className={`transition-all duration-[1800ms] ease-out ${
        shouldAnimate && !prefersReducedMotion
          ? 'opacity-100 translate-y-0'
          : prefersReducedMotion
          ? 'opacity-100'
          : 'opacity-0 translate-y-6'
      } ${className}`}
    >
      {children}
    </div>
  );
}

