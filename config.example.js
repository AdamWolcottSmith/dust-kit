// Copy this file to config.js and fill in your real addresses and keys.
// config.js is gitignored — never commit real addresses or keys.
window.DUSTKIT_CONFIG = {
  wallets: {
    evm: [
      '0xYOUR_EVM_WALLET_1',
      '0xYOUR_EVM_WALLET_2'
    ],
    solana: [
      'YOUR_SOLANA_WALLET_ADDRESS'
    ]
  },
  dustThreshold: 5.00,
  masterWallet: '0xYOUR_MASTER_WALLET',

  // Phase 2: Live API keys — never commit config.js
  alchemyKey:   'YOUR_ALCHEMY_KEY',   // alchemy.com — one key for all EVM chains
  heliusKey:    'YOUR_HELIUS_KEY',    // helius.dev — Solana balances + rent reclaim
  etherscanKey: 'YOUR_ETHERSCAN_KEY', // etherscan.io/apis V2 — one key for all EVM gas trackers
}
