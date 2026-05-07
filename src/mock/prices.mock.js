// Mirrors the shape returned by CoinGecko /simple/price
// TODO (real): replace with live CoinGecko call in prices.js
//   GET https://api.coingecko.com/api/v3/simple/price
//     ?ids=pepe,gmx,usd-coin,degen-base,matic-network,optimism,bonk
//     &vs_currencies=usd
//   Cache responses for 60s — free tier limit is 30 calls/min
export const MOCK_PRICES = {
  PEPE:  0.000001,
  GMX:   1514.28,
  USDC:  1.00,
  DEGEN: 0.002,
  MATIC: 0.45,
  OP:    1.82,
  BONK:  0.0000108,
  RENT:  0.30    // per dead Solana token account, fixed SOL rent rate
}
