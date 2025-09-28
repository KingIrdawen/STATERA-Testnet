'use client';

import { useEffect, useRef, useState } from 'react';

interface MetricProps {
  value: string;
  label: string;
  description: string;
  delay: number;
}

function Metric({ value, label, description, delay }: MetricProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`text-center transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="text-4xl font-bold text-white mb-2">{value}</div>
      <div className="text-lg font-bold text-white mb-1">{label}</div>
      <div className="text-sm text-gray-400">{description}</div>
    </div>
  );
}

export default function MetricsSection() {
  const metrics = [
    { value: '12', label: 'Vaults', description: 'Active investment vaults', delay: 500 },
    { value: '2,847', label: 'Users', description: 'Active platform users', delay: 1000 },
    { value: '$4.2M', label: 'Volume Deposited', description: 'Total platform deposits', delay: 1500 },
    { value: '$4.2M', label: 'Total Value Locked', description: 'Assets under management', delay: 2000 },
    { value: '$1.3M', label: 'Amount Redistributed', description: 'Rewards distributed to users', delay: 2500 },
  ];

  return (
        <div className="w-full h-full bg-black flex items-center justify-start p-8">
          <div className="px-36 md:px-48">
            <div className="max-w-lg">
              <div className="space-y-12">
                {/* Ligne du haut - 3 métriques */}
                <div className="grid grid-cols-3 gap-16">
                  <Metric {...metrics[0]} />
                  <Metric {...metrics[1]} />
                  <Metric {...metrics[2]} />
                </div>
                
                {/* Ligne du bas - 2 métriques centrées */}
                <div className="flex justify-center gap-8">
                  <Metric {...metrics[3]} />
                  <Metric {...metrics[4]} />
                </div>
              </div>
            </div>
          </div>
        </div>
  );
}
