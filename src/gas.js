const GAS_LIMIT = 150000 // typical Li.Fi swap gas units

const CHAIN_IDS = {
  eth:      1,
  arbitrum: 42161,
  base:     8453,
  polygon:  137,
  optimism: 10,
}

async function fetchWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(id)
  }
}

const CHAIN_NATIVE = {
  eth:      'eth',
  arbitrum: 'eth',
  base:     'eth',
  polygon:  'matic',
  optimism: 'eth',
}

async function fetchNativePrices() {
  try {
    const res = await fetchWithTimeout(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,matic-network&vs_currencies=usd'
    )
    const data = await res.json()
    return {
      eth:  typeof data?.ethereum?.usd === 'number' ? data.ethereum.usd : null,
      matic: typeof data?.['matic-network']?.usd === 'number' ? data['matic-network'].usd : null,
    }
  } catch {
    return { eth: null, matic: null }
  }
}

async function fetchChainGas(chain, chainId, apiKey, nativePrices) {
  const url = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=gastracker&action=gasoracle&apikey=${apiKey}`
  try {
    const res = await fetchWithTimeout(url)
    const data = await res.json()
    if (data.status !== '1') return null

    const gasPrice = data.result?.ProposeGasPrice
    if (!gasPrice) return null
    const gwei = parseFloat(gasPrice)
    if (!isFinite(gwei)) return null

    const native = CHAIN_NATIVE[chain]
    const nativePriceUSD = nativePrices[native]
    if (nativePriceUSD === null) return null

    const usdCost = (gwei * GAS_LIMIT / 1e9) * nativePriceUSD
    return { gwei, usdCost }
  } catch (err) {
    console.warn(`[gas] ${chain} fetch failed:`, err.message)
    return null
  }
}

// GasMap: { [chain: string]: { gwei: number, usdCost: number } | null }
// null means fetch failed — computeDust treats null gas as "cost unknown"
export async function fetchGasCosts(config) {
  const apiKey = config.etherscanKey
  const nativePrices = await fetchNativePrices()

  if (nativePrices.eth === null && nativePrices.matic === null) {
    console.warn('[gas] Native price fetch failed — gas costs unavailable')
    const gasMap = { solana: { gwei: 0, usdCost: 0.001 } }
    for (const chain of Object.keys(CHAIN_IDS)) gasMap[chain] = null
    return gasMap
  }

  const results = await Promise.allSettled(
    Object.entries(CHAIN_IDS).map(async ([chain, chainId]) => {
      const gas = await fetchChainGas(chain, chainId, apiKey, nativePrices)
      return [chain, gas]
    })
  )

  const gasMap = { solana: { gwei: 0, usdCost: 0.001 } }
  for (const result of results) {
    if (result.status === 'fulfilled') {
      const [chain, gas] = result.value
      gasMap[chain] = gas
    }
  }
  return gasMap
}
