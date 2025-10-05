'use client';

import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface AnimatedButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function AnimatedButton({ href, children, className = "", delay = 0 }: AnimatedButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.7,
  });

  useEffect(() => {
    if (inView) {
      const timeout = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [inView, delay]);

  useEffect(() => {
    if (isVisible) {
      // Start breathing animation every 4 seconds
      const breathingInterval = setInterval(() => {
        setAnimationKey(prev => prev + 1); // Force re-render to restart animation
      }, 4000); // Breathing every 4 seconds

      return () => clearInterval(breathingInterval);
    }
  }, [isVisible]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <a
        href={href}
        key={animationKey}
        className={`${className} transform transition-all duration-300 hover:scale-105 hover:shadow-2xl breathing-animation`}
      >
        {children}
      </a>
    </div>
  );
}
