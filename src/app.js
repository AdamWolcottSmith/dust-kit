import { fetchBalances } from './balances.js'
import { fetchPrices }   from './prices.js'
import { getLedger }     from './ledger.js'
import { renderTable, renderTicker, renderStatusBar, renderLedger, renderWallets } from './ui.js'

// gasMap: { [chain]: { gwei: number, usdCost: number } | null }
function computeDust(balances, prices, threshold, gasMap) {
  return balances
    .map(b => {
      const price = prices[b.tokenSymbol] ?? 0
      const humanAmount = b.isRentAccounts
        ? Number(b.rawBalance)
        : Number(BigInt(b.rawBalance) * 10000n / BigInt(10 ** b.decimals)) / 10000
      const usdValue = humanAmount * price
      const gasEstimate = gasMap[b.chain]?.usdCost ?? null
      const netValue = gasEstimate !== null ? usdValue - gasEstimate : usdValue
      return {
        ...b,
        humanAmount,
        usdValue,
        gasEstimate,
        netValue,
        shouldSweep: gasEstimate !== null ? netValue > 0 : true
      }
    })
    .filter(t => t.usdValue > 0 && t.usdValue < threshold)
    .sort((a, b) => b.usdValue - a.usdValue)
}

async function fetchAndRender(config, applyThreshold) {
  renderStatusBar({ alchemy: 'mock', helius: 'mock', coingecko: 'mock', lifi: 'pending' })
  renderLedger(getLedger())

  try {
    // TODO (Phase 2+): cache responses (CoinGecko: 60s TTL, balances: on manual refresh only)
    const balances = await fetchBalances(config.wallets)
    const symbols = [...new Set(balances.map(b => b.tokenSymbol))]
    const prices = await fetchPrices(symbols)
    applyThreshold(config.dustThreshold, balances, prices)
    return { balances, prices }
  } catch (err) {
    renderStatusBar({ alchemy: 'error', helius: 'error', coingecko: 'error', lifi: 'pending' })
    const tbody = document.getElementById('dust-table-body')
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#cc0000;background:#fff">Error loading data. Click Refresh to retry.</td></tr>`
    throw err
  }
}

async function setup() {
  const config = window.DUSTKIT_CONFIG
  renderWallets(config.wallets)

  const slider = document.getElementById('threshold-slider')
  slider.value = config.dustThreshold
  document.getElementById('thresh-val').textContent = `$${config.dustThreshold}`
  document.getElementById('threshold-display').textContent = `$${config.dustThreshold.toFixed(2)}`

  let state = { balances: [], prices: {} }

  function applyThreshold(threshold, balances, prices) {
    if (balances !== undefined) state = { balances, prices }
    const dustTokens = computeDust(state.balances, state.prices, threshold, {})
    renderTable(dustTokens)
    renderTicker(dustTokens)
    document.getElementById('thresh-val').textContent = `$${threshold}`
    document.getElementById('threshold-display').textContent = `$${threshold.toFixed(2)}`
  }

  // Wire slider once — re-filters without re-fetching
  slider.addEventListener('input', () => applyThreshold(parseFloat(slider.value)))

  // Expose refresh — re-fetches without re-wiring slider
  window.dustkitRefresh = () => fetchAndRender(config, applyThreshold)

  await fetchAndRender(config, applyThreshold)
}

setup()
