import { MOCK_PRICES } from './mock/prices.mock.js'

// TODO (real): replace this function body with a live CoinGecko call:
//   const ids = symbols.map(s => COINGECKO_IDS[s]).filter(Boolean).join(',')
//   const res = await fetch(
//     `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
//   )
//   const data = await res.json()
//   return Object.fromEntries(symbols.map(s => [s, data[COINGECKO_IDS[s]]?.usd ?? 0]))
//
//   Cache the result for 60s:
//   let cache = null, cacheTime = 0
//   if (Date.now() - cacheTime < 60000) return cache
//
// PriceMap: { [tokenSymbol: string]: number }
export async function fetchPrices(symbols) {
  return MOCK_PRICES
}
