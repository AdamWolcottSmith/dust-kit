const ALCHEMY_NETWORKS = {
  eth:      'eth-mainnet',
  arbitrum: 'arb-mainnet',
  base:     'base-mainnet',
  polygon:  'polygon-mainnet',
  optimism: 'opt-mainnet',
}

const ZERO_BALANCE = '0x0000000000000000000000000000000000000000000000000000000000000000'

async function alchemyRpc(network, apiKey, method, params) {
  const res = await fetch(`https://${network}.g.alchemy.com/v2/${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
  })
  const data = await res.json()
  if (data.error) throw new Error(`Alchemy ${method}: ${data.error.message}`)
  return data.result
}

async function fetchEvmBalancesForWallet(walletAddress, chain, apiKey) {
  const network = ALCHEMY_NETWORKS[chain]
  const result = await alchemyRpc(network, apiKey, 'alchemy_getTokenBalances', [
    walletAddress, 'erc20'
  ])

  const nonZero = (result.tokenBalances ?? []).filter(
    t => t.tokenBalance !== ZERO_BALANCE && t.tokenBalance !== '0x0'
  )
  if (!nonZero.length) return []

  const metadataResults = await Promise.allSettled(
    nonZero.map(t =>
      alchemyRpc(network, apiKey, 'alchemy_getTokenMetadata', [t.contractAddress])
    )
  )

  return nonZero
    .map((t, i) => {
      const meta = metadataResults[i]
      if (meta.status !== 'fulfilled') return null
      const { symbol, decimals } = meta.value
      if (!symbol || decimals === null || decimals === undefined) return null
      if (t.tokenBalance === null || t.tokenBalance === undefined) return null
      const rawBalance = BigInt(t.tokenBalance).toString()
      return {
        chain,
        tokenSymbol: symbol.toUpperCase(),
        contractAddress: t.contractAddress,
        rawBalance,
        decimals,
        walletAddress,
      }
    })
    .filter(Boolean)
}

async function fetchSolanaBalances(walletAddress, heliusKey) {
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
  if (data.error) throw new Error(`Helius: ${data.error.message}`)

  return (data.result?.value ?? [])
    .map(account => {
      const parsed = account.account?.data?.parsed
      if (!parsed?.info) return null
      const info = parsed.info
      const amount = info.tokenAmount
      if (!amount || amount.uiAmount === 0 || amount.uiAmount === null) return null
      return {
        chain: 'solana',
        tokenSymbol: info.mint.slice(0, 6).toUpperCase(),
        contractAddress: info.mint,
        rawBalance: amount.amount,
        decimals: amount.decimals,
        walletAddress,
      }
    })
    .filter(Boolean)
}

// TokenBalance: { chain, tokenSymbol, contractAddress, rawBalance, decimals, walletAddress, isRentAccounts? }
export async function fetchBalances(wallets) {
  const config = window.DUSTKIT_CONFIG

  const evmJobs = (wallets.evm ?? []).flatMap(wallet =>
    Object.keys(ALCHEMY_NETWORKS).map(chain =>
      fetchEvmBalancesForWallet(wallet, chain, config.alchemyKey)
        .catch(err => { console.warn(`EVM ${chain} ${wallet.slice(0,8)}:`, err.message); return [] })
    )
  )

  const solJobs = (wallets.solana ?? []).map(wallet =>
    fetchSolanaBalances(wallet, config.heliusKey)
      .catch(err => { console.warn(`Solana ${wallet.slice(0,8)}:`, err.message); return [] })
  )

  const results = await Promise.all([...evmJobs, ...solJobs])
  return results.flat()
}
