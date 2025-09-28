import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SmartRebalancingPage() {
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
                    <a href="/docs" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                      🎯 Overview
                    </a>
                  </li>
                  <li>
                    <a href="/docs/smart-rebalancing" className="block px-3 py-2 text-white bg-gray-800 rounded-md">
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
                    <a href="/docs/token-axone" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                      ⭐ The Axone Token
                    </a>
                  </li>
                  <li>
                    <a href="/docs/launch" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                      🚀 Launch
                    </a>
                  </li>
                  <li>
                    <a href="/docs/revenue" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                      💠 Revenue
                    </a>
                  </li>
                  <li>
                    <a href="/docs/fees" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                      💰 Fee Management
                    </a>
                  </li>
                  <li>
                    <a href="/docs/inflation" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                      📈 Controlled Inflation
                    </a>
                  </li>
                  <li>
                    <a href="/docs/value-sharing" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                      🔥 Value Sharing
                    </a>
                  </li>
                  <li>
                    <a href="/docs/buyback-burn" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
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
                    <a href="/docs/introduction" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                      🌾 Introduction
                    </a>
                  </li>
                  <li>
                    <a href="/docs/epoch-0" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                      🌟 Epoch 0
                    </a>
                  </li>
                  <li>
                    <a href="/docs/epoch-1" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                      🌍 Epoch 1
                    </a>
                  </li>
                  <li>
                    <a href="/docs/epoch-2" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
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
                <li><a href="/" className="hover:text-white transition-colors">Axone</a></li>
                <li className="text-gray-600">/</li>
                <li><a href="/docs" className="hover:text-white transition-colors">Docs</a></li>
                <li className="text-gray-600">/</li>
                <li><a href="/docs/protocol-concepts" className="hover:text-white transition-colors">Protocol Concepts</a></li>
                <li className="text-gray-600">/</li>
                <li className="text-white">Smart Rebalancing</li>
              </ol>
            </nav>

            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">⚖️ Smart Rebalancing</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Smart Rebalancing – The intelligence behind our Indexes
              </p>
            </div>

            {/* Content */}
            <div className="prose prose-invert max-w-none">
              <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">⚡ Smart Rebalancing – The intelligence behind our Indexes</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Crypto markets evolve fast, and your investments must keep pace. That's why <strong className="text-white">Axone indexes</strong> don't just sit passively: they are <strong className="text-white">dynamic and intelligent</strong>.
                </p>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">🔹 Every hour, our indexes automatically rebalance.</h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  They sell part of the assets that outperform, buy back those that are undervalued, and continuously adjust your exposure. Result: your gains are secured, your allocations optimized, and your portfolio evolves with the market – without any effort on your part.
                </p>
              </div>

              <div className="bg-gradient-to-r from-[#fab062] to-[#3a7373] rounded-lg p-6">
                <p className="text-[#011f26] font-semibold text-lg leading-relaxed">
                  💡 <strong>Axone automates what the best traders do manually, so your capital works at full potential.</strong>
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
