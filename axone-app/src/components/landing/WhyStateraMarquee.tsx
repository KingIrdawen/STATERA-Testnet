'use client';

interface FeatureCard {
  title: string;
  description: string;
}

const features: FeatureCard[] = [
  {
    title: 'One deposit, diversified exposure',
    description: 'Access an index-style allocation through a single deposit.',
  },
  {
    title: 'Adaptive by design',
    description: 'Strategy rules rebalance when allocations drift from targets.',
  },
  {
    title: 'On-chain transparency',
    description: 'Key operations are verifiable with on-chain accounting.',
  },
  {
    title: 'Buy back and burn',
    description: 'Token mechanics may include supply reduction as documented.',
  },
  {
    title: 'Power of Hyperunit',
    description: 'Execution layer designed for efficient on-chain operations.',
  },
  {
    title: 'Ultra fast execution',
    description: 'Built for low-latency execution on supported infrastructure.',
  },
];

export function WhyStateraMarquee() {
  // Duplicate features for seamless loop
  const duplicatedFeatures = [...features, ...features];

  return (
    <div className="w-full overflow-hidden">
      <div className="marquee-container group">
        <div className="marquee-track">
          {duplicatedFeatures.map((feature, index) => (
            <div
              key={index}
              className="marquee-card flex-shrink-0 w-[260px] sm:w-[280px] h-[120px] bg-white/5 border border-white/10 rounded-lg p-4 hover:border-[#EF9B13]/50 transition-colors duration-300"
            >
              <h4 className="text-[#EF9B13] font-medium text-base mb-2">
                {feature.title}
              </h4>
              <p className="text-white/70 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-50% - 0.75rem));
          }
        }

        .marquee-container {
          width: 100%;
          overflow: hidden;
          position: relative;
        }

        .marquee-track {
          display: flex;
          gap: 1.5rem;
          width: fit-content;
          animation: marquee 40s linear infinite;
        }

        .marquee-container:hover .marquee-track {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none;
          }
          .marquee-container {
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
          }
          .marquee-card {
            scroll-snap-align: start;
          }
        }

        @media (max-width: 640px) {
          .marquee-card {
            width: 240px;
          }
        }
      `}</style>
    </div>
  );
}

