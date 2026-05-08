const GAS_LIMIT = 150000 // typical Li.Fi swap gas units

const CHAIN_IDS = {
  eth:      1,
  arbitrum: 42161,
  base:     8453,
  polygon:  137,
  optimism: 10,
}

async function fetchEthPrice() {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
  )
  const data = await res.json()
  return data.ethereum.usd
}

async function fetchChainGas(chain, chainId, apiKey, ethPriceUSD) {
  const url = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=gastracker&action=gasoracle&apikey=${apiKey}`
  const res = await fetch(url)
  const data = await res.json()
  if (data.status !== '1') return null

  const gwei = parseFloat(data.result.ProposeGasPrice)
  const usdCost = (gwei * GAS_LIMIT / 1e9) * ethPriceUSD
  return { gwei, usdCost }
}

// GasMap: { [chain: string]: { gwei: number, usdCost: number } | null }
// null means fetch failed — treat as unknown gas cost in computeDust
export async function fetchGasCosts(config) {
  const apiKey = config.etherscanKey
  const ethPriceUSD = await fetchEthPrice()

  const results = await Promise.allSettled(
    Object.entries(CHAIN_IDS).map(async ([chain, chainId]) => {
      const gas = await fetchChainGas(chain, chainId, apiKey, ethPriceUSD)
      return [chain, gas]
    })
  )

  const gasMap = { solana: { gwei: 0, usdCost: 0.001 } } // Solana fee is flat ~$0.001
  for (const result of results) {
    if (result.status === 'fulfilled') {
      const [chain, gas] = result.value
      gasMap[chain] = gas
    }
  }
  return gasMap
}
