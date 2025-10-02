'use client';

import Header from '@/components/Header';
import Section, { TextZone, AnimationZone } from '@/components/Section';
import TypewriterText from '@/components/TypewriterText';
import AnimatedListItem from '@/components/AnimatedListItem';
import Footer from '@/components/Footer';
import AnimatedButton from '@/components/AnimatedButton';
import AnimatedMetric from '@/components/AnimatedMetric';
import ReliefImage from '@/components/ReliefImage';
import ScrollAnimation from '@/components/ScrollAnimation';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

export default function Home() {
  const [visibleMetrics, setVisibleMetrics] = useState(0);
  const { ref: sectionRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  useEffect(() => {
    if (inView) {
      // Animate metrics one by one with delays
      const metrics = [0, 1, 2, 3, 4];
      metrics.forEach((index) => {
        setTimeout(() => {
          setVisibleMetrics(index + 1);
        }, index * 600); // 600ms delay between each metric
      });
    }
  }, [inView]);

  const metrics = [
    { value: '12', label: 'Vaults', description: 'Active investment vaults' },
    { value: '2,847', label: 'Users', description: 'Active platform users' },
    { value: '$4.2M', label: 'Volume Deposited', description: 'Total platform deposits' },
    { value: '$4.2M', label: 'Total Value Locked', description: 'Assets under management' },
    { value: '$1.3M', label: 'Amount Redistributed', description: 'Rewards distributed to users' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Section 1 - Hero */}
      <section className="min-h-screen relative flex items-center justify-center overflow-hidden">
        {/* Animation de fond */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/Animation intro.mp4" type="video/mp4" />
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
        
        {/* Contenu au premier plan */}
        <div className="relative z-10 max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 inline-block bg-gradient-to-r from-[#fab062] to-[#4a8c8c] bg-clip-text text-transparent transition-colors duration-300">
            A Decentralized<br />
            Investment<br />
            Solution
          </h1>
          
          <p className="text-lg md:text-xl text-[#3a7373] mb-8 leading-relaxed font-medium">
            Axone offers an innovative approach to investment by leveraging blockchain technology to automate and optimize portfolio management while delivering value to its users.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/app"
              className="inline-flex items-center px-4 py-1.5 md:px-6 md:py-2 rounded-lg bg-[#fab062] text-[#011f26] font-semibold text-sm md:text-base shadow-[0_6px_12px_rgba(0,0,0,0.35),0_1px_0_rgba(255,255,255,0.3)_inset,0_-1px_0_rgba(0,0,0,0.15)_inset] transition-all duration-300 hover:bg-[#e89a4a] hover:scale-105 hover:shadow-[0_8px_16px_rgba(0,0,0,0.4),0_1px_0_rgba(255,255,255,0.4)_inset,0_-1px_0_rgba(0,0,0,0.2)_inset] focus:outline-none focus:ring-2 focus:ring-[#fab062] focus:ring-offset-2 focus:ring-offset-[#011f26] tracking-tight"
            >
              Get Started
            </a>

            <a
              href="/learn"
              className="inline-flex items-center px-4 py-1.5 md:px-6 md:py-2 rounded-lg border-2 border-white text-white font-semibold text-sm md:text-base shadow-[0_6px_12px_rgba(0,0,0,0.35),0_1px_0_rgba(255,255,255,0.3)_inset,0_-1px_0_rgba(0,0,0,0.15)_inset] transition-all duration-300 hover:bg-white hover:text-[#011f26] hover:scale-105 hover:shadow-[0_8px_16px_rgba(0,0,0,0.4),0_1px_0_rgba(255,255,255,0.4)_inset,0_-1px_0_rgba(0,0,0,0.2)_inset] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#011f26] tracking-tight"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

          {/* Section 2 - Metrics */}
          <section ref={sectionRef} className="py-16 bg-black">
            <div className="max-w-7xl mx-auto px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                {metrics.map((metric, index) => (
                  <div 
                    key={index}
                    className={`transition-all duration-1000 ease-out ${
                      index < visibleMetrics 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-8'
                    }`}
                  >
                    <AnimatedMetric
                      value={metric.value}
                      label={metric.label}
                      description={metric.description}
                      isVisible={index < visibleMetrics}
                      delay={0}
                      duration={1500}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 3 - Performance */}
          <Section>
            <AnimationZone bgColor="bg-black" fullWidth>
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="/Animtion_Logo_Axone.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </AnimationZone>

            <TextZone bgColor="bg-black" alignRight>
              <div className="text-left">
                <TypewriterText 
                  text="Beyond vision, Axone is built on strong pillars that drive its uniqueness and long-term value"
                  speed={30}
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-6 inline-block bg-gradient-to-r from-[#fab062] to-[#3a7373] bg-clip-text text-transparent transition-colors duration-300"
                />
              </div>
            </TextZone>
          </Section>

          {/* Section 4 - Smart Rebalancing */}
          <Section reducedHeight={true}>
            <TextZone bgColor="bg-black">
              <div className="text-left">
                <ScrollAnimation delay={0}>
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-6 inline-block bg-gradient-to-r from-[#fab062] to-[#3a7373] bg-clip-text text-transparent transition-colors duration-300">
                    Smart Rebalancing
                  </h2>

                  <p className="text-lg md:text-xl text-[#3a7373] mb-8 leading-relaxed font-medium">
                    Axone delivers smart, dynamic crypto indexes that automatically rebalance every hour to secure gains and optimize allocations. It automates the strategies of top traders, ensuring your portfolio adapts effortlessly to fast-moving markets.
                  </p>
                </ScrollAnimation>
              </div>
            </TextZone>

            <AnimationZone bgColor="bg-black">
              <div className="flex items-center justify-center h-full p-8">
                <div className="max-w-md w-full">
                  <ReliefImage
                    src="/image_smart-rebalancing.webp"
                    alt="Smart Rebalancing"
                    width={400}
                    height={300}
                    className="overflow-hidden hover:scale-[1.08] transition-transform duration-300"
                  />
                </div>
              </div>
            </AnimationZone>
          </Section>

          {/* Section 5 - Controlled Inflation */}
          <Section reducedHeight={true}>
            <AnimationZone bgColor="bg-black">
              <div className="flex items-center justify-center h-full p-8">
                <div className="max-w-2xl w-full">
          <Image
                    src="/image_inflation.webp"
                    alt="Controlled Inflation"
                    width={750}
                    height={600}
                    className="w-full h-auto scale-[2]"
                  />
                </div>
              </div>
            </AnimationZone>

            <TextZone bgColor="bg-black">
              <div className="text-left">
                <ScrollAnimation delay={200}>
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-6 inline-block bg-gradient-to-r from-[#fab062] to-[#3a7373] bg-clip-text text-transparent transition-colors duration-300">
                    Controlled Inflation
                  </h2>

                  <p className="text-lg md:text-xl text-[#3a7373] mb-8 leading-relaxed font-medium">
                    Axone introduces a fixed 3% annual inflation fully redistributed to index holders, turning growth into direct rewards for the community. This mechanism strengthens engagement, boosts index value over time, and fuels a virtuous cycle of adoption and shared prosperity.
                  </p>
                </ScrollAnimation>
              </div>
            </TextZone>
          </Section>

          {/* Section 6 - The AXONE Token */}
          <Section reducedHeight={true}>
            <TextZone bgColor="bg-black">
              <div className="text-left">
                <ScrollAnimation delay={400}>
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-6 inline-block bg-gradient-to-r from-[#fab062] to-[#3a7373] bg-clip-text text-transparent transition-colors duration-300">
                    The AXONE Token
                  </h2>

                  <p className="text-lg md:text-xl text-[#3a7373] mb-8 leading-relaxed font-medium">
                    The Axone token ($AXN) is designed as a core value driver, tightly integrated with our ecosystem and indexes. It powers the protocol, captures platform growth, and rewards holders—making it a stake in building a simpler, more efficient, and accessible Web3.
                  </p>
                </ScrollAnimation>
              </div>
            </TextZone>

            <AnimationZone bgColor="bg-black">
              <div className="flex items-center justify-center h-full p-8">
                <div className="max-w-2xl w-full">
          <Image
                    src="/image_token-axone.webp"
                    alt="The AXONE Token"
                    width={750}
                    height={600}
                    className="w-full h-auto scale-[1.5]"
                  />
                </div>
              </div>
            </AnimationZone>
          </Section>

          {/* Section 7 - Revenue */}
          <Section reducedHeight={true}>
            <AnimationZone bgColor="bg-black">
              <div className="flex items-center justify-center h-full p-8">
                <div className="max-w-2xl w-full">
                  <ReliefImage
                    src="/image_redistribution.webp"
                    alt="Revenue"
                    width={750}
                    height={600}
                    className="w-full h-auto scale-[1.5] overflow-hidden hover:scale-[1.6] transition-transform duration-300"
                  />
                </div>
              </div>
            </AnimationZone>

            <TextZone bgColor="bg-black">
              <div className="text-left">
                <ScrollAnimation delay={600}>
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-6 inline-block bg-gradient-to-r from-[#fab062] to-[#3a7373] bg-clip-text text-transparent transition-colors duration-300">
                    Revenue
                  </h2>

                  <p className="text-lg md:text-xl text-[#3a7373] mb-8 leading-relaxed font-medium">
                    Axone creates a virtuous cycle where every new index directly fuels demand and value for the $AXN token. Through fees, buybacks, and inflation rewards, the system ties product adoption to token growth, generating sustainable revenue and long-term community benefits.
                  </p>
                </ScrollAnimation>
              </div>
            </TextZone>
          </Section>

          {/* Section 8 - Buyback and Burn */}
          <Section reducedHeight={true}>
            <TextZone bgColor="bg-black">
              <div className="text-left">
                <ScrollAnimation delay={800}>
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-6 inline-block bg-gradient-to-r from-[#fab062] to-[#3a7373] bg-clip-text text-transparent transition-colors duration-300">
                    Buyback and Burn
                  </h2>

                  <p className="text-lg md:text-xl text-[#3a7373] mb-8 leading-relaxed font-medium">
                    Axone&apos;s Buyback & Burn mechanism uses 50% of daily fees to repurchase and permanently remove $AXN tokens, creating built-in scarcity. This progressive reduction in supply strengthens index exposure, offsets inflation, and drives long-term value for the community.
                  </p>
                </ScrollAnimation>
              </div>
            </TextZone>

            <AnimationZone bgColor="bg-black">
              <div className="flex items-center justify-center h-full p-8">
                <div className="max-w-2xl w-full">
          <Image
                    src="/image_buyback-and-burn.webp"
                    alt="Buyback and Burn"
                    width={750}
                    height={600}
                    className="w-full h-auto scale-[1.1] object-cover rounded-3xl"
                    style={{ 
                      aspectRatio: '4/3',
                      objectPosition: 'center 37%'
                    }}
                  />
                </div>
              </div>
            </AnimationZone>
          </Section>

          {/* Section 9 - Growth Strategy */}
          <section className="bg-black py-16">
            <div className="max-w-7xl mx-auto px-36 md:px-48">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-12 inline-block bg-gradient-to-r from-[#fab062] to-[#3a7373] bg-clip-text text-transparent transition-colors duration-300">
                Growth Strategy
              </h2>
              
              <div className="space-y-8">
                <AnimatedListItem
                  number="0"
                  title="Foundation Phase"
                  description="Establish core infrastructure, launch initial vaults, and build a strong community foundation with early adopters."
                  delay={0}
                />

                <AnimatedListItem
                  number="1"
                  title="Expansion Phase"
                  description="Scale platform capabilities, introduce advanced features, and expand to multiple blockchain networks."
                  delay={800}
                />

                <AnimatedListItem
                  number="2"
                  title="Innovation Phase"
                  description="Pioneer AI-driven investment strategies, launch institutional products, and become the leading DeFi platform."
                  delay={1600}
                />
              </div>
              
              {/* Bouton Launch App centré */}
              <div className="flex justify-center mt-12">
                <AnimatedButton
                  href="/app"
                  delay={2400}
                  className="inline-flex items-center px-6 py-2 md:px-8 md:py-3 rounded-lg bg-[#fab062] text-[#011f26] font-semibold text-base md:text-lg shadow-2xl transition-colors hover:bg-[#e89a4a] focus:outline-none focus:ring-2 focus:ring-[#fab062] focus:ring-offset-2 focus:ring-offset-[#011f26] tracking-tight"
                >
                  Launch App
                </AnimatedButton>
              </div>
            </div>
          </section>
      
      <Footer />
    </div>
  );
}
