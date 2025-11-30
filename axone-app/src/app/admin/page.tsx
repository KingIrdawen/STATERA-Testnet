'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Footer from '@/components/Footer';
import type { Strategy, StrategyInput } from '@/types/strategy';
import { useStrategies } from '@/hooks/useStrategies';

export default function AdminPage() {
  const { strategies, loading, createStrategy, updateStrategy, deleteStrategy } = useStrategies();
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  const [formData, setFormData] = useState<StrategyInput>({
    name: '',
    description: '',
    riskLevel: 'low',
    status: 'open',
    contracts: {
      chainId: 998,
      vaultAddress: '0x' as `0x${string}`,
      handlerAddress: '0x' as `0x${string}`,
      coreViewsAddress: '0x' as `0x${string}`,
      l1ReadAddress: '0x' as `0x${string}`,
      coreWriterAddress: '0x3333333333333333333333333333333333333333' as `0x${string}`,
      usdcAddress: undefined,
      shareDecimals: 18,
      hypeDecimals: 18,
      usdcDecimals: 6,
      depositIsNative: true,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate addresses
    if (!formData.contracts.vaultAddress.startsWith('0x') || formData.contracts.vaultAddress.length !== 42) {
      alert('Adresse Vault invalide');
      return;
    }
    if (!formData.contracts.handlerAddress.startsWith('0x') || formData.contracts.handlerAddress.length !== 42) {
      alert('Adresse Handler invalide');
      return;
    }
    if (!formData.contracts.coreViewsAddress.startsWith('0x') || formData.contracts.coreViewsAddress.length !== 42) {
      alert('Adresse CoreViews invalide');
      return;
    }
    if (!formData.contracts.l1ReadAddress.startsWith('0x') || formData.contracts.l1ReadAddress.length !== 42) {
      alert('Adresse L1Read invalide');
      return;
    }

    const newStrategy: Strategy = {
      id: editingStrategy?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      riskLevel: formData.riskLevel,
      status: formData.status,
      contracts: {
        ...formData.contracts,
        vaultAddress: formData.contracts.vaultAddress as `0x${string}`,
        handlerAddress: formData.contracts.handlerAddress as `0x${string}`,
        coreViewsAddress: formData.contracts.coreViewsAddress as `0x${string}`,
        l1ReadAddress: formData.contracts.l1ReadAddress as `0x${string}`,
        coreWriterAddress: formData.contracts.coreWriterAddress as `0x${string}`,
        usdcAddress: formData.contracts.usdcAddress as `0x${string}` | undefined,
      },
    };

    try {
      if (editingStrategy) {
        await updateStrategy(newStrategy);
      } else {
        await createStrategy(newStrategy);
      }

      // Réinitialiser le formulaire
      setFormData({
        name: '',
        description: '',
        riskLevel: 'low',
        status: 'open',
        contracts: {
          chainId: 998,
          vaultAddress: '0x' as `0x${string}`,
          handlerAddress: '0x' as `0x${string}`,
          coreViewsAddress: '0x' as `0x${string}`,
          l1ReadAddress: '0x' as `0x${string}`,
          coreWriterAddress: '0x3333333333333333333333333333333333333333' as `0x${string}`,
          usdcAddress: undefined,
          shareDecimals: 18,
          hypeDecimals: 18,
          usdcDecimals: 6,
          depositIsNative: true,
        },
      });
      setEditingStrategy(null);
    } catch (error) {
      console.error('Error saving strategy:', error);
      alert('Erreur lors de la sauvegarde de la stratégie');
    }
  };

  const handleEdit = (strategy: Strategy) => {
    setEditingStrategy(strategy);
    setFormData({
      name: strategy.name,
      description: strategy.description || '',
      riskLevel: strategy.riskLevel,
      status: strategy.status || 'open',
      contracts: strategy.contracts,
    });
  };

  const handleDelete = async (strategyId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette stratégie ?')) {
      try {
        await deleteStrategy(strategyId);
      } catch (error) {
        console.error('Error deleting strategy:', error);
        alert('Erreur lors de la suppression de la stratégie');
      }
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="fixed top-0 left-0 right-0 z-[9999] bg-black/50 backdrop-blur-md border-b border-gray-800">
        <div className="flex items-center justify-between px-4 sm:px-8 md:px-36 lg:px-48 py-4">
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

          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/docs"
              className="text-white font-bold text-xs sm:text-sm md:text-base hover:text-[#fab062] transition-colors tracking-tight"
            >
              Docs
            </Link>
            <Link
              href="/dashboard"
              className="text-white font-bold text-xs sm:text-sm md:text-base hover:text-[#fab062] transition-colors tracking-tight"
            >
              Dashboard
            </Link>
            <ConnectButton 
              label="Connect Wallet"
              chainStatus="icon"
              accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
              }}
              showBalance={{
                smallScreen: false,
                largeScreen: false,
              }}
            />
          </div>
        </div>
      </header>
      
      <main className="pt-[60px] md:pt-[80px]">
        <div className="min-h-screen bg-black px-4 sm:px-8 md:px-36 lg:px-48 py-8">
          {/* Titre Admin */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8">
              <span className="bg-gradient-to-r from-[#fab062] to-[#5a9a9a] bg-clip-text text-transparent">
                Admin
              </span>
            </h1>
            <p className="text-lg text-[#5a9a9a] mb-8">
              Gérer les stratégies ERA
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Les token IDs et spot IDs sont gérés automatiquement par le handler on-chain
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulaire */}
            <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingStrategy ? 'Modifier la stratégie' : 'Créer une nouvelle stratégie'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nom de la stratégie */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Nom de la stratégie *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#fab062] focus:outline-none"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#fab062] focus:outline-none h-20"
                  />
                </div>

                {/* Niveau de risque */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Niveau de risque *
                  </label>
                  <select
                    value={formData.riskLevel}
                    onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#fab062] focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Statut
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'open' | 'paused' | 'closed' })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#fab062] focus:outline-none"
                  >
                    <option value="open">Open</option>
                    <option value="paused">Paused</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* Note sur la composition */}
                <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <p className="text-gray-400 text-xs">
                    <strong>Note:</strong> La composition des tokens (symboles, allocations) est déterminée automatiquement on-chain par le handler. 
                    Vous pouvez décrire la composition dans le champ "Description" (ex: "BTC/HYPE 50/50, delta-neutral, ERA index").
                  </p>
                </div>

                {/* Contrats */}
                <div className="space-y-4">
                  <h3 className="text-white font-semibold text-lg">Contrats ERA *</h3>
                  
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Chain ID
                    </label>
                    <input
                      type="number"
                      value={formData.contracts.chainId}
                      onChange={(e) => setFormData({
                        ...formData,
                        contracts: { ...formData.contracts, chainId: parseInt(e.target.value) || 998 }
                      })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#fab062] focus:outline-none"
                    />
                    <p className="text-gray-400 text-xs mt-1">998 pour HyperEVM Testnet</p>
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Adresse Vault *
                    </label>
                    <input
                      type="text"
                      value={formData.contracts.vaultAddress}
                      onChange={(e) => setFormData({
                        ...formData,
                        contracts: { ...formData.contracts, vaultAddress: e.target.value as `0x${string}` }
                      })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#fab062] focus:outline-none"
                      placeholder="0x..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Adresse Handler (CoreInteractionHandler) *
                    </label>
                    <input
                      type="text"
                      value={formData.contracts.handlerAddress}
                      onChange={(e) => setFormData({
                        ...formData,
                        contracts: { ...formData.contracts, handlerAddress: e.target.value as `0x${string}` }
                      })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#fab062] focus:outline-none"
                      placeholder="0x..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Adresse CoreViews (CoreInteractionViews) *
                    </label>
                    <input
                      type="text"
                      value={formData.contracts.coreViewsAddress}
                      onChange={(e) => setFormData({
                        ...formData,
                        contracts: { ...formData.contracts, coreViewsAddress: e.target.value as `0x${string}` }
                      })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#fab062] focus:outline-none"
                      placeholder="0x..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Adresse L1Read *
                    </label>
                    <input
                      type="text"
                      value={formData.contracts.l1ReadAddress}
                      onChange={(e) => setFormData({
                        ...formData,
                        contracts: { ...formData.contracts, l1ReadAddress: e.target.value as `0x${string}` }
                      })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#fab062] focus:outline-none"
                      placeholder="0x..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Adresse CoreWriter
                    </label>
                    <input
                      type="text"
                      value={formData.contracts.coreWriterAddress}
                      onChange={(e) => setFormData({
                        ...formData,
                        contracts: { ...formData.contracts, coreWriterAddress: e.target.value as `0x${string}` }
                      })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#fab062] focus:outline-none"
                      placeholder="0x3333333333333333333333333333333333333333"
                    />
                    <p className="text-gray-400 text-xs mt-1">
                      Adresse système CoreWriter (par défaut: 0x3333...3333)
                    </p>
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Adresse USDC (optionnel)
                    </label>
                    <input
                      type="text"
                      value={formData.contracts.usdcAddress || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        contracts: { 
                          ...formData.contracts, 
                          usdcAddress: e.target.value ? (e.target.value as `0x${string}`) : undefined 
                        }
                      })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#fab062] focus:outline-none"
                      placeholder="0x... (optionnel)"
                    />
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-[#fab062] text-black font-semibold rounded-lg hover:bg-[#e89a4a] transition-colors"
                  >
                    {editingStrategy ? 'Modifier' : 'Créer'}
                  </button>
                  {editingStrategy && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingStrategy(null);
                        setFormData({
                          name: '',
                          description: '',
                          riskLevel: 'low',
                          status: 'open',
                          contracts: {
                            chainId: 998,
                            vaultAddress: '0x' as `0x${string}`,
                            handlerAddress: '0x' as `0x${string}`,
                            coreViewsAddress: '0x' as `0x${string}`,
                            l1ReadAddress: '0x' as `0x${string}`,
                            coreWriterAddress: '0x3333333333333333333333333333333333333333' as `0x${string}`,
                            usdcAddress: undefined,
                            shareDecimals: 18,
                            hypeDecimals: 18,
                            usdcDecimals: 6,
                            depositIsNative: true,
                          },
                        });
                      }}
                      className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Liste des stratégies existantes */}
            <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                Strategies existantes ({strategies.length})
              </h2>
              
              {loading ? (
                <p className="text-[#5a9a9a] text-center py-8">Chargement...</p>
              ) : (
                <div className="space-y-4">
                  {strategies.map((strategy) => (
                    <div key={strategy.id} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-white">{strategy.name}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(strategy)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(strategy.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-[#5a9a9a] text-sm mb-3">{strategy.description}</p>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-sm text-gray-400">Risque:</span>
                        <span className={`text-sm font-semibold ${
                          strategy.riskLevel === 'low' ? 'text-green-400' :
                          strategy.riskLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {strategy.riskLevel}
                        </span>
                        {strategy.status && (
                          <>
                            <span className="text-sm text-gray-400">Statut:</span>
                            <span className="text-sm font-semibold text-white">
                              {strategy.status}
                            </span>
                          </>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-400 mb-2">
                        <div>Vault: {strategy.contracts.vaultAddress.slice(0, 10)}...{strategy.contracts.vaultAddress.slice(-8)}</div>
                        <div>Handler: {strategy.contracts.handlerAddress.slice(0, 10)}...{strategy.contracts.handlerAddress.slice(-8)}</div>
                        <div>CoreViews: {strategy.contracts.coreViewsAddress.slice(0, 10)}...{strategy.contracts.coreViewsAddress.slice(-8)}</div>
                      </div>
                    </div>
                  ))}
                  {strategies.length === 0 && (
                    <p className="text-[#5a9a9a] text-center py-8">Aucune stratégie créée</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
