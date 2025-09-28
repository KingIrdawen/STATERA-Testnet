'use client';

import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
}

export default function TypewriterText({ text, speed = 50, className = "" }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  useEffect(() => {
    if (!inView) return;

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed, inView]);

  // Reset when component comes into view
  useEffect(() => {
    if (inView && currentIndex === 0) {
      setDisplayedText('');
      setCurrentIndex(0);
    }
  }, [inView, currentIndex]);

  return (
    <h2 
      ref={ref}
      className={`${className}`}
    >
      {displayedText}
      <span className="animate-pulse">|</span>
    </h2>
  );
}
