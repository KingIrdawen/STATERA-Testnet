'use client';

import React, { useState, useEffect, useRef } from 'react';

interface AnimatedMetricProps {
  value: string;
  label: string;
  description?: string;
  isVisible: boolean;
  delay?: number;
  duration?: number;
}

export default function AnimatedMetric({ 
  value, 
  label, 
  description, 
  isVisible, 
  delay = 0, 
  duration = 1000 
}: AnimatedMetricProps) {
  // Suppress unused variable warning
  void description;
  const [animatedValue, setAnimatedValue] = useState('0');
  const [hasAnimated, setHasAnimated] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      setHasAnimated(true);
      
      // Parse numeric value for animation
      const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
      const suffix = value.replace(/[0-9.,]/g, '');
      
      if (!isNaN(numericValue)) {
        // Animate numeric value
        const startTime = Date.now();
        const startValue = 0;
        const endValue = numericValue;
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Easing function (ease-out)
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const currentValue = startValue + (endValue - startValue) * easeOut;
          
          // Format the value based on original format
          let formattedValue: string;
          if (value.includes(',')) {
            formattedValue = Math.floor(currentValue).toLocaleString();
          } else if (value.includes('.')) {
            formattedValue = currentValue.toFixed(1);
          } else {
            formattedValue = Math.floor(currentValue).toString();
          }
          
          setAnimatedValue(formattedValue + suffix);
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        
        // Start animation after delay
        timeoutRef.current = setTimeout(() => {
          requestAnimationFrame(animate);
        }, delay);
      } else {
        // Non-numeric value, show immediately
        timeoutRef.current = setTimeout(() => {
          setAnimatedValue(value);
        }, delay);
      }
    } else if (!isVisible) {
      // Reset when not visible
      setAnimatedValue('0');
      setHasAnimated(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isVisible, value, delay, duration, hasAnimated]);

  return (
    <div className="text-center flex flex-col items-center">
      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 min-h-[2rem] sm:min-h-[2.5rem] md:min-h-[3rem] flex items-center justify-center">
        {animatedValue}
      </div>
      <div className="text-sm sm:text-base md:text-lg font-bold text-white mb-1 text-center whitespace-nowrap">{label}</div>
    </div>
  );
}
