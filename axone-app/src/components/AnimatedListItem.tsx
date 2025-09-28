'use client';

import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface AnimatedListItemProps {
  number: string;
  title: string;
  description: string;
  delay: number;
}

function AnimatedListItem({ number, title, description, delay }: AnimatedListItemProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.7,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (inView) {
      const timeout = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [inView, delay]);

  return (
    <div
      ref={ref}
      className={`flex items-start gap-6 transition-all duration-1200 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="flex-shrink-0 w-12 h-12 bg-[#fab062] text-[#011f26] rounded-full flex items-center justify-center font-bold text-xl">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-lg text-[#3a7373] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export default AnimatedListItem;
