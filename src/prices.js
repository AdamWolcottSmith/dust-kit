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

// PriceMap: { [tokenSymbol: string]: number }
export async function fetchPrices(symbols) {
  const now = Date.now()
  if (priceCache && now - priceCacheTime < CACHE_TTL) return priceCache

  const cgIds = symbols
    .map(s => COINGECKO_IDS[s.toUpperCase()])
    .filter(Boolean)
  const uniqueIds = [...new Set(cgIds)]

  if (!uniqueIds.length) {
    return Object.fromEntries(symbols.map(s => [s, s === 'RENT' ? RENT_PRICE_USD : 0]))
  }

  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${uniqueIds.join(',')}&vs_currencies=usd`
  )
  if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`)
  const data = await res.json()

  const prices = {}
  for (const symbol of symbols) {
    const upper = symbol.toUpperCase()
    const cgId = COINGECKO_IDS[upper]
    if (upper === 'RENT') {
      prices[symbol] = RENT_PRICE_USD
    } else if (cgId && data[cgId]?.usd) {
      prices[symbol] = data[cgId].usd
    } else {
      prices[symbol] = 0
    }
  }

  priceCache = prices
  priceCacheTime = now
  return prices
}
