// Maps DustKit token symbols to CoinGecko API IDs.
// When real wallets return new tokens, add their symbol→id mapping here.
const COINGECKO_IDS = {
  PEPE:  'pepe',
  GMX:   'gmx',
  USDC:  'usd-coin',
  USDT:  'tether',
  DEGEN: 'degen-base',
  MATIC: 'matic-network',
  POL:   'matic-network',
  OP:    'optimism',
  BONK:  'bonk',
  ETH:   'ethereum',
  WETH:  'weth',
  ARB:   'arbitrum',
  SOL:   'solana',
  WSOL:  'wrapped-solana',
  LINK:  'chainlink',
  UNI:   'uniswap',
  AAVE:  'aave',
  CRV:   'curve-dao-token',
  LDO:   'lido-dao',
  RENT:  null, // synthetic — fixed rate, not on CoinGecko
}

const RENT_PRICE_USD = 0.30 // per dead Solana token account (~0.002 SOL rent)

let priceCache = null
let priceCacheTime = 0
const CACHE_TTL = 60000 // 60 seconds

// Solana mint addresses are base58, 32-44 characters
function isSolanaMint(s) {
  return typeof s === 'string' && s.length >= 32 && s.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(s)
}

async function fetchJupiterPrices(mintAddresses) {
  if (!mintAddresses.length) return {}
  try {
    const res = await fetch(
      `https://price.jup.ag/v4/price?ids=${mintAddresses.join(',')}`
    )
    if (!res.ok) return {}
    const data = await res.json()
    const prices = {}
    for (const [mint, info] of Object.entries(data.data ?? {})) {
      prices[mint] = info.price ?? 0
    }
    return prices
  } catch {
    return {}
  }
}

// PriceMap: { [tokenSymbol: string]: number }
export async function fetchPrices(symbols) {
  const now = Date.now()
  if (priceCache && now - priceCacheTime < CACHE_TTL) return priceCache

  const solanaMints = symbols.filter(isSolanaMint)
  const cgSymbols = symbols.filter(s => !isSolanaMint(s))

  // Build CoinGecko ID list
  const cgIds = cgSymbols
    .map(s => COINGECKO_IDS[s.toUpperCase()])
    .filter(Boolean)
  const uniqueIds = [...new Set(cgIds)]

  // Fetch CoinGecko and Jupiter in parallel
  const [cgData, jupiterPrices] = await Promise.all([
    uniqueIds.length
      ? fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${uniqueIds.join(',')}&vs_currencies=usd`)
          .then(res => {
            if (!res.ok) {
              console.warn(`[prices] CoinGecko HTTP ${res.status} — ${priceCache ? 'using stale cache' : 'returning empty prices'}`)
              return priceCache ? null : {}
            }
            return res.json()
          })
          .catch(() => priceCache ?? {})
      : Promise.resolve({}),
    fetchJupiterPrices(solanaMints),
  ])

  if (cgData === null) return priceCache ?? {}

  const prices = {}

  for (const symbol of cgSymbols) {
    const upper = symbol.toUpperCase()
    const cgId = COINGECKO_IDS[upper]
    if (upper === 'RENT') {
      prices[symbol] = RENT_PRICE_USD
    } else if (cgId && cgData[cgId]?.usd) {
      prices[symbol] = cgData[cgId].usd
    } else {
      prices[symbol] = 0
    }
  }

  for (const mint of solanaMints) {
    prices[mint] = jupiterPrices[mint] ?? 0
  }

  priceCache = prices
  priceCacheTime = now
  return prices
}
