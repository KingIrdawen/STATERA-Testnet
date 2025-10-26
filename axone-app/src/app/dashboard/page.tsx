'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Footer from '@/components/Footer';
import { Index, getRiskColor, getRiskBgColor } from '@/types/index';
import AxoneLayersIcon from '../../icons/AxoneLayersIcon';
import { useStrategies } from '@/hooks/useStrategies';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('Strategy');
  const { strategies, loading } = useStrategies();
  const [activePage, setActivePage] = useState('dashboard');
  
  // États pour la recherche et le filtrage
  const [searchQuery, setSearchQuery] = useState('');
  const [apySort, setApySort] = useState<'none' | 'asc' | 'desc'>('none');
  const [volumeSort, setVolumeSort] = useState<'none' | 'asc' | 'desc'>('none');

  const tabs = ['Strategy', 'Staking', 'AXN Reactor', 'Hype Engine'];

  // Filtrer les stratégies avec dépôt > 0 (pour l'onglet Strategy)
  const strategiesWithDeposits = strategies.filter((strategy) => {
    // Pour l'instant, toutes les stratégies ont 0, donc on retourne un tableau vide
    // Plus tard, on vérifiera le montant réel depuis les smart contracts
    return false;
  });
  
  // Fonction pour filtrer et trier les stratégies
  const getFilteredStrategies = () => {
    let filtered = [...strategies];
    
    // Filtrage par recherche
    if (searchQuery) {
      filtered = filtered.filter(strategy => 
        strategy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        strategy.tokens.some(token => token.symbol.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (strategy.apy !== undefined && strategy.apy.toString().includes(searchQuery))
      );
    }
    
    // Tri par APY
    if (apySort !== 'none') {
      filtered.sort((a, b) => {
        const apyA = a.apy || 0;
        const apyB = b.apy || 0;
        return apySort === 'asc' ? apyA - apyB : apyB - apyA;
      });
    }
    
    // Tri par volume déposé (pour l'instant, on trie par nom car on n'a pas le volume réel)
    if (volumeSort !== 'none') {
      filtered.sort((a, b) => {
        // Pour l'instant, on trie par nom en attendant les vraies données
        return volumeSort === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      });
    }
    
    return filtered;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Strategy':
        return (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-[#5a9a9a] text-lg">Loading strategies...</p>
              </div>
            ) : strategiesWithDeposits.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {strategiesWithDeposits.map((index) => (
                  <div key={index.id} className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 hover:border-[#fab062]/50 transition-colors h-full flex flex-col">
                    {/* En-tête de l'index */}
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-xl font-bold bg-gradient-to-r from-[#fab062] to-[#5a9a9a] bg-clip-text text-transparent">{index.name}</h4>
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
                          $0.00
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Wallet balance
                      </div>
                    </div>
                    
                    {/* Tokens et répartition avec APY */}
                    <div className="mb-4">
                      {/* Header avec Token Allocation et APY */}
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-white font-semibold">Token Allocation</h5>
                        <h5 className="text-white font-semibold">APY: {index.apy !== undefined ? `${index.apy}%` : '-'}</h5>
                      </div>
                      
                      {/* Liste des tokens */}
                      <div className="space-y-1">
                        {index.tokens.map((token, i) => (
                          <div key={i} className="flex items-center">
                            <span className="text-white text-sm">{token.symbol}</span>
                            <span className="text-[#fab062] font-semibold text-sm ml-2">{token.allocation}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Boutons de dépôt et retrait */}
                    <div className="space-y-3 mt-auto">
                      {/* Total Value Deposited et Your deposits */}
                      <div className="mb-4">
                        <div className="mb-2 flex justify-between items-center">
                          <span className="text-white font-semibold text-sm">Total Value Deposited</span>
                          <span className="text-white font-bold">$0.00</span>
                        </div>
                        <div className="mb-2 flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Your deposits in this strategy</span>
                          <span className="text-gray-400 font-bold">$0.00</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Shares in this strategy</span>
                          <span className="text-gray-400 font-bold">0.00</span>
                        </div>
                      </div>
                      
                      {/* Bouton de dépôt */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-white text-sm font-semibold">
                            Deposit Amount
                          </label>
                          <span className="text-gray-400 text-xs">Balance: 0 USDC</span>
                        </div>
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
                <p className="text-[#5a9a9a] text-lg mb-4">No deposited strategies yet</p>
                <p className="text-gray-500 text-sm">Deposit funds in strategies to see them here</p>
              </div>
            )}
          </div>
        );
      case 'Staking':
        return (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Staking</h3>
            <p className="text-[#5a9a9a] leading-relaxed">
              Content for Staking tab coming soon...
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
              src="/Logo-Axone.png"
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
      
      <main className="pt-[60px] md:pt-[80px] flex">
        {/* Sidebar Navigation */}
        <aside className="fixed left-0 top-[60px] h-[calc(100vh-600px)] w-64 bg-black overflow-y-auto z-[9998] pb-20">
          <div className="p-6 space-y-2">
            <button
              onClick={() => setActivePage('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activePage === 'dashboard'
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {/* Icône 4 carrés en grille */}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                <rect x="2.5" y="2.5" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <rect x="11.5" y="2.5" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <rect x="2.5" y="11.5" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <rect x="11.5" y="11.5" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
              <span className="font-semibold">Dashboard</span>
            </button>
            
            <button
              onClick={() => setActivePage('strategy')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activePage === 'strategy'
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {/* Icône pile de 3 feuilles en perspective */}
              <AxoneLayersIcon size={20} className="shrink-0" />
              <span className="font-semibold">Strategies</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 ml-64 min-h-screen bg-black px-4 sm:px-8 py-8">
          {activePage === 'dashboard' && (
            <>
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
            </>
          )}

          {activePage === 'strategy' && (
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8">
                <span className="bg-gradient-to-r from-[#fab062] to-[#5a9a9a] bg-clip-text text-transparent">
                  Strategies
                </span>
              </h1>
              
              {/* Barre de recherche et filtres */}
              <div className="max-w-4xl mx-auto mb-8">
                <div className="flex items-center gap-4">
                  {/* Barre de recherche */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search strategies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-[#fab062] focus:outline-none text-sm h-10"
                    />
                    <svg
                      className="absolute left-3 top-2.5 h-4 w-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  {/* Menu déroulant de filtrage */}
                  <div className="flex items-center gap-2">
                    <select
                      value={`${apySort}-${volumeSort}`}
                      onChange={(e) => {
                        const [apy, vol] = e.target.value.split('-');
                        setApySort(apy as 'none' | 'asc' | 'desc');
                        setVolumeSort(vol as 'none' | 'asc' | 'desc');
                      }}
                      className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-[#fab062] focus:outline-none h-10"
                    >
                      <option value="none-none">Sort by...</option>
                      <option value="asc-none">APY: Low to High</option>
                      <option value="desc-none">APY: High to Low</option>
                      <option value="none-asc">Volume: Low to High</option>
                      <option value="none-desc">Volume: High to Low</option>
                      <option value="asc-asc">APY ↑ & Volume ↑</option>
                      <option value="asc-desc">APY ↑ & Volume ↓</option>
                      <option value="desc-asc">APY ↓ & Volume ↑</option>
                      <option value="desc-desc">APY ↓ & Volume ↓</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-[#5a9a9a] text-lg">Loading strategies...</p>
                </div>
              ) : getFilteredStrategies().length > 0 ? (
                <div className="max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {getFilteredStrategies().map((strategy) => (
                      <div key={strategy.id} className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 hover:border-[#fab062]/50 transition-colors h-full flex flex-col">
                        {/* En-tête de la stratégie */}
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-xl font-bold bg-gradient-to-r from-[#fab062] to-[#5a9a9a] bg-clip-text text-transparent">{strategy.name}</h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRiskBgColor(strategy.riskLevel)} ${getRiskColor(strategy.riskLevel)}`}>
                            {strategy.riskLevel}
                          </span>
                        </div>
                        
                        {/* Description */}
                        {strategy.description && (
                          <p className="text-[#5a9a9a] text-sm mb-4">{strategy.description}</p>
                        )}
                        
                        {/* Tokens et répartition avec APY */}
                        <div className="mb-4">
                          {/* Header avec Token Allocation et APY */}
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-white font-semibold">Token Allocation</h5>
                            <h5 className="text-white font-semibold">APY: {strategy.apy !== undefined ? `${strategy.apy}%` : '-'}</h5>
                          </div>
                          
                          {/* Liste des tokens */}
                          <div className="space-y-1">
                            {strategy.tokens.map((token, i) => (
                              <div key={i} className="flex items-center">
                                <span className="text-white text-sm">{token.symbol}</span>
                                <span className="text-[#fab062] font-semibold text-sm ml-2">{token.allocation}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Bouton de dépôt */}
                        <div className="mt-auto">
                          {/* Total Value Deposited et Your deposits */}
                          <div className="mb-4">
                            <div className="mb-2 flex justify-between items-center">
                              <span className="text-white font-semibold text-sm">Total Value Deposited</span>
                              <span className="text-white font-bold">$0.00</span>
                            </div>
                            <div className="mb-2 flex justify-between items-center">
                              <span className="text-gray-400 text-sm">Your deposits in this strategy</span>
                              <span className="text-gray-400 font-bold">$0.00</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400 text-sm">Shares in this strategy</span>
                              <span className="text-gray-400 font-bold">0.00</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-white text-sm font-semibold">
                              Deposit Amount
                            </label>
                            <span className="text-gray-400 text-xs">Balance: 0 USDC</span>
                          </div>
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
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-[#5a9a9a] text-lg mb-4">No strategies available</p>
                  <p className="text-gray-500 text-sm">Strategies will be created by the administrator</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}