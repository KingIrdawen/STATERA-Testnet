'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import Footer from '@/components/Footer';
import type { Strategy } from '@/types/strategy';
import StateraLayersIcon from '../../icons/StateraLayersIcon';
import { useStrategies } from '@/hooks/useStrategies';
import { useStrategyData } from '@/hooks/useStrategyDataEra';
import { StrategyCardEra } from '@/components/StrategyCardEra';
import { formatUsd } from '@/lib/format';
import { usePoints } from '@/hooks/usePoints';
import { useRanking } from '@/hooks/useRanking';

// Composant pour l'onglet Points
function PointsTabContent() {
  const { points, isLoading, error, address } = usePoints()
  const { userRanking } = useRanking()

  if (!address) {
    return (
      <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 sm:p-8">
        <div className="text-center">
          <p className="text-[#5a9a9a] text-lg mb-4">Please connect your wallet to view your points</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-8 inline-block min-w-[300px]">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-6">Your Points</h3>
        {isLoading ? (
          <p className="text-[#5a9a9a] text-lg">Loading...</p>
        ) : error ? (
          <p className="text-red-400 text-lg">Error loading points</p>
        ) : (
          <div className="space-y-6">
            <div className="inline-block px-8 py-4 bg-gradient-to-r from-[#fab062] to-[#5a9a9a] rounded-lg">
              <p className="text-4xl font-bold text-black">{parseFloat(points).toLocaleString('fr-FR', { useGrouping: true })}</p>
            </div>
            {userRanking && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Ranking Position</p>
                <p className="text-2xl font-bold text-white">#{userRanking.rank}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Composant pour l'onglet Ranking
function RankingTabContent() {
  const { ranking, userRanking, searchQuery, setSearchQuery, isLoading, lastUpdate } = useRanking()
  const { address } = useAccount()

  return (
    <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 sm:p-8">
      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by address or rank..."
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
        {lastUpdate && (
          <p className="text-gray-500 text-xs mt-2">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Ligne de l'utilisateur connecté si présent */}
      {userRanking && address && (
        <div className="mb-6 p-4 bg-gradient-to-r from-[#fab062]/20 to-[#5a9a9a]/20 border border-[#fab062]/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-[#fab062]">#{userRanking.rank}</span>
              <div>
                <p className="text-white font-semibold">
                  {userRanking.address.slice(0, 6)}...{userRanking.address.slice(-4)}
                </p>
                <p className="text-gray-400 text-xs">Your ranking</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-white">{parseFloat(userRanking.points).toLocaleString('fr-FR', { useGrouping: true })}</span>
          </div>
        </div>
      )}

      {/* Classement complet */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-[#5a9a9a] text-lg">Loading ranking...</p>
          </div>
        ) : ranking.length > 0 ? (
          <>
            {/* En-tête du tableau */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-gray-700">
              <div className="col-span-1 text-gray-400 text-sm font-semibold">#</div>
              <div className="col-span-8 text-gray-400 text-sm font-semibold">Address</div>
              <div className="col-span-3 text-right text-gray-400 text-sm font-semibold">Points</div>
            </div>
            {/* Lignes du classement */}
            {ranking.map((entry, index) => {
              const isUser = address && entry.address.toLowerCase() === address.toLowerCase()
              return (
                <div
                  key={entry.address}
                  className={`grid grid-cols-12 gap-4 px-4 py-3 rounded-lg transition-colors ${
                    isUser
                      ? 'bg-[#fab062]/10 border border-[#fab062]/30'
                      : 'hover:bg-gray-800/50'
                  }`}
                >
                  <div className={`col-span-1 text-sm font-bold ${isUser ? 'text-[#fab062]' : 'text-gray-300'}`}>
                    {entry.rank}
                  </div>
                  <div className={`col-span-8 text-sm ${isUser ? 'text-white font-semibold' : 'text-gray-300'}`}>
                    {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                    {isUser && <span className="ml-2 text-[#fab062] text-xs">(You)</span>}
                  </div>
                  <div className={`col-span-3 text-right text-sm font-bold ${isUser ? 'text-[#fab062]' : 'text-white'}`}>
                    {parseFloat(entry.points).toLocaleString('fr-FR', { useGrouping: true })}
                  </div>
                </div>
              )
            })}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#5a9a9a] text-lg mb-4">No ranking data available</p>
            <p className="text-gray-500 text-sm">The ranking will be displayed here once the contract is configured</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Composant wrapper pour une stratégie avec vérification de dépôt
function StrategyWithDepositCheck({ strategy }: { strategy: Strategy }) {
  const data = useStrategyData(strategy);
  const hasDeposit = (data.userShares ?? 0) > 0 || (data.userValueUsd ?? 0) > 0;

  if (!hasDeposit) {
    return null;
  }

  return <StrategyCardEra strategy={strategy} showWithdraw={true} />;
}

// Composant pour filtrer les stratégies avec dépôts (pour l'onglet "Strategy")
function StrategiesWithDeposits({ strategies, loading }: { strategies: Strategy[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-[#5a9a9a] text-lg">Loading strategies...</p>
      </div>
    );
  }

  if (strategies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#5a9a9a] text-lg mb-4">No deposited strategies yet</p>
        <p className="text-gray-500 text-sm">Deposit funds in strategies to see them here</p>
      </div>
    );
  }

  // Filtrer les stratégies invalides
  const validStrategies = strategies.filter(strategy => 
    strategy && 
    strategy.contracts && 
    strategy.contracts.vaultAddress &&
    strategy.contracts.handlerAddress &&
    strategy.contracts.coreViewsAddress
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {validStrategies.map(strategy => (
        <StrategyWithDepositCheck key={strategy.id} strategy={strategy} />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('Strategy');
  const [activePointsTab, setActivePointsTab] = useState('Points');
  const { strategies, loading } = useStrategies();
  const [activePage, setActivePage] = useState('dashboard');
  
  // Vérification du réseau au niveau de la page
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const EXPECTED_CHAIN_ID = 998;
  const isCorrectChain = chainId === EXPECTED_CHAIN_ID;
  
  // États pour la recherche et le filtrage
  const [searchQuery, setSearchQuery] = useState('');
  const [apySort, setApySort] = useState<'none' | 'asc' | 'desc'>('none');
  const [volumeSort, setVolumeSort] = useState<'none' | 'asc' | 'desc'>('none');

  const tabs = ['Strategy', 'Staking', 'AXN Reactor', 'Hype Engine'];

  // Fonction pour filtrer et trier les stratégies (pour l'onglet "Stratégies" - toutes les stratégies)
  const getFilteredStrategies = () => {
    // Filtrer d'abord les stratégies invalides
    let filtered = strategies.filter(strategy => 
      strategy && 
      strategy.contracts && 
      strategy.contracts.vaultAddress &&
      strategy.contracts.handlerAddress &&
      strategy.contracts.coreViewsAddress
    );
    
    // Filtrage par recherche
    if (searchQuery) {
      filtered = filtered.filter(strategy => 
        strategy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (strategy.description && strategy.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Tri par volume (TVL) - on utilisera les données on-chain plus tard
    if (volumeSort !== 'none') {
      filtered.sort((a, b) => {
        return volumeSort === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      });
    }
    
    return filtered;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Strategy':
        return <StrategiesWithDeposits strategies={strategies} loading={loading} />;
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
      <header className="fixed left-0 right-0 top-0 z-[9999] bg-black/50 backdrop-blur-md border-b border-gray-800">
        {/* Bandeau Wrong Network intégré dans le header */}
        {address && !isCorrectChain && (
          <div className="bg-red-600 text-white text-center py-3 px-4 text-sm font-semibold shadow-lg border-b-2 border-red-700">
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              <span className="flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <span>Wrong Network - Please switch to HyperEVM Testnet (Chain ID: 998)</span>
              </span>
              <button
                onClick={() => switchChain({ chainId: EXPECTED_CHAIN_ID })}
                className="px-4 py-1.5 bg-white text-red-600 font-semibold rounded text-xs hover:bg-gray-100 transition-colors whitespace-nowrap shadow-md"
              >
                Switch Network
              </button>
            </div>
          </div>
        )}
        <div className={`flex items-center justify-between px-4 sm:px-8 md:px-36 lg:px-48 py-4 ${address && !isCorrectChain ? '' : ''}`}>
          {/* Logo et nom */}
          <Link href="/" className="flex items-center gap-3 sm:gap-4">
            <Image
              src="/Logo-Axone.png"
              alt="Statera Logo"
              width={48}
              height={48}
              className="h-8 w-auto sm:h-10 md:h-12"
              sizes="(min-width: 768px) 150px, 120px"
            />
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              Statera
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
                largeScreen: false, // Désactiver pour éviter les erreurs getBalance
              }}
            />
          </div>
        </div>
      </header>
      
      <main className={`flex ${address && !isCorrectChain ? 'pt-[104px] md:pt-[124px]' : 'pt-[60px] md:pt-[80px]'}`}>
        {/* Sidebar Navigation */}
        <aside className={`fixed left-0 w-64 bg-black overflow-y-auto z-[9998] pb-20 ${address && !isCorrectChain ? 'top-[104px] h-[calc(100vh-104px)]' : 'top-[60px] h-[calc(100vh-60px)]'}`}>
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
              <StateraLayersIcon size={20} className="shrink-0" />
              <span className="font-semibold">Strategies</span>
            </button>
            
            <button
              onClick={() => setActivePage('referral')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activePage === 'referral'
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {/* Icône referral - bonhomme avec le haut du corps */}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {/* Tête */}
                <circle cx="10" cy="6" r="3" />
                {/* Haut du corps */}
                <path d="M6 12C6 10.3431 7.79086 9 10 9C12.2091 9 14 10.3431 14 12V16H6V12Z" />
              </svg>
              <span className="font-semibold">Referral</span>
            </button>
            
            <button
              onClick={() => setActivePage('points')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activePage === 'points'
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {/* Icône points - étoile ou badge */}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 3L12.163 7.60714L17 8.34286L13.5 11.7857L14.326 16.5L10 14.3571L5.674 16.5L6.5 11.7857L3 8.34286L7.837 7.60714L10 3Z" />
              </svg>
              <span className="font-semibold">Points</span>
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
                      <StrategyCardEra key={strategy.id} strategy={strategy} />
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

          {activePage === 'referral' && (
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8">
                <span className="bg-gradient-to-r from-[#fab062] to-[#5a9a9a] bg-clip-text text-transparent">
                  Referral
                </span>
              </h1>
              <p className="text-[#5a9a9a] text-lg leading-relaxed">
                Content for Referral page coming soon...
              </p>
            </div>
          )}

          {activePage === 'points' && (
            <>
              {/* Titre Points avec gradient */}
              <div className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8">
                  <span className="bg-gradient-to-r from-[#fab062] to-[#5a9a9a] bg-clip-text text-transparent">
                    Points
                  </span>
                </h1>
              </div>

              {/* Onglets Points */}
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-12">
                <button
                  onClick={() => setActivePointsTab('Points')}
                  className={`relative px-4 py-2 text-lg font-semibold transition-colors ${
                    activePointsTab === 'Points'
                      ? 'text-white'
                      : 'text-[#5a9a9a] hover:text-white'
                  }`}
                >
                  Points
                  {/* Barre de soulignement avec gradient pour l'onglet actif */}
                  {activePointsTab === 'Points' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#fab062] to-[#5a9a9a]"></div>
                  )}
                </button>
                <button
                  onClick={() => setActivePointsTab('Ranking')}
                  className={`relative px-4 py-2 text-lg font-semibold transition-colors ${
                    activePointsTab === 'Ranking'
                      ? 'text-white'
                      : 'text-[#5a9a9a] hover:text-white'
                  }`}
                >
                  Ranking
                  {/* Barre de soulignement avec gradient pour l'onglet actif */}
                  {activePointsTab === 'Ranking' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#fab062] to-[#5a9a9a]"></div>
                  )}
                </button>
              </div>

              {/* Contenu des onglets Points */}
              <div className="max-w-4xl mx-auto">
                {activePointsTab === 'Points' && (
                  <div className="flex justify-center">
                    <PointsTabContent />
                  </div>
                )}
                {activePointsTab === 'Ranking' && (
                  <RankingTabContent />
                )}
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}