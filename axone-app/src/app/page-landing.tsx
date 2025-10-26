'use client';

import Header from '@/components/Header';
import Section, { TextZone, AnimationZone } from '@/components/Section';
import TypewriterText from '@/components/TypewriterText';
import AnimatedListItem from '@/components/AnimatedListItem';
import Footer from '@/components/Footer';
import AnimatedButton from '@/components/AnimatedButton';
import AnimatedMetric from '@/components/AnimatedMetric';
import ScrollAnimation from '@/components/ScrollAnimation';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

export default function Home() {
  const [visibleMetrics, setVisibleMetrics] = useState(0);
  const [isClient, setIsClient] = useState(false);
  
  const { ref: metricsRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && inView) {
      // Animate metrics one by one with delays
      const metrics = [0, 1, 2, 3, 4];
      metrics.forEach((index) => {
        setTimeout(() => {
          setVisibleMetrics(index + 1);
        }, index * 800); // 800ms delay between each metric (slower)
      });
    }
  }, [isClient, inView]);

  const metrics = [
    { value: '12', label: 'Vaults', description: 'Active investment vaults' },
    { value: '2,847', label: 'Users', description: 'Active platform users' },
    { value: '$4.2M', label: 'Volume Deposited', description: 'Total platform deposits' },
    { value: '$4.2M', label: 'Total Value Locked', description: 'Assets under management' },
    { value: '$1.3M', label: 'Amount Redistributed', description: 'Rewards distributed to users' }
  ];

  return (
    <div className="min-h-[100dvh] bg-white pt-[60px] md:pt-[80px]">
      <Header />
      
      {/* Section 1 - Hero */}
      <section className="min-h-[100dvh] relative flex items-center justify-center bg-black">
        {/* Animation de fond */}
        <video
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover z-0 motion-safe:opacity-100 motion-reduce:hidden"
        >
          <source src="/Animation intro.mp4" type="video/mp4" />
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
        
        {/* Contenu au premier plan */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 sm:mb-6 inline-block bg-gradient-to-r from-[#fab062] to-[#4a8c8c] bg-clip-text text-transparent transition-colors duration-300">
            A Decentralized<br />
            Investment<br />
            Solution
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-[#5a9a9a] mb-6 sm:mb-8 leading-relaxed font-medium">
            Axone offers an innovative approach to investment by leveraging blockchain technology to automate and optimize portfolio management while delivering value to its users.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link
              href="/app"
              className="inline-flex items-center justify-center px-6 py-2 sm:px-4 sm:py-1.5 md:px-6 md:py-2 rounded-lg bg-[#fab062] text-[#011f26] font-semibold text-sm md:text-base shadow-[0_6px_12px_rgba(0,0,0,0.35),0_1px_0_rgba(255,255,255,0.3)_inset,0_-1px_0_rgba(0,0,0,0.15)_inset] transition-all duration-300 hover:bg-[#e89a4a] hover:scale-105 hover:shadow-[0_8px_16px_rgba(0,0,0,0.4),0_1px_0_rgba(255,255,255,0.4)_inset,0_-1px_0_rgba(0,0,0,0.2)_inset] focus:outline-none focus:ring-2 focus:ring-[#fab062] focus:ring-offset-2 focus:ring-offset-[#011f26] tracking-tight w-auto sm:w-auto"
            >
              Get Started
            </Link>

            <Link
              href="/docs"
              className="inline-flex items-center justify-center px-6 py-2 sm:px-4 sm:py-1.5 md:px-6 md:py-2 rounded-lg border-2 border-white text-white font-semibold text-sm md:text-base shadow-[0_6px_12px_rgba(0,0,0,0.35),0_1px_0_rgba(255,255,255,0.3)_inset,0_-1px_0_rgba(0,0,0,0.15)_inset] transition-all duration-300 hover:bg-white hover:text-[#011f26] hover:scale-105 hover:shadow-[0_8px_16px_rgba(0,0,0,0.4),0_1px_0_rgba(255,255,255,0.4)_inset,0_-1px_0_rgba(0,0,0,0.2)_inset] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#011f26] tracking-tight w-auto sm:w-auto"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

          {/* Section 2 - Performance */}
          <Section reducedHeight>
            <AnimationZone bgColor="bg-black">
              <div className="flex items-center justify-center h-full p-4 sm:p-6 md:p-8" ref={metricsRef}>
                <div className="w-full max-w-none px-4 sm:px-8 md:px-12">
                  {/* Mobile: 2 par ligne sur les 2 premières lignes, 1 centrée sur la troisième */}
                  {/* Desktop: 3 sur la première ligne, 2 sur la deuxième */}
                  
                  {/* Ligne 1 - Mobile: 2 métriques, Desktop: 3 métriques */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 md:gap-16 lg:gap-24 xl:gap-28 mb-8 sm:mb-12 md:mb-16">
                    {metrics.slice(0, 3).map((metric, index) => (
                      <div 
                        key={index}
                        className={`transition-all duration-1000 ease-out ${
                          index < visibleMetrics 
                            ? 'opacity-100 translate-y-0' 
                            : 'opacity-0 translate-y-8'
                        } ${index >= 2 ? 'hidden lg:block' : ''}`}
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
                  
                  {/* Ligne 2 - Mobile: 2 métriques, Desktop: 2 métriques */}
                  <div className="grid grid-cols-2 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-24 xl:gap-28 mb-8 sm:mb-12 md:mb-16">
                    {metrics.slice(3, 5).map((metric, index) => (
                      <div 
                        key={index + 3}
                        className={`transition-all duration-1000 ease-out ${
                          (index + 3) < visibleMetrics 
                            ? 'opacity-100 translate-y-0' 
                            : 'opacity-0 translate-y-8'
                        }`}
                      >
                        <AnimatedMetric
                          value={metric.value}
                          label={metric.label}
                          description={metric.description}
                          isVisible={(index + 3) < visibleMetrics}
                          delay={0}
                          duration={1500}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Ligne 3 - Mobile: 1 métrique centrée, Desktop: cachée */}
                  <div className="grid grid-cols-1 lg:hidden gap-8 sm:gap-12 md:gap-16 lg:gap-24 xl:gap-28 justify-center max-w-none mx-auto">
                    <div 
                      className={`transition-all duration-1000 ease-out ${
                        2 < visibleMetrics 
                          ? 'opacity-100 translate-y-0' 
                          : 'opacity-0 translate-y-8'
                      }`}
                    >
                      <AnimatedMetric
                        value={metrics[2].value}
                        label={metrics[2].label}
                        description={metrics[2].description}
                        isVisible={2 < visibleMetrics}
                        delay={0}
                        duration={1500}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AnimationZone>

            <TextZone bgColor="bg-black">
              <div className="text-center">
                <TypewriterText 
                  text="Beyond vision, Axone is built on strong pillars that drive its uniqueness and long-term value"
                  speed={30}
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-6 inline-block bg-gradient-to-r from-[#fab062] to-[#5a9a9a] bg-clip-text text-transparent transition-colors duration-300"
                />
              </div>
            </TextZone>
          </Section>

          {/* Section 3 - Smart Rebalancing */}
          <Section reducedHeight>
            <TextZone bgColor="bg-black" className="order-1 md:order-none">
              <div className="text-left">
                <ScrollAnimation delay={0}>
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-6 inline-block bg-gradient-to-r from-[#fab062] to-[#5a9a9a] bg-clip-text text-transparent transition-colors duration-300">
                    Smart Rebalancing
                  </h2>

                  <p className="text-lg md:text-xl text-[#5a9a9a] mb-8 leading-relaxed font-medium max-w-md">
                    Axone delivers smart, dynamic crypto indexes that automatically rebalance every hour to secure gains and optimize allocations. It automates the strategies of top traders, ensuring your portfolio adapts effortlessly to fast-moving markets.
                  </p>
                </ScrollAnimation>
              </div>
            </TextZone>

            <AnimationZone bgColor="bg-black" className="order-2 md:order-none">
              <div className="flex items-center justify-center h-full p-8">
                <div className="overflow-hidden w-full">
                  <Image
                    src="/image_Rebalance launch.png"
                    alt="Smart Rebalancing"
                    width={750}
                    height={600}
                    sizes="(min-width: 1280px) 750px, (min-width: 768px) 70vw, 92vw"
                    className="w-full h-auto sm:scale-75 md:scale-[0.8] lg:scale-[0.85] xl:scale-90 transform -translate-y-4"
                  />
                </div>
              </div>
            </AnimationZone>
          </Section>

          {/* Section 4 - Controlled Inflation */}
          <Section reducedHeight>
            <AnimationZone bgColor="bg-black" className="order-2 md:order-none">
              <div className="flex items-center justify-center h-full p-8">
                <div className="w-full">
                  <Image
                    src="/image_Inflation launch.png"
                    alt="Controlled Inflation"
                    width={750}
                    height={600}
                    sizes="(min-width: 1280px) 750px, (min-width: 768px) 70vw, 92vw"
                    className="w-full h-auto sm:scale-[1.1] md:scale-[1.2] lg:scale-[1.3] xl:scale-[1.4] transform -translate-y-12"
                  />
                </div>
              </div>
            </AnimationZone>

            <TextZone bgColor="bg-black" className="order-1 md:order-none">
              <div className="text-left">
                <ScrollAnimation delay={100}>
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-6 inline-block bg-gradient-to-r from-[#fab062] to-[#5a9a9a] bg-clip-text text-transparent transition-colors duration-300">
                    Controlled Inflation
                  </h2>

                  <p className="text-lg md:text-xl text-[#5a9a9a] mb-8 leading-relaxed font-medium max-w-md">
                    Axone introduces a fixed 3% annual inflation fully redistributed to index holders, turning growth into direct rewards for the community. This mechanism strengthens engagement, boosts index value over time, and fuels a virtuous cycle of adoption and shared prosperity.
                  </p>
                </ScrollAnimation>
              </div>
            </TextZone>
          </Section>

          {/* Section 5 - The AXONE Token */}
          <Section reducedHeight>
            <TextZone bgColor="bg-black" className="order-1 md:order-none">
              <div className="text-left">
                <ScrollAnimation delay={200}>
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-6 inline-block bg-gradient-to-r from-[#fab062] to-[#5a9a9a] bg-clip-text text-transparent transition-colors duration-300">
                    The AXONE Token
                  </h2>

                  <p className="text-lg md:text-xl text-[#5a9a9a] mb-8 leading-relaxed font-medium">
                    The Axone token ($AXN) is designed as a core value driver, tightly integrated with our ecosystem and indexes. It powers the protocol, captures platform growth, and rewards holders—making it a stake in building a simpler, more efficient, and accessible Web3. The token serves as the backbone of our decentralized infrastructure, enabling seamless transactions and governance while providing holders with direct value accrual.
                  </p>
                </ScrollAnimation>
              </div>
            </TextZone>

            <AnimationZone bgColor="bg-black" className="order-2 md:order-none">
              <div className="flex items-center justify-center h-full p-8 pb-2">
                <div className="overflow-hidden w-full">
                  <Image
                    src="/image_axone_launch_variante.png"
                    alt="The AXONE Token"
                    width={750}
                    height={600}
                    sizes="(min-width: 1280px) 750px, (min-width: 768px) 70vw, 92vw"
                    className="w-full h-auto sm:scale-90 md:scale-95 lg:scale-100 xl:scale-105 transform translate-y-4"
                  />
                </div>
              </div>
            </AnimationZone>
          </Section>

          {/* Section 6 - Revenue */}
          <Section reducedHeight>
            <AnimationZone bgColor="bg-black" className="order-2 md:order-none">
              <div className="flex items-center justify-center h-full p-8">
                <div className="w-full">
                  <Image
                    src="/image_revenus intellingent launch.png"
                    alt="Revenue"
                    width={750}
                    height={600}
                    sizes="(min-width: 1280px) 750px, (min-width: 768px) 70vw, 92vw"
                    className="w-full h-auto sm:scale-[1.1] md:scale-[1.2] lg:scale-[1.3] xl:scale-[1.4]"
                  />
                </div>
              </div>
            </AnimationZone>

            <TextZone bgColor="bg-black" className="order-1 md:order-none">
              <div className="text-left">
                <ScrollAnimation delay={300}>
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-6 inline-block bg-gradient-to-r from-[#fab062] to-[#5a9a9a] bg-clip-text text-transparent transition-colors duration-300">
                    Revenue
                  </h2>

                  <p className="text-lg md:text-xl text-[#5a9a9a] mb-8 leading-relaxed font-medium">
                    Axone creates a virtuous cycle where every new index directly fuels demand and value for the $AXN token. Through fees, buybacks, and inflation rewards, the system ties product adoption to token growth, generating sustainable revenue and long-term community benefits. This mechanism ensures that platform success translates directly into token value appreciation for all holders.
                  </p>
                </ScrollAnimation>
              </div>
            </TextZone>
          </Section>

          {/* Section 7 - Buyback and Burn */}
          <Section reducedHeight>
            <TextZone bgColor="bg-black" className="order-1 md:order-none">
              <div className="text-left">
                <ScrollAnimation delay={400}>
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-6 inline-block bg-gradient-to-r from-[#fab062] to-[#5a9a9a] bg-clip-text text-transparent transition-colors duration-300">
                    Buyback and Burn
                  </h2>

                  <p className="text-lg md:text-xl text-[#5a9a9a] mb-8 leading-relaxed font-medium">
                    Axone&apos;s Buyback & Burn mechanism uses 50% of daily fees to repurchase and permanently remove $AXN tokens, creating built-in scarcity. This progressive reduction in supply strengthens index exposure, offsets inflation, and drives long-term value for the community. The mechanism ensures continuous token appreciation through controlled deflation, making $AXN tokens more valuable over time for all holders.
                  </p>
                </ScrollAnimation>
              </div>
            </TextZone>

            <AnimationZone bgColor="bg-black" className="order-2 md:order-none">
              <div className="flex items-start justify-center h-full p-4 pt-0">
                <div className="w-full">
                  <Image
                    src="/image_reseau_neuronal_incandescent.png"
                    alt="Buyback and Burn"
                    width={750}
                    height={600}
                    sizes="(min-width: 1280px) 750px, (min-width: 768px) 70vw, 92vw"
                    className="w-full h-auto sm:scale-[0.6] md:scale-[0.64] lg:scale-[0.68] xl:scale-[0.72] transform -translate-y-8"
                  />
                </div>
              </div>
            </AnimationZone>
          </Section>

          {/* Section 9 - Growth Strategy */}
          <section className="bg-black py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24 xl:px-36 2xl:px-48">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-12 inline-block bg-gradient-to-r from-[#fab062] to-[#5a9a9a] bg-clip-text text-transparent transition-colors duration-300">
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
