import { fetchBalances }       from './balances.js'
import { fetchPrices }         from './prices.js'
import { fetchGasCosts }       from './gas.js'
import { getLedger }           from './ledger.js'
import { fetchRentReclaimable } from './solana-rent.js'
import { renderTable, renderTicker, renderStatusBar, renderLedger, renderWallets, renderGas, renderSolanaRent } from './ui.js'

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
        shouldSweep: gasEstimate !== null ? netValue > 0 : false
      }
    })
    .filter(t => t.usdValue > 0 && t.usdValue < threshold)
    .sort((a, b) => b.usdValue - a.usdValue)
}

async function fetchAndRender(config, applyThreshold) {
  renderStatusBar({ alchemy: 'mock', helius: 'mock', coingecko: 'live', lifi: 'pending' })
  renderLedger(getLedger())

  try {
    const balances = await fetchBalances(config.wallets)
    const symbols = [...new Set(balances.map(b => b.tokenSymbol))]

    // Fetch prices and gas in parallel — both are independent
    const [prices, gasMap] = await Promise.all([
      fetchPrices(symbols),
      fetchGasCosts(config)
    ])

    renderGas(gasMap)
    applyThreshold(config.dustThreshold, balances, prices, gasMap)

    // Fetch Solana rent reclaimable for each Solana wallet
    const solPriceUSD = prices['SOL'] ?? prices['WSOL'] ?? 0
    const rentResults = await Promise.allSettled(
      (config.wallets.solana ?? []).map(wallet =>
        fetchRentReclaimable(wallet, config.heliusKey, solPriceUSD)
      )
    )
    const rentSummary = rentResults
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value)
      .reduce(
        (acc, r) => ({
          accountCount: acc.accountCount + r.accountCount,
          estimatedUSD: acc.estimatedUSD + r.estimatedUSD,
          accountPubkeys: [...acc.accountPubkeys, ...(r.accountPubkeys ?? [])],
        }),
        { accountCount: 0, estimatedUSD: 0, accountPubkeys: [] }
      )
    renderSolanaRent(rentSummary)

    renderStatusBar({ alchemy: 'live', helius: 'live', coingecko: 'live', lifi: 'pending' })
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
  let currentGasMap = {}

  function applyThreshold(threshold, balances, prices, gasMap) {
    if (balances !== undefined) state = { balances, prices }
    if (gasMap !== undefined) currentGasMap = gasMap
    const dustTokens = computeDust(state.balances, state.prices, threshold, currentGasMap)
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
