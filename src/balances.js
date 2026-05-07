import { MOCK_BALANCES } from './mock/balances.mock.js'

// TODO (real): replace this function body with:
//   EVM — Alchemy SDK alchemy_getTokenBalances per chain:
//     chains: eth-mainnet, arb-mainnet, base-mainnet, opt-mainnet, polygon-mainnet
//     for each wallet in wallets.evm
//   Solana — Helius getTokenAccountsByOwner:
//     for each wallet in wallets.solana
//   Merge all results into the same TokenBalance shape below.
//
// TokenBalance: {
//   chain: string,           // 'eth' | 'arbitrum' | 'base' | 'polygon' | 'optimism' | 'solana'
//   tokenSymbol: string,
//   contractAddress: string | null,
//   rawBalance: string,      // raw integer as string (avoid float precision loss)
//   decimals: number,
//   walletAddress: string,
//   isRentAccounts?: boolean // Solana only: true = dead token accounts with locked rent
// }
export async function fetchBalances(wallets) {
  return MOCK_BALANCES
}
