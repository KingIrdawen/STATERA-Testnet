'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Footer from '@/components/Footer';
import { Index, Token } from '@/types/index';
import { useStrategies } from '@/hooks/useStrategies';

export default function AdminPage() {
  const { strategies, loading, createStrategy, updateStrategy, deleteStrategy } = useStrategies();
  const [editingIndex, setEditingIndex] = useState<Index | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    riskLevel: 'low' | 'medium' | 'high';
    apy?: number;
    usdcAddress: string;
    vaultAddress: string;
    handlerAddress: string;
    l1ReadAddress: string;
    coreWriterAddress: string;
    tokens: Token[];
  }>({
    name: '',
    description: '',
    riskLevel: 'low',
    apy: undefined,
    usdcAddress: '',
    vaultAddress: '',
    handlerAddress: '',
    l1ReadAddress: '',
    coreWriterAddress: '0x3333333333333333333333333333333333333333', // Valeur par défaut
    tokens: [{ symbol: '', name: '', allocation: 0, logo: '', tokenId: '' }]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const totalAllocation = formData.tokens.reduce((sum, token) => sum + token.allocation, 0);
    if (totalAllocation !== 100) {
      alert('La répartition des tokens doit totaliser 100%');
      return;
    }

    const newIndex: Index = {
      id: editingIndex?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      riskLevel: formData.riskLevel,
      apy: formData.apy,
      usdcAddress: formData.usdcAddress,
      vaultAddress: formData.vaultAddress,
      handlerAddress: formData.handlerAddress,
      l1ReadAddress: formData.l1ReadAddress,
      coreWriterAddress: formData.coreWriterAddress || '0x3333333333333333333333333333333333333333',
      tokens: formData.tokens.filter(token => token.symbol)
    };

    try {
      if (editingIndex) {
        // Modifier une stratégie existante
        await updateStrategy(newIndex);
      } else {
        // Ajouter une nouvelle stratégie
        await createStrategy(newIndex);
      }

      // Réinitialiser le formulaire
      setFormData({
        name: '',
        description: '',
        riskLevel: 'low',
        apy: undefined,
        usdcAddress: '',
        vaultAddress: '',
        handlerAddress: '',
        l1ReadAddress: '',
        coreWriterAddress: '0x3333333333333333333333333333333333333333',
        tokens: [{ symbol: '', name: '', allocation: 0, logo: '', tokenId: '' }]
      });
      setEditingIndex(null);
    } catch (error) {
      console.error('Error saving strategy:', error);
      alert('Erreur lors de la sauvegarde de la stratégie');
    }
  };

  const handleEdit = (index: Index) => {
    setEditingIndex(index);
    setFormData({
      name: index.name,
      description: index.description || '',
      riskLevel: index.riskLevel,
      apy: index.apy,
      usdcAddress: index.usdcAddress || '',
      vaultAddress: index.vaultAddress || '',
      handlerAddress: index.handlerAddress || '',
      l1ReadAddress: index.l1ReadAddress || '',
      coreWriterAddress: index.coreWriterAddress || '0x3333333333333333333333333333333333333333',
      tokens: index.tokens.length > 0 ? index.tokens : [{ symbol: '', name: '', allocation: 0, logo: '', tokenId: '' }]
    });
  };

  const handleDelete = async (indexId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette stratégie ?')) {
      try {
        await deleteStrategy(indexId);
      } catch (error) {
        console.error('Error deleting strategy:', error);
        alert('Erreur lors de la suppression de la stratégie');
      }
    }
  };

  const addTokenField = () => {
    setFormData((prev) => ({
      ...prev,
      tokens: [...prev.tokens, { symbol: '', name: '', allocation: 0, logo: '', tokenId: '' }]
    }));
  };

  const removeTokenField = (index: number) => {
    setFormData((prev) => {
      const newTokens = prev.tokens.filter((_, i) => i !== index);
      // S'assurer qu'il reste au moins un token
      if (newTokens.length === 0) {
        return {
          ...prev,
          tokens: [{ symbol: '', name: '', allocation: 0, logo: '', tokenId: '' }]
        };
      }
      return { ...prev, tokens: newTokens };
    });
  };

  const updateTokenField = (index: number, field: keyof Token, value: string | number) => {
    setFormData((prev) => {
      const newTokens = [...prev.tokens];
      newTokens[index] = { ...newTokens[index], [field]: value };
      return { ...prev, tokens: newTokens };
    });
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'faible': return 'text-green-400';
      case 'moyen': return 'text-yellow-400';
      case 'élevé': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
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
              href="/vaults"
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
                largeScreen: false, // Désactiver pour éviter les erreurs getBalance
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
              Gérer les strategies crypto
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulaire */}
            <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingIndex ? 'Modifier la stratégie' : 'Créer une nouvelle stratégie'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nom de la stratégie */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Nom de la stratégie
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
                    Niveau de risque
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

                {/* Adresses */}
                <div className="space-y-4">
                  <h3 className="text-white font-semibold text-lg">Adresses</h3>
                  
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Adresse USDC
                    </label>
                    <input
                      type="text"
                      value={formData.usdcAddress}
                      onChange={(e) => setFormData({ ...formData, usdcAddress: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#fab062] focus:outline-none"
                      placeholder="0x..."
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Adresse Vault
                    </label>
                    <input
                      type="text"
                      value={formData.vaultAddress}
                      onChange={(e) => setFormData({ ...formData, vaultAddress: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#fab062] focus:outline-none"
                      placeholder="0x..."
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Adresse CoreInteractionHandler (handlerAddress)
                    </label>
                    <input
                      type="text"
                      value={formData.handlerAddress}
                      onChange={(e) => setFormData({ ...formData, handlerAddress: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#fab062] focus:outline-none"
                      placeholder="0x..."
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Adresse L1Read
                    </label>
                    <input
                      type="text"
                      value={formData.l1ReadAddress}
                      onChange={(e) => setFormData((prev) => ({ ...prev, l1ReadAddress: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#fab062] focus:outline-none"
                      placeholder="0x..."
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Adresse CoreWriter
                    </label>
                    <input
                      type="text"
                      value={formData.coreWriterAddress}
                      onChange={(e) => setFormData((prev) => ({ ...prev, coreWriterAddress: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#fab062] focus:outline-none"
                      placeholder="0x3333333333333333333333333333333333333333"
                    />
                    <p className="text-gray-400 text-xs mt-1">
                      Adresse système CoreWriter (par défaut: 0x3333...3333)
                    </p>
                  </div>
                </div>

                {/* Tokens */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-white font-semibold">
                      Tokens et répartition
                    </label>
                    <button
                      type="button"
                      onClick={addTokenField}
                      className="px-3 py-1 bg-[#fab062] text-black rounded-lg text-sm font-semibold hover:bg-[#e89a4a] transition-colors"
                    >
                      + Ajouter
                    </button>
                  </div>

                  {formData.tokens.map((token, index) => (
                    <div key={index} className="space-y-2 mb-4 p-4 bg-gray-800 rounded-lg">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Symbol (ex: BTC)"
                          value={token.symbol}
                          onChange={(e) => updateTokenField(index, 'symbol', e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-[#fab062] focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Allocation %"
                          value={token.allocation}
                          onChange={(e) => updateTokenField(index, 'allocation', Number(e.target.value))}
                          className="w-28 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-[#fab062] focus:outline-none"
                          min="0"
                          max="100"
                        />
                        {formData.tokens.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTokenField(index)}
                            className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <input
                          type="text"
                          placeholder="Token ID"
                          value={token.tokenId}
                          onChange={(e) => updateTokenField(index, 'tokenId', e.target.value)}
                          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-[#fab062] focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Boutons */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-[#fab062] text-black font-semibold rounded-lg hover:bg-[#e89a4a] transition-colors"
                  >
                    {editingIndex ? 'Modifier' : 'Créer'}
                  </button>
                  {editingIndex && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingIndex(null);
                        setFormData({
                          name: '',
                          description: '',
                          riskLevel: 'low',
                          usdcAddress: '',
                          vaultAddress: '',
                          handlerAddress: '',
                          l1ReadAddress: '',
                          coreWriterAddress: '0x3333333333333333333333333333333333333333',
                          tokens: [{ symbol: '', name: '', allocation: 0, logo: '', tokenId: '' }]
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

            {/* Liste des index existants */}
            <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                Strategies existantes ({strategies.length})
              </h2>
              
              {loading ? (
                <p className="text-[#5a9a9a] text-center py-8">Chargement...</p>
              ) : (
                <div className="space-y-4">
                  {strategies.map((index) => (
                  <div key={index.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-white">{index.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(index)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(index.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-[#5a9a9a] text-sm mb-3">{index.description}</p>
                    
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-sm text-gray-400">Risque:</span>
                      <span className={`text-sm font-semibold ${getRiskColor(index.riskLevel)}`}>
                        {index.riskLevel}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-400 space-y-3">
                      <div>
                        <span className="font-semibold">Tokens:</span>
                        <div className="mt-1 space-y-1">
                          {index.tokens.map((token, i) => (
                            <div key={i} className="flex justify-between">
                              <span>{token.symbol}</span>
                              <span>{token.allocation}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-semibold">Adresses:</span>
                        <div className="mt-1 space-y-1 text-xs">
                          <div>USDC: {index.usdcAddress ? `${index.usdcAddress.slice(0, 6)}...${index.usdcAddress.slice(-4)}` : 'Non définie'}</div>
                          <div>Vault: {index.vaultAddress ? `${index.vaultAddress.slice(0, 6)}...${index.vaultAddress.slice(-4)}` : 'Non définie'}</div>
                          <div>CoreHandler: {index.handlerAddress ? `${index.handlerAddress.slice(0, 6)}...${index.handlerAddress.slice(-4)}` : 'Non définie'}</div>
                          <div>L1Read: {index.l1ReadAddress ? `${index.l1ReadAddress.slice(0, 6)}...${index.l1ReadAddress.slice(-4)}` : 'Non définie'}</div>
                          <div>CoreWriter: {index.coreWriterAddress ? `${index.coreWriterAddress.slice(0, 6)}...${index.coreWriterAddress.slice(-4)}` : 'Non définie'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  ))}
                  
                  {strategies.length === 0 && (
                    <p className="text-[#5a9a9a] text-center py-8">
                      Aucune stratégie créée pour le moment
                    </p>
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
