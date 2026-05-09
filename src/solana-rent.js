const LAMPORTS_PER_SOL = 1_000_000_000

// Finds all zero-balance Solana token accounts for a wallet.
// Each dead account locks ~0.002 SOL in rent that can be reclaimed by closing it.
// Phase 3: execute closing via Phantom wallet signing.
// Returns: { accountCount, lamports, estimatedSOL, estimatedUSD, accountPubkeys }
export async function fetchRentReclaimable(walletAddress, heliusKey, solPriceUSD) {
  const res = await fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1,
      method: 'getTokenAccountsByOwner',
      params: [
        walletAddress,
        { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
        { encoding: 'jsonParsed' }
      ]
    })
  })
  const data = await res.json()
  if (data.error) throw new Error(`Helius rent: ${data.error.message}`)

  const deadAccounts = (data.result?.value ?? []).filter(account => {
    const parsed = account.account?.data?.parsed
    if (!parsed?.info) return false
    const amount = parsed.info.tokenAmount
    return amount && (amount.uiAmount === 0 || amount.uiAmount === null)
  })

  const lamports = deadAccounts.reduce(
    (sum, a) => sum + (a.account.lamports ?? 0), 0
  )
  const estimatedSOL = lamports / LAMPORTS_PER_SOL
  const estimatedUSD = estimatedSOL * (solPriceUSD ?? 0)

  return {
    accountCount: deadAccounts.length,
    lamports,
    estimatedSOL,
    estimatedUSD,
    accountPubkeys: deadAccounts.map(a => a.pubkey),
  }
}
