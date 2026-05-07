// Copy this file to config.js and fill in your real addresses.
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
  dustThreshold: 5.00,       // USD — tokens below this are shown as dust
  masterWallet: '0xYOUR_MASTER_WALLET'  // sweep destination address
}
