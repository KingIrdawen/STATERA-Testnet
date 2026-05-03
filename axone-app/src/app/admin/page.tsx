'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Footer from '@/components/Footer';
import type { Strategy, StrategyInput } from '@/types/strategy';
import { useStrategies } from '@/hooks/useStrategies';

const BLANK_V1: StrategyInput = {
  name: '',
  description: '',
  riskLevel: 'low',
  status: 'open',
  contracts: {
    chainId: 998,
    vaultVersion: 'v1',
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
};

const BLANK_V3: StrategyInput = {
  name: '',
  description: '',
  riskLevel: 'medium',
  status: 'open',
  contracts: {
    chainId: 998,
    vaultVersion: 'v3',
    vaultAddress: '0x' as `0x${string}`,
    shareDecimals: 18,
    hypeDecimals: 18,
    usdcDecimals: 6,
    depositIsNative: true,
  },
};

// Nouveaux vaults v3 déployés (2026-04-30)
const V3_PRESETS = [
  {
    name: 'HYPE / SOVY (équilibré)',
    description: '48% HYPE / 48% SOVY / 4% USDC — vault actif (stHSOVY3)',
    riskLevel: 'medium' as const,
    status: 'open' as const,
    vaultAddress: '0xb9E15DC17a8133f0cdB778097D0169c2Ba284a77',
  },
  {
    name: 'HYPE / UETH (résilience)',
    description: '48% HYPE / 48% UETH / 4% USDC — vault UETH3',
    riskLevel: 'medium' as const,
    status: 'open' as const,
    vaultAddress: '0x3e93bde3Aa75761AdB010088230f4d7C8F659a22',
  },
  {
    name: 'HYPE / UNIT (asymétrique)',
    description: '30% HYPE / 70% UNIT / 0% USDC — vault stHUNIT3',
    riskLevel: 'high' as const,
    status: 'open' as const,
    vaultAddress: '0xcdcdc574d4f13f510ec2d12bcfd23003cb330f9a',
  },
];

export default function AdminPage() {
  const { strategies, loading, createStrategy, updateStrategy, deleteStrategy } = useStrategies();
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  const [formData, setFormData] = useState<StrategyInput>(BLANK_V1);

  const isV3Form = formData.contracts.vaultVersion === 'v3';

  const validateAddress = (addr: string | undefined) =>
    addr && addr.startsWith('0x') && addr.length === 42;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAddress(formData.contracts.vaultAddress)) {
      alert('Adresse Vault invalide');
      return;
    }

    const isV3 = formData.contracts.vaultVersion === 'v3';

    if (!isV3) {
      if (!validateAddress(formData.contracts.handlerAddress)) {
        alert('Adresse Handler invalide');
        return;
      }
      if (!validateAddress(formData.contracts.coreViewsAddress)) {
        alert('Adresse CoreViews invalide');
        return;
      }
      if (!validateAddress(formData.contracts.l1ReadAddress)) {
        alert('Adresse L1Read invalide');
        return;
      }
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
        handlerAddress: formData.contracts.handlerAddress as `0x${string}` | undefined,
        coreViewsAddress: formData.contracts.coreViewsAddress as `0x${string}` | undefined,
        l1ReadAddress: formData.contracts.l1ReadAddress as `0x${string}` | undefined,
        coreWriterAddress: formData.contracts.coreWriterAddress as `0x${string}` | undefined,
        usdcAddress: formData.contracts.usdcAddress as `0x${string}` | undefined,
      },
    };

    try {
      if (editingStrategy) {
        await updateStrategy(newStrategy);
      } else {
        await createStrategy(newStrategy);
      }
      setFormData(isV3 ? BLANK_V3 : BLANK_V1);
      setEditingStrategy(null);
    } catch (error) {
      console.error('Error saving strategy:', error);
      alert('Erreur lors de la sauvegarde de la stratégie');
    }
  };

  const loadPreset = (preset: typeof V3_PRESETS[number]) => {
    setFormData({
      ...BLANK_V3,
      name: preset.name,
      description: preset.description,
      riskLevel: preset.riskLevel,
      status: preset.status,
      contracts: {
        ...BLANK_V3.contracts,
        vaultAddress: preset.vaultAddress as `0x${string}`,
      },
    });
    setEditingStrategy(null);
  };

  const handleEdit = (strategy: Strategy) => {
    setEditingStrategy(strategy);
    setFormData({
      name: strategy.name,
      description: strategy.description || '',
      riskLevel: strategy.riskLevel,
      status: strategy.status || 'open',
      contracts: {
        ...strategy.contracts,
        vaultVersion: strategy.contracts.vaultVersion ?? 'v1',
      },
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
    <div className="min-h-screen bg-[#121212]">
      <header className="fixed top-0 left-0 right-0 z-[9999] bg-[#121212]/50 backdrop-blur-md border-b border-gray-800">
        <div className="flex items-center justify-between px-4 sm:px-8 md:px-36 lg:px-48 py-4">
          <Link href="/" className="flex items-center gap-3 sm:gap-4">
            <Image
              src="/Logo-Statera-sandy-brown-détouré.png"
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
              href="/dashboard/strategy"
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
        <div className="min-h-screen bg-[#121212] px-4 sm:px-8 md:px-36 lg:px-48 py-8">
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

          {/* Presets v3 */}
          <div className="mb-8 p-5 bg-[#001a1f] border border-[#fab062]/30 rounded-lg">
            <h3 className="text-white font-semibold mb-3">
              Vaults v3 déployés (2026-04-30) — Chargement rapide
            </h3>
            <p className="text-gray-400 text-xs mb-4">
              Cliquez pour pré-remplir le formulaire avec les adresses des nouveaux RebalancingVaults.
            </p>
            <div className="flex flex-wrap gap-3">
              {V3_PRESETS.map((p) => (
                <button
                  key={p.vaultAddress}
                  onClick={() => loadPreset(p)}
                  className="px-4 py-2 bg-[#fab062]/20 border border-[#fab062]/40 text-[#fab062] rounded-lg text-sm hover:bg-[#fab062]/30 transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulaire */}
            <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingStrategy ? 'Modifier la stratégie' : 'Créer une nouvelle stratégie'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Version du vault */}
                <div>
                  <label className="block text-white font-semibold mb-2">Version du vault *</label>
                  <div className="flex gap-3">
                    {(['v1', 'v3'] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          const blank = v === 'v3' ? BLANK_V3 : BLANK_V1;
                          setFormData({ ...blank, name: formData.name, description: formData.description });
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                          formData.contracts.vaultVersion === v
                            ? 'bg-[#fab062] text-black border-[#fab062]'
                            : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-[#fab062]/50'
                        }`}
                      >
                        {v === 'v1' ? 'v1 — ERA' : 'v3 — RebalancingVault'}
                      </button>
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    {isV3Form
                      ? 'v3 : vault auto-suffisant, pas de handler/views/l1Read requis.'
                      : 'v1 : architecture ERA avec handler, CoreViews et L1Read séparés.'}
                  </p>
                </div>

                {/* Nom de la stratégie */}
                <div>
                  <label className="block text-white font-semibold mb-2">Nom *</label>
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
                  <label className="block text-white font-semibold mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#fab062] focus:outline-none h-20"
                  />
                </div>

                {/* Niveau de risque */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">Risque *</label>
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
                  <div>
                    <label className="block text-white font-semibold mb-2">Statut</label>
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
                </div>

                {/* Contrats */}
                <div className="space-y-4">
                  <h3 className="text-white font-semibold text-lg border-t border-gray-700 pt-4">
                    Contrats {isV3Form ? 'RebalancingVault v3' : 'ERA v1'}
                  </h3>

                  <div>
                    <label className="block text-white font-semibold mb-2">Adresse Vault *</label>
                    <input
                      type="text"
                      value={formData.contracts.vaultAddress}
                      onChange={(e) => setFormData({
                        ...formData,
                        contracts: { ...formData.contracts, vaultAddress: e.target.value as `0x${string}` }
                      })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#fab062] focus:outline-none font-mono text-sm"
                      placeholder="0x..."
                      required
                    />
                  </div>

                  {/* Champs v1 seulement */}
                  {!isV3Form && (
                    <>
                      <div>
                        <label className="block text-white font-semibold mb-2">Handler (CoreInteractionHandler) *</label>
                        <input
                          type="text"
                          value={formData.contracts.handlerAddress || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            contracts: { ...formData.contracts, handlerAddress: e.target.value as `0x${string}` }
                          })}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#fab062] focus:outline-none font-mono text-sm"
                          placeholder="0x..."
                        />
                      </div>
                      <div>
                        <label className="block text-white font-semibold mb-2">CoreViews *</label>
                        <input
                          type="text"
                          value={formData.contracts.coreViewsAddress || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            contracts: { ...formData.contracts, coreViewsAddress: e.target.value as `0x${string}` }
                          })}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#fab062] focus:outline-none font-mono text-sm"
                          placeholder="0x..."
                        />
                      </div>
                      <div>
                        <label className="block text-white font-semibold mb-2">L1Read *</label>
                        <input
                          type="text"
                          value={formData.contracts.l1ReadAddress || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            contracts: { ...formData.contracts, l1ReadAddress: e.target.value as `0x${string}` }
                          })}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#fab062] focus:outline-none font-mono text-sm"
                          placeholder="0x..."
                        />
                      </div>
                      <div>
                        <label className="block text-white font-semibold mb-2">CoreWriter</label>
                        <input
                          type="text"
                          value={formData.contracts.coreWriterAddress || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            contracts: { ...formData.contracts, coreWriterAddress: e.target.value as `0x${string}` }
                          })}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#fab062] focus:outline-none font-mono text-sm"
                          placeholder="0x3333333333333333333333333333333333333333"
                        />
                      </div>
                    </>
                  )}

                  {isV3Form && (
                    <div className="p-3 bg-[#fab062]/10 border border-[#fab062]/20 rounded-lg">
                      <p className="text-[#fab062] text-xs">
                        <strong>v3 :</strong> Le vault RebalancingVault est auto-suffisant. Seule l&apos;adresse du vault est nécessaire. 
                        Le keeper gère le rebalance (~60s) et le settlement des retraits.
                      </p>
                    </div>
                  )}
                </div>

                {/* Boutons */}
                <div className="flex gap-4 pt-2">
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
                        setFormData(BLANK_V1);
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
                Stratégies existantes ({strategies.length})
              </h2>
              
              {loading ? (
                <p className="text-[#5a9a9a] text-center py-8">Chargement...</p>
              ) : (
                <div className="space-y-4">
                  {strategies.map((strategy) => (
                    <div key={strategy.id} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{strategy.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                            strategy.contracts.vaultVersion === 'v3'
                              ? 'bg-[#fab062]/20 text-[#fab062]'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {strategy.contracts.vaultVersion ?? 'v1'}
                          </span>
                        </div>
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
                      
                      <div className="flex items-center gap-4 mb-2">
                        <span className={`text-xs font-semibold ${
                          strategy.riskLevel === 'low' ? 'text-green-400' :
                          strategy.riskLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
                        }`}>{strategy.riskLevel}</span>
                        {strategy.status && (
                          <span className="text-xs text-gray-400">{strategy.status}</span>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500 font-mono">
                        <div>Vault: {strategy.contracts.vaultAddress.slice(0, 10)}…{strategy.contracts.vaultAddress.slice(-6)}</div>
                        {strategy.contracts.handlerAddress && (
                          <div>Handler: {strategy.contracts.handlerAddress.slice(0, 10)}…{strategy.contracts.handlerAddress.slice(-6)}</div>
                        )}
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
