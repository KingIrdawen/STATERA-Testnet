'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import Footer from '@/components/Footer';
import { Index, getRiskColor, getRiskBgColor } from '@/types/index';
import StateraLayersIcon from '../../icons/StateraLayersIcon';
import { useStrategies } from '@/hooks/useStrategies';
import { useStrategyData } from '@/hooks/useStrategyData';
import { useVaultActions } from '@/hooks/useVaultActions';
import { useWithdrawFeePreview } from '@/hooks/useWithdrawFeePreview';
import { useStrategyApy } from '@/hooks/useStrategyApy';
import { formatUsd, formatBps } from '@/lib/format';
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

// Fonction pour valider une adresse Ethereum
function isValidAddress(address: string): boolean {
  if (!address || address.trim() === '') return false;
  const addr = address.trim();
  // Vérifier que c'est une adresse hexadécimale valide (42 caractères avec 0x)
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

// Fonction pour vérifier les éléments manquants de la configuration
function getMissingConfig(strategy: Index): string[] {
  const missing: string[] = [];
  
  // Note: usdcAddress n'est plus requis car les dépôts se font en HYPE natif
  // On garde la vérification pour la compatibilité mais ce n'est plus obligatoire
  
  if (!strategy.vaultAddress || strategy.vaultAddress.trim() === '') {
    missing.push('Vault Address (empty)');
  } else if (!isValidAddress(strategy.vaultAddress)) {
    missing.push(`Vault Address (invalid: ${strategy.vaultAddress.slice(0, 20)}...)`);
  }
  if (!strategy.handlerAddress || strategy.handlerAddress.trim() === '') {
    missing.push('Handler Address (empty)');
  } else if (!isValidAddress(strategy.handlerAddress)) {
    missing.push(`Handler Address (invalid: ${strategy.handlerAddress.slice(0, 20)}...)`);
  }
  if (!strategy.l1ReadAddress || strategy.l1ReadAddress.trim() === '') {
    missing.push('L1Read Address (empty)');
  } else if (!isValidAddress(strategy.l1ReadAddress)) {
    missing.push(`L1Read Address (invalid: ${strategy.l1ReadAddress.slice(0, 20)}...)`);
  }
  return missing;
}

// Composant pour afficher une stratégie avec ses données
function StrategyCard({ strategy, showWithdraw = false }: { strategy: Index; showWithdraw?: boolean }) {
  const { data, isLoading, isConfigured, address, isError, error } = useStrategyData(strategy);
  const { deposit, withdraw, isPending, isConfirming, isSuccess } = useVaultActions(strategy);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Hooks pour le réseau et le simulateur de frais
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { setAmountUsdStr, amountUsdStr, result: feeResult, isLoading: isFeeLoading } = useWithdrawFeePreview(strategy);
  const { apy: estimatedApy } = useStrategyApy(strategy);
  
  // Chain ID attendu pour HyperEVM Testnet
  const EXPECTED_CHAIN_ID = 998;
  const isCorrectChain = chainId === EXPECTED_CHAIN_ID;
  
  // Vérifier les éléments manquants
  const missingConfig = getMissingConfig(strategy);
  
  // Total HYPE déposé dans le vault (en HYPE, pas USD)
  const totalHypeDeposited = data
    ? parseFloat(data.totalHypeDeposited || '0')
    : 0;
  
  // Dépôts de l'utilisateur en HYPE
  const userDepositsHype = data
    ? parseFloat(data.userDepositsHype || '0')
    : 0;
  
  // Part de l'utilisateur (ratio shares / totalSupply)
  const userShare = data?.userShare || 0;

  // Vérifier le réseau quand un montant est entré
  useEffect(() => {
    const amount = depositAmount?.trim();
    if (amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0) {
      if (address && !isCorrectChain) {
        setErrorMessage('Wrong Network - Please switch to HyperEVM Testnet (Chain ID: 998)');
      } else if (address && isCorrectChain) {
        // Effacer l'erreur de réseau si le réseau est correct
        setErrorMessage((prev) => {
          if (prev === 'Wrong Network - Please switch to HyperEVM Testnet (Chain ID: 998)') {
            return null;
          }
          return prev;
        });
      } else if (!address) {
        // Si pas connecté, ne pas afficher d'erreur de réseau
        setErrorMessage((prev) => {
          if (prev === 'Wrong Network - Please switch to HyperEVM Testnet (Chain ID: 998)') {
            return null;
          }
          return prev;
        });
      }
    } else if (!amount || amount === '') {
      // Effacer l'erreur de réseau si le champ est vide
      setErrorMessage((prev) => {
        if (prev === 'Wrong Network - Please switch to HyperEVM Testnet (Chain ID: 998)') {
          return null;
        }
        return prev;
      });
    }
  }, [depositAmount, address, isCorrectChain]);

  // Gérer le dépôt
  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }

    if (!address) {
      setErrorMessage('Please connect your wallet');
      return;
    }

    if (!isCorrectChain) {
      setErrorMessage('Wrong Network - Please switch to HyperEVM Testnet (Chain ID: 998)');
      return;
    }

    if (!strategy?.vaultAddress) {
      setErrorMessage('Strategy is not fully configured. Please set the vault address.');
      return;
    }

    // Vérifier le solde HYPE natif
    if (!data?.hypeBalance || parseFloat(depositAmount) > parseFloat(data.hypeBalance)) {
      setErrorMessage('Insufficient HYPE balance');
      return;
    }

    setErrorMessage(null);
    try {
      // HYPE natif utilise 18 décimales
      await deposit(depositAmount, 18);
      setDepositAmount(''); // Reset après succès
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deposit';
      setErrorMessage(errorMessage);
    }
  };

  // Gérer le retrait
  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }

    if (!address) {
      setErrorMessage('Please connect your wallet');
      return;
    }

    if (!strategy?.vaultAddress) {
      setErrorMessage('Strategy vault address is not configured.');
      return;
    }

    if (parseFloat(withdrawAmount) > parseFloat(data?.vaultShares || '0')) {
      setErrorMessage('Insufficient shares');
      return;
    }

    setErrorMessage(null);
    try {
      // Utiliser les décimales réelles depuis les données si disponibles
      const vaultDecimals = data?.vaultDecimals || 18;
      await withdraw(withdrawAmount, vaultDecimals);
      setWithdrawAmount(''); // Reset après succès
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to withdraw';
      setErrorMessage(errorMessage);
    }
  };

  // Reset les erreurs quand la transaction réussit
  useEffect(() => {
    if (isSuccess) {
      setErrorMessage(null);
      // Recharger les données après succès
      // Le composant parent devrait recharger via useStrategyData
    }
  }, [isSuccess]);

  return (
    <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 hover:border-[#fab062]/50 transition-colors h-full flex flex-col">
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
          <h5 className="text-white font-semibold">
            APY: {estimatedApy !== null && !isNaN(estimatedApy) && isFinite(estimatedApy)
              ? `${estimatedApy.toFixed(2)}%` 
              : '-'}
          </h5>
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
      
      {/* Informations depuis les smart contracts */}
      {!address && (
        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          <p className="text-yellow-400 text-sm">Please connect your wallet to view strategy data</p>
        </div>
      )}
      
      {address && missingConfig.length > 0 && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
          <p className="text-red-400 text-sm font-semibold mb-1">Missing configuration:</p>
          <ul className="text-red-300 text-xs list-disc list-inside">
            {missingConfig.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="text-red-300 text-xs mt-2">Please configure these addresses in the admin page.</p>
          <p className="text-yellow-300 text-xs mt-1">Current addresses:</p>
          <p className="text-yellow-300 text-xs">Vault: {strategy.vaultAddress || 'Not set'}</p>
          <p className="text-yellow-300 text-xs">Handler: {strategy.handlerAddress || 'Not set'}</p>
          <p className="text-yellow-300 text-xs">L1Read: {strategy.l1ReadAddress || 'Not set'}</p>
        </div>
      )}
      
      {address && isConfigured && isError && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
          <p className="text-red-400 text-sm font-semibold mb-1">Error loading contract data:</p>
          <p className="text-red-300 text-xs">{error?.message || 'Unknown error'}</p>
          <p className="text-red-300 text-xs mt-2">Please check that the contract addresses are correct and deployed on HyperEVM Testnet.</p>
        </div>
      )}
      
      {isLoading && isConfigured && (
        <div className="mb-4 text-center">
          <p className="text-[#5a9a9a] text-sm">Loading contract data...</p>
        </div>
      )}
      
      {/* Network verification */}
      {address && !isCorrectChain && (
        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          <p className="text-yellow-400 text-sm font-semibold mb-2">Wrong Network</p>
          <p className="text-yellow-300 text-xs mb-2">Please switch to HyperEVM Testnet (Chain ID: 998)</p>
          <button
            onClick={() => switchChain({ chainId: EXPECTED_CHAIN_ID })}
            className="px-3 py-1.5 bg-yellow-600 text-black font-semibold rounded text-xs hover:bg-yellow-700 transition-colors"
          >
            Switch to HyperEVM Testnet
          </button>
        </div>
      )}
      
      {/* Bouton de dépôt */}
      <div className="mt-auto">
        {/* Total HYPE Deposited et Your deposits */}
        <div className="mb-4">
          <div className="mb-2 flex justify-between items-center">
            <span className="text-white font-semibold text-sm">Total HYPE Deposited</span>
            <span className="text-white font-bold">
              {isLoading ? '...' : `${totalHypeDeposited.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} HYPE`}
            </span>
          </div>
          <div className="mb-2 flex justify-between items-center">
            <span className="text-gray-400 text-sm">Your deposits in this strategy</span>
            <span className="text-gray-400 font-bold">
              {isLoading ? '...' : `${userDepositsHype.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} HYPE`}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Your shares in this strategy</span>
            <span className="text-gray-400 font-bold">
              {isLoading ? '...' : `${parseFloat(data?.vaultShares || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`}
            </span>
          </div>
          {/* PPS Display */}
          {address && isConfigured && !isLoading && data && (
            <div className="mt-2 flex justify-between items-center">
              <span className="text-gray-400 text-sm">Price Per Share (PPS)</span>
              <span className="text-white font-semibold">
                {formatUsd(data.ppsUsd, 4)}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <label className="block text-white text-sm font-semibold">
            Deposit Amount (HYPE)
          </label>
          <span className="text-gray-400 text-xs">
            Balance: {isLoading ? '...' : `${data?.hypeBalance || '0'} HYPE`}
          </span>
        </div>
        {errorMessage && (
          <div className={`mb-2 p-3 rounded text-xs font-semibold ${
            errorMessage.includes('Wrong Network') 
              ? 'bg-red-600/90 border-2 border-red-500 text-white' 
              : 'bg-red-900/20 border border-red-500/50 text-red-400'
          }`}>
            <div className="flex items-center gap-2">
              {errorMessage.includes('Wrong Network') && <span>⚠️</span>}
              <span>{errorMessage}</span>
              {errorMessage.includes('Wrong Network') && address && (
                <button
                  onClick={() => switchChain({ chainId: EXPECTED_CHAIN_ID })}
                  className="ml-auto px-2 py-1 bg-white text-red-600 font-semibold rounded text-xs hover:bg-gray-100 transition-colors whitespace-nowrap"
                >
                  Switch Network
                </button>
              )}
            </div>
          </div>
        )}
        {isSuccess && (
          <div className="mb-2 p-2 bg-green-900/20 border border-green-500/50 rounded text-green-400 text-xs">
            Transaction successful!
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="0.00"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            disabled={isPending || isConfirming}
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-[#fab062] focus:outline-none min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
            min="0"
            step="0.01"
          />
          <button
            onClick={handleDeposit}
            disabled={isPending || isConfirming || !isConfigured || !address || !depositAmount}
            className="px-3 py-2 bg-gradient-to-r from-[#fab062] to-[#5a9a9a] text-black font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Processing...' : isConfirming ? 'Confirming...' : 'Deposit'}
          </button>
        </div>
        
        {/* Bouton de retrait (si showWithdraw est true) */}
        {showWithdraw && (
          <div className="space-y-2 mt-4">
            <label className="block text-white text-sm font-semibold">
              Withdraw Amount (Shares)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                disabled={isPending || isConfirming}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-[#fab062] focus:outline-none min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                min="0"
                step="0.01"
              />
              <button
                onClick={handleWithdraw}
                disabled={isPending || isConfirming || !isConfigured || !address || !withdrawAmount}
                className="px-3 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Processing...' : isConfirming ? 'Confirming...' : 'Withdraw'}
              </button>
            </div>
          </div>
        )}
        
        {/* Section Advanced (Oracles et Simulateur de frais) - seulement pour l'onglet Strategy avec dépôts */}
        {address && isConfigured && !isLoading && data && showWithdraw && (
          <div className="mt-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between p-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <span className="text-gray-400 text-sm font-semibold">Advanced</span>
              <span className="text-gray-500 text-xs">{showAdvanced ? '▼' : '▶'}</span>
            </button>
            
            {showAdvanced && (
              <div className="mt-2 p-3 bg-gray-800/30 border border-gray-700 rounded-lg space-y-4">
                {/* Oracle Prices */}
                <div>
                  <p className="text-gray-400 text-xs font-semibold mb-2">Oracle Prices</p>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs">HYPE (oracle)</span>
                      <span className="text-white text-sm font-mono">
                        {formatUsd(data.oracleHypeUsd, 4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs">BTC (oracle)</span>
                      <span className="text-white text-sm font-mono">
                        {formatUsd(data.oracleBtcUsd, 2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Withdraw Fee Simulator */}
                {showWithdraw && (
                  <div className="pt-3 border-t border-gray-700">
                    <p className="text-gray-400 text-xs font-semibold mb-2">Withdraw Fee Simulator</p>
                    <div className="space-y-2">
                      <input
                        type="number"
                        placeholder="Amount to withdraw (USD)"
                        value={amountUsdStr}
                        onChange={(e) => setAmountUsdStr(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-[#fab062] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        min="0"
                        step="0.01"
                      />
                      {feeResult.bps !== undefined && amountUsdStr && parseFloat(amountUsdStr) > 0 && (
                        <div className="p-2 bg-gray-900/50 rounded text-xs">
                          <span className="text-gray-400">Estimated withdraw fee: </span>
                          <span className="text-white font-semibold">
                            {formatUsd((parseFloat(amountUsdStr) * feeResult.bps) / 10000, 2)}
                          </span>
                        </div>
                      )}
                      {feeResult.error && (
                        <div className="p-2 bg-red-900/20 border border-red-600/30 rounded text-red-400 text-xs">
                          Error: {feeResult.error.message}
                        </div>
                      )}
                      {isFeeLoading && (
                        <div className="text-gray-500 text-xs">Loading fee...</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
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
                {strategiesWithDeposits.map((strategy) => (
                  <StrategyCard key={strategy.id} strategy={strategy} showWithdraw={true} />
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
                      <StrategyCard key={strategy.id} strategy={strategy} />
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