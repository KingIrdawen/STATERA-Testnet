import Link from 'next/link';

export default function DocsLiquidityMiningPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Statera</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Liquidity Mining</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Liquidity Mining: Rewarding Early Engagement</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          Statera&apos;s liquidity mining mechanism is designed to fairly reward early liquidity contributors, with no centralized allocations or privileged access.
        </p>
      </div>

      <div className="prose prose-invert max-w-none space-y-8">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Statera&apos;s <strong>liquidity mining</strong> mechanism is designed to <strong>fairly reward early liquidity contributors</strong>, with <strong>no centralized allocations or privileged access.</strong>
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Before the <strong>TGE (Token Generation Event)</strong>, users can deposit HYPE into a <strong>the LP vault.</strong>
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Key features:</h2>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li><strong>Flexible deposits</strong>: Funds can be withdrawn at any time <strong>before the lock period</strong></li>
            <li><strong>No rewards are credited</strong> until the vault is locked</li>
            <li><strong>Global cap of $5M equivalent</strong> to limit risk and ensure balanced distribution</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Locking :</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            A few days or weeks before TGE, the LP vault is <strong>locked</strong>:
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li>Withdrawals become <strong>impossible</strong></li>
            <li>New deposits remain <strong>allowed</strong> until the $5M cap is reached (if not before)</li>
            <li><strong>Point distribution</strong> is finalized based on each user&apos;s share <strong>the day before TGE</strong>—no further capital additions after that.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">At TGE:</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            50M STA (50% of the initial supply) are minted and transferred to the LP vault, which now forms a balanced 50/50 liquidity pool:
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li><strong>50M STA</strong></li>
            <li><strong>125,000 HYPE</strong> (from user deposits)</li>
          </ul>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Each contributor have an allocation of <strong>STAlp</strong>, a liquidity token representing their proportional share of the pool, <strong>linearly vested on 12 months</strong>.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            The value of 1 STAlp is set at launch to <strong>0.0025 HYPE + 1 STA</strong>, reflecting the initial price ratio (1 STA = 0.0025 HYPE). After TGE, the <strong>market price of STA floats freely</strong> based on trading activity.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Users can <strong>burn STAlp at any time</strong> to withdraw their underlying assets at this ratio — effectively &quot;tapping&quot; the battery they helped charge.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            After TGE, new users can join the Statera&apos;s LP vault by depositing <strong>balanced liquidity</strong>, proportional to the <strong>current market value of STA</strong>. However, only early contributors who deposited before TGE benefit from the <strong>asymmetric entry</strong> — depositing HYPE alone while gaining exposure to STA.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            <strong>The Statera&apos;s LP vault is not just a launch mechanism — it&apos;s a lasting engine of value.</strong>
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Users can deposit their <strong>STAlp tokens into a STAlp Staking vault</strong> to earn a share of the <strong>10% annual STA inflation</strong>. Rewards are distributed based on each user&apos;s deposited value. Crucially, <strong>holders of STAlp are guaranteed at least 20% of the yearly inflation rewards</strong>, regardless of their relative share — a lasting incentive for those who fuel the Statera liquidity pool.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            This ensures <strong>long-term liquidity depth</strong> and rewards those who helped launch the protocol.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Example :</h2>
          
          <h3 className="text-xl font-bold text-white mb-4 mt-6">🚀 Initial State – At TGE</h3>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li><strong>LP vault composition</strong>: 50,000,000 STA (50% of initial supply) - 125,000 HYPE (from pre-TGE deposits)</li>
            <li><strong>Initial STA price</strong>: 0.10 USDC --&gt; 0.0025 HYPE</li>
            <li><strong>Total supply of STAlp minted</strong>: 50,000,000</li>
            <li>→ Each <strong>1 STAlp = 0.0025 HYPE + 1 STA</strong> (initial accounting value)</li>
          </ul>

          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            🔹 <strong>User A (Early Contributor)</strong>
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li>Deposited: 250 HYPE before TGE</li>
            <li>Received: 100,000 STAlp (250/0.0025)</li>
            <li>Did not redeem → instead, deposits <strong>100,000 STAlp into the LP Staking Vault</strong></li>
            <li>Participates in inflation rewards</li>
          </ul>

          <h3 className="text-xl font-bold text-white mb-4 mt-6">📅 Phase 1 – Month 1 (Post-TGE)</h3>
          
          <h4 className="text-lg font-bold text-white mb-4 mt-4">📈 Market Activity</h4>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li>High demand → STA trades up to 0.004 HYPE (+60%)</li>
            <li><strong>New Statera LP reserves (approx)</strong>:</li>
            <li>45,000,000 STA</li>
            <li>180,000 HYPE</li>
            <li><strong>Total supply of STAlp minted</strong>: 50,000,000</li>
            <li>→ Each <strong>1 STAlp = 0.0036 HYPE + 0.9 STA</strong> (new accounting value)</li>
          </ul>

          <h4 className="text-lg font-bold text-white mb-4 mt-4">New Deposit – User B (Post-TGE Contributor)</h4>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li>Wants to mint 100,000 STAlp</li>
            <li>Must deposit <strong>market-balanced liquidity</strong>: 360 HYPE + 90&apos;000 STA</li>
            <li>Receives: 100,000 STAlp</li>
            <li><strong>Total supply of STAlp minted</strong>: 50,100,000</li>
            <li>→ Each <strong>1 STAlp = 0.0036 HYPE + 0.9 STA</strong></li>
            <li>Immediately deposits them into the <strong>LP Staking Vault</strong></li>
          </ul>

          <h4 className="text-lg font-bold text-white mb-4 mt-4">LP Staking Vault – Monthly Inflation Distribution</h4>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li><strong>Monthly inflation (1/12 of 10%)</strong>: 833,333.333 STA</li>
            <li><strong>Total deposits in LP Staking Vault</strong>:</li>
            <li>User A: 100,000 STAlp</li>
            <li>→ Valued at: 100,000 × (0.16 + 1 × 0.167) = <strong>32,032 USDC</strong></li>
            <li>User B: 100,000 STAlp</li>
            <li>→ Valued at: <strong>32,032 USDC</strong></li>
            <li>Other users (ERA depositors): 3,600,000 USDC</li>
            <li><strong>Total Reactor value</strong>: 3,664,064 USDC</li>
            <li><strong>Pro-rata share without floor</strong>:</li>
            <li>STAlp depositors: 64,064 / 3,664,064 = <strong>1.75%</strong> --&gt; 4,375 STA</li>
            <li>ERA depositors: <strong>98.25%</strong> --&gt; 245,625 STA</li>
            <li><strong>But</strong>: STAlp depositors are <strong>guaranteed at least 20% of inflation</strong> → <strong>50,000 STA</strong></li>
            <li>Split equally:</li>
            <li>User A: <strong>25,000 STA</strong></li>
            <li>User B: <strong>25,000 STA</strong></li>
            <li>Remaining 200,000 STA → distributed to ERA depositors</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
