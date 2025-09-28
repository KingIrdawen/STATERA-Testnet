import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#011f26]">
      <Header />
      
      <div className="flex min-h-screen">
        {/* Sidebar - Sommaire */}
        <div className="w-80 bg-[#001a1f] border-r border-gray-700 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">Axone Docs</h2>
            
            <nav className="space-y-2">
              {/* PROTOCOL CONCEPTS */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#fab062] uppercase tracking-wide mb-3">PROTOCOL CONCEPTS</h3>
                <ul className="space-y-1">
                  <li>
                    <a href="/docs" className="block px-3 py-2 text-white bg-gray-800 rounded-md">
                      🎯 Overview
                    </a>
                  </li>
                  <li>
                    <a href="/docs/smart-rebalancing" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                      ⚖️ Smart Rebalancing
                    </a>
                  </li>
                  <li>
                    <a href="/docs/hypercore" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                      🌊 Axone x Hypercore
                    </a>
                  </li>
                  <li>
                    <a href="/docs/hyperunit" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                      🛡️ Axone x HyperUnit
                    </a>
                  </li>
                </ul>
              </div>

              {/* Token Design */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#fab062] uppercase tracking-wide mb-3">Token Design</h3>
                <ul className="space-y-1">
                  <li>
                    <a href="#token-axone" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                      ⭐ The Axone Token
                    </a>
                  </li>
                  <li>
                    <a href="#launch" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                      🚀 Launch
                    </a>
                  </li>
                  <li>
                    <a href="#revenue" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                      💠 Revenue
                    </a>
                  </li>
                  <li>
                    <a href="#fees" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                      💰 Fee Management
                    </a>
                  </li>
                  <li>
                    <a href="#inflation" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                      📈 Controlled Inflation
                    </a>
                  </li>
                  <li>
                    <a href="#value-sharing" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                      🔥 Value Sharing
                    </a>
                  </li>
                  <li>
                    <a href="#buyback-burn" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                      🌀 Buyback & Burn
                    </a>
                  </li>
                </ul>
              </div>

              {/* Growth Strategy */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#fab062] uppercase tracking-wide mb-3">Growth Strategy</h3>
                <ul className="space-y-1">
                  <li>
                    <a href="#introduction" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                      🌾 Introduction
                    </a>
                  </li>
                  <li>
                    <a href="#epoch-0" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                      🌟 Epoch 0
                    </a>
                  </li>
                  <li>
                    <a href="#epoch-1" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                      🌍 Epoch 1
                    </a>
                  </li>
                  <li>
                    <a href="#epoch-2" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                      🚀 Epoch 2
                    </a>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            {/* Breadcrumb */}
            <nav className="mb-8">
              <ol className="flex items-center space-x-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-white transition-colors">Axone</Link></li>
                <li className="text-gray-600">/</li>
                <li><a href="/docs" className="hover:text-white transition-colors">Docs</a></li>
                <li className="text-gray-600">/</li>
                <li><a href="/docs/protocol-concepts" className="hover:text-white transition-colors">Protocol Concepts</a></li>
                <li className="text-gray-600">/</li>
                <li className="text-white">Overview</li>
              </ol>
            </nav>

            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">🎯 Overview</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Axone Index – Web3 investment, reinvented
              </p>
            </div>

            {/* Content */}
            <div className="prose prose-invert max-w-none">
              <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">🌐 Axone Index – Web3 investment, reinvented</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  The crypto universe evolves fast, but investing intelligently shouldn&apos;t be a puzzle. With <strong className="text-white">Axone Index</strong>, we&apos;ve reimagined how to expose yourself to the market.
                </p>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">🔹 One asset in, instant exposure to multiple crypto projects.</h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  No more hunting for liquid marketplaces, manual swap management, or endless analysis of hidden fees. Axone bundles everything into a single product, designed to maximize efficiency and reduce complexity.
                </p>
                
                <h3 className="text-xl font-bold text-white mb-4">Our indices allow you to:</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-[#fab062] mr-3 mt-1">•</span>
                    <span><strong className="text-white">Simplify</strong> your investments, in one click.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#fab062] mr-3 mt-1">•</span>
                    <span><strong className="text-white">Diversify</strong> your positions without effort.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#fab062] mr-3 mt-1">•</span>
                    <span><strong className="text-white">Secure</strong> your allocations with reliable and transparent decentralized infrastructure.</span>
                  </li>
                </ul>
              </div>

              <div className="mb-8">
                <p className="text-gray-300 leading-relaxed">
                  With Axone, you save time, reduce your risks, and enjoy Web3&apos;s potential without the usual friction.
                </p>
              </div>

              <div className="bg-gradient-to-r from-[#fab062] to-[#3a7373] rounded-lg p-6">
                <p className="text-[#011f26] font-semibold text-lg leading-relaxed">
                  💡 <strong>Axone Index is the ideal gateway to an optimized and intelligent crypto portfolio.</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
