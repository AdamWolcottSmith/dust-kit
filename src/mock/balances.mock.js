// Mirrors the shape returned by:
//   Alchemy: alchemy_getTokenBalances (EVM chains)
//   Helius: getTokenAccountsByOwner (Solana)
// TODO (real): replace MOCK_BALANCES with live API responses in balances.js
export const MOCK_BALANCES = [
  {
    chain: 'eth',
    tokenSymbol: 'PEPE',
    contractAddress: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
    rawBalance: '4201337000000000000000000',
    decimals: 18,
    walletAddress: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9'
  },
  {
    chain: 'arbitrum',
    tokenSymbol: 'GMX',
    contractAddress: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
    rawBalance: '2100000000000000',
    decimals: 18,
    walletAddress: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9'
  },
  {
    chain: 'arbitrum',
    tokenSymbol: 'USDC',
    contractAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    rawBalance: '2550000',
    decimals: 6,
    walletAddress: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9'
  },
  {
    chain: 'base',
    tokenSymbol: 'DEGEN',
    contractAddress: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
    rawBalance: '892400000000000000000',
    decimals: 18,
    walletAddress: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9'
  },
  {
    chain: 'polygon',
    tokenSymbol: 'MATIC',
    contractAddress: '0x0000000000000000000000000000000000001010',
    rawBalance: '1200000000000000000',
    decimals: 18,
    walletAddress: '0x9Dd134d14D1e65F84B706d6F205Cd5B1Cd03a46'
  },
  {
    chain: 'optimism',
    tokenSymbol: 'OP',
    contractAddress: '0x4200000000000000000000000000000000000042',
    rawBalance: '800000000000000000',
    decimals: 18,
    walletAddress: '0x9Dd134d14D1e65F84B706d6F205Cd5B1Cd03a46'
  },
  {
    chain: 'solana',
    tokenSymbol: 'BONK',
    contractAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    rawBalance: '120000000000',
    decimals: 5,
    walletAddress: '7xKpNNMaWmKP3Bp9RMeGTBTBrCGLnmMRHuPNqMeGmNq3'
  },
  {
    chain: 'solana',
    tokenSymbol: 'RENT',
    contractAddress: null,
    rawBalance: '68',
    decimals: 0,
    walletAddress: '7xKpNNMaWmKP3Bp9RMeGTBTBrCGLnmMRHuPNqMeGmNq3',
    isRentAccounts: true
  }
]
