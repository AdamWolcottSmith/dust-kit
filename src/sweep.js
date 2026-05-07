// PHASE 3 STUB — not imported or called in Phase 1
// TODO (Phase 3): integrate Li.Fi SDK for cross-chain swap routing
//   import { getRoutes, executeRoute } from '@lifi/sdk'
//   No API key required for Li.Fi
//   getRoutes({ fromChain, toChain, fromToken, toToken, fromAmount })
//   executeRoute opens MetaMask/Phantom for user signing — keys never leave the wallet
//
// Route: Li.Fi route object
// SweepResult: { chain, token, txHash, netUSD }
export async function buildSweepRoutes(dustTokens) {
  throw new Error('buildSweepRoutes is a Phase 3 feature — not implemented yet')
}

export async function executeSweep(routes) {
  throw new Error('executeSweep is a Phase 3 feature — not implemented yet')
}
