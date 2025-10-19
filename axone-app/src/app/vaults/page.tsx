'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Footer from '@/components/Footer';
import { Index, getRiskColor, getRiskBgColor } from '@/types/index';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('Index');
  const [indexes, setIndexes] = useState<Index[]>([]);

  const tabs = ['Index', 'Core Ignition', 'AXN Reactor', 'Hype Engine'];

  // Charger les index depuis localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedIndexes = localStorage.getItem('axone-indexes');
      if (savedIndexes) {
        try {
          setIndexes(JSON.parse(savedIndexes));
        } catch (error) {
          console.error('Error parsing saved indexes:', error);
        }
      }
    }
  }, []);

  // Fonction pour récupérer le montant déposé (simulation)
  const getDepositedAmount = () => {
    // Pour l'instant, on simule avec un montant aléatoire
    // Dans une vraie application, ceci ferait un appel à la blockchain
    return Math.random() * 1000;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Index':
        return (
          <div>
            {indexes.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {indexes.map((index) => (
                  <div key={index.id} className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 hover:border-[#fab062]/50 transition-colors h-full flex flex-col">
                    {/* En-tête de l'index */}
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-xl font-bold text-white">{index.name}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRiskBgColor(index.riskLevel)} ${getRiskColor(index.riskLevel)}`}>
                        {index.riskLevel}
                      </span>
                    </div>
                    
                    {/* Description */}
                    {index.description && (
                      <p className="text-[#5a9a9a] text-sm mb-4">{index.description}</p>
                    )}
                    
                    {/* Montant déposé */}
                    <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-semibold text-sm">Your Deposit</span>
                        <span className="text-[#fab062] font-bold">
                          ${getDepositedAmount().toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Wallet balance
                      </div>
                    </div>
                    
                    {/* Tokens et répartition */}
                    <div className="mb-4">
                      <h5 className="text-white font-semibold mb-3">Token Allocation</h5>
                      <div className="space-y-2">
                        {index.tokens.map((token, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-white text-sm">{token.symbol}</span>
                            <span className="text-[#fab062] font-semibold text-sm">{token.allocation}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Boutons de dépôt et retrait */}
                    <div className="space-y-3 mt-auto">
                      {/* Bouton de dépôt */}
                      <div className="space-y-2">
                        <label className="block text-white text-sm font-semibold">
                          Deposit Amount
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="0.00"
                            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-[#fab062] focus:outline-none min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min="0"
                            step="0.01"
                          />
                          <button className="px-3 py-2 bg-gradient-to-r from-[#fab062] to-[#5a9a9a] text-black font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm whitespace-nowrap">
                            Deposit
                          </button>
                        </div>
                      </div>
                      
                      {/* Bouton de retrait */}
                      <div className="space-y-2">
                        <label className="block text-white text-sm font-semibold">
                          Withdraw Amount
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="0.00"
                            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-[#fab062] focus:outline-none min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min="0"
                            step="0.01"
                          />
                          <button className="px-3 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors text-sm whitespace-nowrap">
                            Withdraw
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-[#5a9a9a] text-lg mb-4">No indexes available</p>
                <p className="text-gray-500 text-sm">Indexes will be created by the administrator</p>
              </div>
            )}
          </div>
        );
      case 'Core Ignition':
        return (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Core Ignition</h3>
            <p className="text-[#5a9a9a] leading-relaxed">
              Content for Core Ignition tab coming soon...
            </p>
          </div>
        );
      case 'AXN Reactor':
        return (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">AXN Reactor</h3>
            <p className="text-[#5a9a9a] leading-relaxed">
              Content for AXN Reactor tab coming soon...
            </p>
          </div>
        );
      case 'Hype Engine':
        return (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Hype Engine</h3>
            <p className="text-[#5a9a9a] leading-relaxed">
              Content for Hype Engine tab coming soon...
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header avec bouton Connect Wallet */}
      <header className="fixed top-0 left-0 right-0 z-[9999] bg-black/50 backdrop-blur-md border-b border-gray-800">
        <div className="flex items-center justify-between px-4 sm:px-8 md:px-36 lg:px-48 py-4">
          {/* Logo et nom */}
          <Link href="/" className="flex items-center gap-3 sm:gap-4">
            <Image
              src="/Logo-Axone.webp"
              alt="Axone Logo"
              width={48}
              height={48}
              className="h-8 w-auto sm:h-10 md:h-12"
              sizes="(min-width: 768px) 150px, 120px"
            />
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              Axone
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/docs"
              className="text-white font-bold text-xs sm:text-sm md:text-base hover:text-[#fab062] transition-colors tracking-tight"
            >
              Docs
            </Link>
            <Link
              href="/admin"
              className="text-white font-bold text-xs sm:text-sm md:text-base hover:text-[#fab062] transition-colors tracking-tight"
            >
              Admin
            </Link>
            
            {/* Bouton de connexion de wallet avec RainbowKit */}
            <ConnectButton 
              label="Connect Wallet"
              chainStatus="icon"
              accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
              }}
              showBalance={{
                smallScreen: false,
                largeScreen: true,
              }}
            />
          </div>
        </div>
      </header>
      
      <main className="pt-[60px] md:pt-[80px]">
        <div className="min-h-screen bg-black px-4 sm:px-8 md:px-36 lg:px-48 py-8">
          {/* Titre Dashboard avec gradient */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8">
              <span className="bg-gradient-to-r from-[#fab062] to-[#5a9a9a] bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
          </div>

          {/* Onglets */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-12">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 py-2 text-lg font-semibold transition-colors ${
                  activeTab === tab
                    ? 'text-white'
                    : 'text-[#5a9a9a] hover:text-white'
                }`}
              >
                {tab}
                {/* Barre de soulignement avec gradient pour l'onglet actif */}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#fab062] to-[#5a9a9a]"></div>
                )}
              </button>
            ))}
          </div>

          {/* Contenu des onglets */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 sm:p-8">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}