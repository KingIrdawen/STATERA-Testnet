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
  // Split features into two rows
  const topRow = features.slice(0, 3); // Cards 1-3
  const bottomRow = features.slice(3, 6); // Cards 4-6

  // Duplicate for seamless loop
  const duplicatedTopRow = [...topRow, ...topRow];
  const duplicatedBottomRow = [...bottomRow, ...bottomRow];

  return (
    <div className="w-full overflow-hidden" style={{ '--card-w': '260px', '--gap': '1.5rem' } as React.CSSProperties}>
      {/* Top row */}
      <div className="marquee-container group mb-4">
        <div className="marquee-track marquee-track-top">
          {duplicatedTopRow.map((feature, index) => (
            <div
              key={`top-${index}`}
              className="marquee-card flex-shrink-0 w-[260px] sm:w-[280px] h-[120px] bg-white/5 border border-white/10 rounded-lg p-4 hover:border-[#EF9B13]/50 transition-colors duration-300 text-center"
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

      {/* Bottom row with offset */}
      <div className="marquee-container group">
        <div className="marquee-track marquee-track-bottom">
          {duplicatedBottomRow.map((feature, index) => (
            <div
              key={`bottom-${index}`}
              className="marquee-card flex-shrink-0 w-[260px] sm:w-[280px] h-[120px] bg-white/5 border border-white/10 rounded-lg p-4 hover:border-[#EF9B13]/50 transition-colors duration-300 text-center"
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
        @keyframes marquee-left-to-right {
          0% {
            transform: translateX(calc(-50% - 0.75rem));
          }
          100% {
            transform: translateX(0);
          }
        }

        @keyframes marquee-left-to-right-bottom {
          0% {
            transform: translateX(calc(-50% - 0.75rem + var(--offset-x, 130px)));
          }
          100% {
            transform: translateX(var(--offset-x, 130px));
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
          animation: marquee-left-to-right 40s linear infinite;
        }

        .marquee-track-bottom {
          --offset-x: 130px;
          animation: marquee-left-to-right-bottom 40s linear infinite;
        }

        @media (min-width: 640px) and (max-width: 1023px) {
          .marquee-track-bottom {
            --offset-x: 140px;
          }
        }

        @media (min-width: 1024px) {
          .marquee-track-bottom {
            --offset-x: 130px;
          }
        }

        @media (max-width: 640px) {
          .marquee-track-bottom {
            --offset-x: 120px;
          }
        }

        .marquee-container:hover .marquee-track {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none;
          }
          .marquee-track-bottom {
            transform: translateX(var(--offset-x, 130px));
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

