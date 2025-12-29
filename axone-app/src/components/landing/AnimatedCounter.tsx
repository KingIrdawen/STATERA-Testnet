'use client';

import { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  formatter?: (value: number) => string;
}

export function AnimatedCounter({
  value,
  duration = 2000,
  className = '',
  formatter,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!inView) {
      setDisplayValue(0);
      return;
    }

    // Reset and start animation
    setDisplayValue(0);
    startTimeRef.current = Date.now();

    const animate = () => {
      if (!startTimeRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = value * easeOutCubic;

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [inView, value, duration]);

  const formattedValue = formatter
    ? formatter(displayValue)
    : displayValue.toLocaleString();

  return (
    <span ref={ref} className={className}>
      {formattedValue}
    </span>
  );
}

