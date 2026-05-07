import { fetchBalances } from './balances.js'
import { fetchPrices }   from './prices.js'
import { getLedger }     from './ledger.js'
import { renderTable, renderTicker, renderStatusBar, renderLedger, renderWallets } from './ui.js'

// DustToken extends TokenBalance with computed fields:
// { ...TokenBalance, humanAmount: number, usdValue: number, gasEstimate: null, netValue: number }
function computeDust(balances, prices, threshold) {
  return balances
    .map(b => {
      const price = prices[b.tokenSymbol] ?? 0
      // isRentAccounts: rawBalance is the count of dead accounts, each worth prices.RENT
      const humanAmount = b.isRentAccounts
        ? parseInt(b.rawBalance, 10)
        : parseInt(b.rawBalance, 10) / Math.pow(10, b.decimals)
      const usdValue = humanAmount * price
      return {
        ...b,
        humanAmount,
        usdValue,
        gasEstimate: null, // Phase 2: subtract real gas cost here
        netValue: usdValue // Phase 2: netValue = usdValue - gasEstimate
      }
    })
    .filter(t => t.usdValue > 0 && t.usdValue < threshold)
    .sort((a, b) => b.usdValue - a.usdValue)
}

async function init() {
  const config = window.DUSTKIT_CONFIG

  renderWallets(config.wallets)
  renderStatusBar({ alchemy: 'mock', helius: 'mock', coingecko: 'mock', lifi: 'pending' })
  renderLedger(getLedger())

  // Fetch balances and prices in parallel
  // TODO (Phase 2+): cache these responses (CoinGecko: 60s TTL, balances: on manual refresh only)
  const symbols = ['PEPE','GMX','USDC','DEGEN','MATIC','OP','BONK','RENT']
  const [balances, prices] = await Promise.all([
    fetchBalances(config.wallets),
    fetchPrices(symbols)
  ])

  function applyThreshold(threshold) {
    const dustTokens = computeDust(balances, prices, threshold)
    renderTable(dustTokens)
    renderTicker(dustTokens)
    document.getElementById('thresh-val').textContent = `$${threshold}`
    document.getElementById('threshold-display').textContent = `$${threshold.toFixed(2)}`
  }

  const slider = document.getElementById('threshold-slider')
  slider.value = config.dustThreshold
  applyThreshold(config.dustThreshold)

  // Threshold slider — re-filter without re-fetching
  slider.addEventListener('input', () => applyThreshold(parseFloat(slider.value)))

  // Expose refresh for the toolbar Refresh button — re-runs full init
  window.dustkitRefresh = () => init()
}

init()
