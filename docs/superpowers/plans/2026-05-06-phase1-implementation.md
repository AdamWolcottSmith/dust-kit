# DustKit Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully working Phase 1 DustKit — mock token balances across 6 chains, USD values computed, dust filtered by threshold slider, rendered in the Win98/Geocities UI shell.

**Architecture:** ES modules loaded from `src/` via a single `<script type="module">` in `index.html`. Mock data lives in `src/mock/` mirroring real API response shapes. `app.js` orchestrates all modules; `ui.js` owns all DOM writes.

**Tech Stack:** Vanilla JS (ES modules), 98.css (CDN), no build step, no node_modules. Requires a local dev server (`python3 -m http.server 8080`) due to ES module CORS restrictions on `file://`.

> **Note on testing:** This is a local vanilla JS frontend with no test framework. Verification steps are browser-based — open the app, check what you see. Each task includes exact verification criteria.

---

### Task 1: Git init + project scaffold + .gitignore

**Files:**
- Create: `.gitignore`
- Create: `src/` directory
- Create: `src/mock/` directory

- [ ] **Step 1: Initialize git repo**

```bash
cd /Users/adamsmith/Projects/dust-kit
git init
```

Expected output: `Initialized empty Git repository in /Users/adamsmith/Projects/dust-kit/.git/`

- [ ] **Step 2: Create .gitignore**

Create `.gitignore`:
```
config.js
.env
node_modules/
.DS_Store
```

- [ ] **Step 3: Create src directories**

```bash
mkdir -p src/mock
```

- [ ] **Step 4: Commit scaffold**

```bash
git add .gitignore CLAUDE.md dustkit-design-mockup.html docs/
git commit -m "chore: init repo, add .gitignore and design docs"
```

---

### Task 2: config.js + config.example.js

**Files:**
- Create: `config.js` (gitignored)
- Create: `config.example.js` (committed)

- [ ] **Step 1: Create config.js**

Create `config.js`:
```javascript
window.DUSTKIT_CONFIG = {
  wallets: {
    evm: [
      '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9',
      '0x9Dd134d14D1e65F84B706d6F205Cd5B1Cd03a46'
    ],
    solana: [
      '7xKpNNMaWmKP3Bp9RMeGTBTBrCGLnmMRHuPNqMeGmNq3'
    ]
  },
  dustThreshold: 5.00,
  masterWallet: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9'
}
```

- [ ] **Step 2: Create config.example.js**

Create `config.example.js`:
```javascript
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
```

- [ ] **Step 3: Commit config example**

```bash
git add config.example.js
git commit -m "chore: add config.example.js template"
```

---

### Task 3: Mock data files

**Files:**
- Create: `src/mock/balances.mock.js`
- Create: `src/mock/prices.mock.js`

- [ ] **Step 1: Create balances.mock.js**

Create `src/mock/balances.mock.js`:
```javascript
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
```

- [ ] **Step 2: Create prices.mock.js**

Create `src/mock/prices.mock.js`:
```javascript
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
```

- [ ] **Step 3: Commit mock data**

```bash
git add src/mock/
git commit -m "feat: add mock balance and price data mirroring Alchemy/Helius/CoinGecko shapes"
```

---

### Task 4: balances.js

**Files:**
- Create: `src/balances.js`

- [ ] **Step 1: Create balances.js**

Create `src/balances.js`:
```javascript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/balances.js
git commit -m "feat: add balances.js with mock data (Alchemy/Helius stub)"
```

---

### Task 5: prices.js

**Files:**
- Create: `src/prices.js`

- [ ] **Step 1: Create prices.js**

Create `src/prices.js`:
```javascript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/prices.js
git commit -m "feat: add prices.js with mock data (CoinGecko stub)"
```

---

### Task 6: Phase 2/3 stubs (gas.js + sweep.js)

**Files:**
- Create: `src/gas.js`
- Create: `src/sweep.js`

- [ ] **Step 1: Create gas.js**

Create `src/gas.js`:
```javascript
// PHASE 2 STUB — not imported or called in Phase 1
// TODO (Phase 2): fetch live gas costs from Etherscan Gas Tracker per chain
//   GET https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=KEY
//   Repeat for each chain's block explorer (Arbiscan, Basescan, Polygonscan, Optimistic Etherscan)
//   Estimate USD cost = gasLimit * gasPrice * ETH/USD price
//   Typical swap gas limits: EVM ~150k units, Solana ~$0.001 flat
//
// GasMap: { [chain: string]: { gwei: number, usdCost: number } }
export async function fetchGasCosts(chains) {
  throw new Error('fetchGasCosts is a Phase 2 feature — not implemented yet')
}
```

- [ ] **Step 2: Create sweep.js**

Create `src/sweep.js`:
```javascript
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
```

- [ ] **Step 3: Commit**

```bash
git add src/gas.js src/sweep.js
git commit -m "feat: add Phase 2/3 stubs for gas.js and sweep.js"
```

---

### Task 7: ledger.js

**Files:**
- Create: `src/ledger.js`

- [ ] **Step 1: Create ledger.js**

Create `src/ledger.js`:
```javascript
const LEDGER_KEY = 'dustkit_ledger'

// SweepEntry: { date: string, chain: string, token: string, netUSD: number, txHash: string }

export function getLedger() {
  try {
    return JSON.parse(localStorage.getItem(LEDGER_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function appendLedger(entry) {
  const ledger = getLedger()
  ledger.push(entry)
  localStorage.setItem(LEDGER_KEY, JSON.stringify(ledger))
}
```

- [ ] **Step 2: Commit**

```bash
git add src/ledger.js
git commit -m "feat: add ledger.js for localStorage sweep history"
```

---

### Task 8: index.html — Win98/Geocities shell

**Files:**
- Modify: `index.html` (create from scratch — this is the main UI shell)

The HTML must:
- Load `config.js` as a plain script (populates `window.DUSTKIT_CONFIG`)
- Load `src/app.js` as `type="module"`
- Include all panels from the design mockup
- Hide `#gas-panel` and `#sweep-section` via inline `style="display:none"`
- Use `id` attributes on all elements that `ui.js` will write to

- [ ] **Step 1: Create index.html**

Create `index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DustKit v1.0 - Dust Sweeper for Windows</title>
<link rel="stylesheet" href="https://unpkg.com/98.css">
<style>
  body {
    margin: 0;
    padding: 8px;
    font-family: "MS Sans Serif", Arial, sans-serif;
    font-size: 11px;
    background-color: #000010;
    background-image:
      radial-gradient(1px 1px at 10% 15%, #fff 0%, transparent 100%),
      radial-gradient(1px 1px at 25% 40%, #aaf 0%, transparent 100%),
      radial-gradient(1px 1px at 40% 8%,  #fff 0%, transparent 100%),
      radial-gradient(1px 1px at 55% 60%, #fff 0%, transparent 100%),
      radial-gradient(1px 1px at 70% 25%, #ffa 0%, transparent 100%),
      radial-gradient(1px 1px at 85% 75%, #fff 0%, transparent 100%),
      radial-gradient(1px 1px at 15% 80%, #aff 0%, transparent 100%),
      radial-gradient(1px 1px at 60% 90%, #fff 0%, transparent 100%),
      radial-gradient(1px 1px at 90% 10%, #fff 0%, transparent 100%),
      radial-gradient(1px 1px at 33% 55%, #faf 0%, transparent 100%),
      radial-gradient(1px 1px at 78% 45%, #fff 0%, transparent 100%),
      radial-gradient(2px 2px at 5%  30%, #fff 0%, transparent 100%),
      radial-gradient(2px 2px at 95% 65%, #aaf 0%, transparent 100%),
      radial-gradient(1px 1px at 48% 72%, #fff 0%, transparent 100%),
      radial-gradient(1px 1px at 22% 22%, #ffa 0%, transparent 100%);
    min-height: 100vh;
    cursor: default;
  }

  .geo-header { text-align: center; padding: 4px 0 8px 0; }

  .flaming-logo {
    font-family: "Times New Roman", Times, serif;
    font-size: clamp(24px, 5vw, 48px);
    font-weight: bold;
    font-style: italic;
    color: #00ff41;
    text-shadow: 0 0 10px #00ff41, 0 0 20px #00aa22, 2px 2px 0 #003300, 4px 4px 0 #001100;
    letter-spacing: -1px;
    display: inline-block;
    animation: logoPulse 3s ease-in-out infinite;
  }

  @keyframes logoPulse {
    0%,100% { text-shadow: 0 0 10px #00ff41, 0 0 20px #00aa22, 2px 2px 0 #003300, 4px 4px 0 #001100; }
    50%      { text-shadow: 0 0 20px #00ff88, 0 0 40px #00ff41, 2px 2px 0 #003300, 4px 4px 0 #001100; }
  }

  .logo-sub {
    font-family: "Courier New", Courier, monospace;
    color: #00ff41;
    font-size: clamp(9px, 1.5vw, 13px);
    letter-spacing: 4px;
    text-transform: uppercase;
    display: block;
    margin-top: -4px;
  }

  .geo-divider {
    color: #00ff41;
    font-size: clamp(10px, 1.5vw, 13px);
    text-align: center;
    letter-spacing: 2px;
    margin: 2px 0;
    font-family: "Courier New", Courier, monospace;
    overflow: hidden;
    white-space: nowrap;
  }

  .visitor-badge {
    font-family: "Courier New", Courier, monospace;
    font-size: 9px;
    color: #ffff00;
    text-align: center;
    margin: 2px 0;
  }

  .ticker-wrapper {
    background: #000;
    border: 2px solid;
    border-color: #808080 #ffffff #ffffff #808080;
    margin: 4px 0;
    padding: 2px 0;
  }
  marquee { font-family: "Courier New", Courier, monospace; font-size: clamp(10px, 1.5vw, 12px); color: #00ff41; }
  .tick-sep  { color: #ffff00; margin: 0 8px; }
  .tick-warn { color: #ff4400; }
  .tick-good { color: #00ff88; }

  .main-window {
    max-width: 860px;
    margin: 0 auto;
    background: #c0c0c0;
    box-shadow: inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf;
  }

  .window-title-bar {
    background: linear-gradient(90deg, #000080, #1084d0);
    color: white;
    font-weight: bold;
    font-size: clamp(10px, 1.8vw, 12px);
    padding: 3px 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: "MS Sans Serif", Arial, sans-serif;
  }
  .title-left { display: flex; align-items: center; gap: 4px; }
  .title-icon { font-size: 14px; }
  .title-buttons { display: flex; gap: 2px; }
  .title-btn {
    width: 16px; height: 14px;
    background: #c0c0c0;
    border: 1px solid;
    border-color: #ffffff #0a0a0a #0a0a0a #ffffff;
    font-size: 9px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #000;
    font-family: "MS Sans Serif", Arial, sans-serif;
    font-weight: bold;
    box-shadow: inset -1px -1px #808080, inset 1px 1px #dfdfdf;
  }

  .menu-bar {
    background: #c0c0c0;
    padding: 2px 4px;
    display: flex;
    gap: 0;
    border-bottom: 1px solid #808080;
    flex-wrap: wrap;
  }
  .menu-item { padding: 2px 8px; font-size: clamp(10px, 1.5vw, 11px); cursor: pointer; font-family: "MS Sans Serif", Arial, sans-serif; }
  .menu-item:hover { background: #000080; color: white; }
  .menu-item u { text-decoration: underline; }

  .toolbar {
    background: #c0c0c0;
    padding: 2px 4px;
    display: flex;
    align-items: center;
    gap: 2px;
    border-bottom: 1px solid #808080;
    flex-wrap: wrap;
  }
  .tb-btn {
    padding: 2px 6px;
    background: #c0c0c0;
    border: 1px solid;
    border-color: #ffffff #0a0a0a #0a0a0a #ffffff;
    font-size: clamp(9px, 1.4vw, 11px);
    cursor: pointer;
    font-family: "MS Sans Serif", Arial, sans-serif;
    box-shadow: inset -1px -1px #808080, inset 1px 1px #dfdfdf;
    white-space: nowrap;
  }
  .tb-btn:active {
    border-color: #0a0a0a #ffffff #ffffff #0a0a0a;
    box-shadow: inset 1px 1px #808080;
    padding: 3px 5px 1px 7px;
  }
  .tb-separator { width: 1px; height: 22px; background: #808080; margin: 0 3px; border-right: 1px solid #fff; }
  .tb-label { font-size: 9px; color: #444; font-family: "MS Sans Serif", Arial, sans-serif; }

  .content-area { padding: 4px; background: #c0c0c0; }

  .panel {
    background: #c0c0c0;
    border: 2px solid;
    border-color: #808080 #ffffff #ffffff #808080;
    box-shadow: inset -1px -1px #ffffff, inset 1px 1px #0a0a0a;
    margin-bottom: 4px;
  }
  .panel-title {
    background: #000080;
    color: #fff;
    font-size: clamp(9px, 1.4vw, 11px);
    font-weight: bold;
    padding: 1px 4px;
    font-family: "MS Sans Serif", Arial, sans-serif;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .panel-content { padding: 4px; }

  .balance-table {
    width: 100%;
    border-collapse: collapse;
    font-family: "Courier New", Courier, monospace;
    font-size: clamp(9px, 1.4vw, 11px);
  }
  .balance-table th {
    background: #000080;
    color: white;
    padding: 2px 4px;
    text-align: left;
    font-family: "MS Sans Serif", Arial, sans-serif;
    font-size: clamp(9px, 1.3vw, 10px);
    white-space: nowrap;
    border-right: 1px solid #808080;
  }
  .balance-table td {
    padding: 2px 4px;
    border-bottom: 1px solid #808080;
    border-right: 1px solid #808080;
    background: #ffffff;
    white-space: nowrap;
  }
  .balance-table tr:nth-child(even) td { background: #f0f0f0; }
  .balance-table tr:hover td { background: #000080; color: #fff; }
  .balance-table tfoot td { background: #c0c0c0; font-weight: bold; }

  .net-positive { color: #006600; font-weight: bold; }
  .net-negative { color: #cc0000; }

  .chain-badge {
    font-size: 9px;
    padding: 1px 3px;
    background: #c0c0c0;
    border: 1px solid #808080;
    font-family: "MS Sans Serif", Arial, sans-serif;
  }

  .two-col { display: flex; gap: 4px; flex-wrap: wrap; }
  .two-col > * { flex: 1; min-width: 200px; }

  .ledger-inner {
    background: #000;
    font-family: "Courier New", Courier, monospace;
    font-size: clamp(9px, 1.3vw, 11px);
    color: #00ff41;
    padding: 4px;
    height: 120px;
    overflow-y: auto;
    border: 2px solid;
    border-color: #0a0a0a #808080 #808080 #0a0a0a;
  }
  .ledger-line { margin: 1px 0; }
  .ledger-prompt { color: #ffff00; }
  .ledger-ok { color: #aaffaa; }
  .ledger-total { color: #00ffff; font-weight: bold; border-top: 1px solid #00ff41; margin-top: 4px; padding-top: 2px; }
  .ledger-empty { color: #555; font-style: italic; }

  /* Phase 2/3 panels — hidden until those phases are implemented */
  #gas-panel    { display: none; }
  #sweep-section { display: none; }

  .sweep-section {
    text-align: center;
    padding: 6px 4px;
    background: #c0c0c0;
    border-top: 2px solid;
    border-color: #808080 #ffffff #ffffff #808080;
  }
  .sweep-btn {
    padding: 6px 24px;
    font-size: clamp(12px, 2vw, 16px);
    font-weight: bold;
    font-family: "MS Sans Serif", Arial, sans-serif;
    background: #c0c0c0;
    border: 2px solid;
    border-color: #ffffff #0a0a0a #0a0a0a #ffffff;
    box-shadow: inset -1px -1px #808080, inset 1px 1px #dfdfdf, 3px 3px 0 #000;
    cursor: pointer;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #000080;
    text-shadow: 1px 1px 0 #fff;
  }

  .status-bar {
    display: flex;
    border-top: 2px solid;
    border-color: #808080 #ffffff #ffffff #808080;
    background: #c0c0c0;
    padding: 1px 2px;
    gap: 2px;
    flex-wrap: wrap;
  }
  .status-cell {
    flex: 1;
    min-width: 80px;
    font-family: "MS Sans Serif", Arial, sans-serif;
    font-size: clamp(8px, 1.2vw, 10px);
    padding: 1px 4px;
    border: 1px solid;
    border-color: #808080 #ffffff #ffffff #808080;
    box-shadow: inset -1px 0 #0a0a0a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .status-dot {
    display: inline-block;
    width: 6px; height: 6px;
    border-radius: 50%;
    margin-right: 3px;
    vertical-align: middle;
  }
  .dot-green   { background: #00cc00; }
  .dot-yellow  { background: #ffcc00; }
  .dot-grey    { background: #888888; }

  .geo-footer { text-align: center; padding: 8px 0 4px 0; font-family: "Courier New", Courier, monospace; }
  .geo-footer a { color: #00ffff; font-size: 9px; text-decoration: none; margin: 0 4px; }
  .geo-footer a:hover { color: #ffff00; }

  .construction-gif { font-size: 18px; animation: spin 2s linear infinite; display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .blinkme { animation: blink 1s step-end infinite; color: #ffff00; font-size: 9px; font-family: "Courier New", Courier, monospace; }
  @keyframes blink { 50% { opacity: 0; } }

  .sunken {
    border: 2px solid;
    border-color: #808080 #ffffff #ffffff #808080;
    box-shadow: inset 1px 1px #0a0a0a;
    background: #fff;
    padding: 2px 4px;
    font-family: "Courier New", Courier, monospace;
    font-size: 11px;
    width: 100%;
    box-sizing: border-box;
  }

  .threshold-val { font-family: "Courier New", Courier, monospace; font-size: 12px; color: #000080; font-weight: bold; min-width: 40px; }

  @media (max-width: 600px) {
    body { padding: 0; }
    .main-window { border-left: none; border-right: none; }
    .balance-table th:nth-child(5),
    .balance-table td:nth-child(5) { display: none; }
    .toolbar .tb-label { display: none; }
    .two-col { flex-direction: column; }
  }
</style>
</head>
<body>

<!-- GEOCITIES HEADER -->
<div class="geo-header">
  <div class="flaming-logo">&#x1F9F9; DustKit</div>
  <span class="logo-sub">v1.0 &mdash; Cross-Chain Dust Sweeper</span>
</div>

<div class="geo-divider">&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;</div>

<!-- LIVE TICKER — written by ui.js renderTicker() -->
<div class="ticker-wrapper">
  <marquee id="ticker-marquee" behavior="scroll" direction="left" scrollamount="3">
    <span style="color:#555">Loading dust data...</span>
  </marquee>
</div>

<!-- WIN98 MAIN WINDOW -->
<div class="main-window">

  <!-- Title Bar -->
  <div class="window-title-bar">
    <div class="title-left">
      <span class="title-icon">&#x1F9F9;</span>
      <span>DustKit v1.0 &mdash; Dust Sweeper</span>
    </div>
    <div class="title-buttons">
      <div class="title-btn">&#x2014;</div>
      <div class="title-btn">&#x25A1;</div>
      <div class="title-btn" style="color:#cc0000">&#x2715;</div>
    </div>
  </div>

  <!-- Menu Bar -->
  <div class="menu-bar">
    <div class="menu-item"><u>F</u>ile</div>
    <div class="menu-item"><u>W</u>allets</div>
    <div class="menu-item"><u>S</u>weep</div>
    <div class="menu-item"><u>R</u>outes</div>
    <div class="menu-item"><u>L</u>edger</div>
    <div class="menu-item"><u>H</u>elp</div>
  </div>

  <!-- Toolbar -->
  <div class="toolbar">
    <button class="tb-btn" onclick="window.dustkitRefresh()">&#x1F504; Refresh</button>
    <button class="tb-btn">&#x1F4BE; Save Profile</button>
    <button class="tb-btn">&#x1F4C2; Load Profile</button>
    <div class="tb-separator"></div>
    <button class="tb-btn" style="color:#006600">&#x1F4B0; Sweep All</button>
    <button class="tb-btn" style="color:#880000">&#x1F6AB; Abort</button>
    <div class="tb-separator"></div>
    <button class="tb-btn" style="color:#800080;font-weight:bold">&#x266B; MIDI: OFF</button>
    <div class="tb-separator"></div>
    <span class="tb-label">Threshold: </span>
    <input type="range" id="threshold-slider" min="1" max="50" value="5" style="width:80px">
    <span class="threshold-val" id="thresh-val">$5</span>
  </div>

  <div class="content-area">

    <!-- Wallet Addresses Panel -->
    <div class="panel">
      <div class="panel-title">
        <span>&#x1F4BC; Wallet Addresses</span>
        <span style="font-size:9px;font-weight:normal">NON-CUSTODIAL &mdash; READ ONLY</span>
      </div>
      <div class="panel-content">
        <table width="100%" cellpadding="2" cellspacing="2" border="0">
          <tr>
            <td width="60" style="font-family:'MS Sans Serif',Arial,sans-serif;font-size:10px;">EVM 1</td>
            <td><input class="sunken" id="wallet-evm-0" type="text" readonly></td>
          </tr>
          <tr>
            <td style="font-family:'MS Sans Serif',Arial,sans-serif;font-size:10px;">EVM 2</td>
            <td><input class="sunken" id="wallet-evm-1" type="text" readonly></td>
          </tr>
          <tr>
            <td style="font-family:'MS Sans Serif',Arial,sans-serif;font-size:10px;">Solana</td>
            <td><input class="sunken" id="wallet-sol-0" type="text" readonly></td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Dust Inventory Table -->
    <div class="panel">
      <div class="panel-title">
        <span>&#x1F4CA; Dust Inventory &mdash; Below <span id="threshold-display">$5.00</span> threshold</span>
        <span style="font-size:9px;font-weight:normal" id="dust-summary">Loading...</span>
      </div>
      <div class="panel-content" style="overflow-x:auto">
        <table class="balance-table" cellspacing="0" cellpadding="0" border="0">
          <thead>
            <tr>
              <th>CHAIN</th>
              <th>TOKEN</th>
              <th>BALANCE</th>
              <th>USD VALUE</th>
              <th>NET VALUE</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody id="dust-table-body">
            <tr><td colspan="6" style="text-align:center;color:#888;font-style:italic">Loading...</td></tr>
          </tbody>
          <tfoot id="dust-table-foot"></tfoot>
        </table>
      </div>
    </div>

    <!-- Bottom 2-column panels -->
    <div class="two-col">

      <!-- Dust Ledger -->
      <div class="panel">
        <div class="panel-title">
          <span>&#x1F4DC; Dust Ledger &mdash; All Time</span>
        </div>
        <div class="panel-content">
          <div class="ledger-inner" id="ledger-inner">
            <span class="ledger-empty">No sweeps recorded yet.</span>
          </div>
        </div>
      </div>

      <!-- Gas Tracker — Phase 2, hidden -->
      <div class="panel" id="gas-panel">
        <div class="panel-title">
          <span>&#x26FD; Gas Tracker &mdash; Live</span>
          <span style="font-size:9px;font-weight:normal">AUTO-REFRESH 30s</span>
        </div>
        <div class="panel-content" id="gas-content">
          <!-- Phase 2: populated by ui.js renderGas() -->
        </div>
      </div>

    </div>

    <!-- Sweep Action — Phase 3, hidden -->
    <div class="sweep-section" id="sweep-section">
      <div style="font-family:'Courier New',monospace;font-size:clamp(11px,1.8vw,14px);color:#006600;font-weight:bold;margin-bottom:4px">
        &#x1F9F9; NET RECOVERABLE: <span id="sweep-net-value">$0.00</span> &rarr; Master Wallet (<span id="sweep-master-wallet"></span>)
      </div>
      <button class="sweep-btn">&#x1F9F9; SWEEP DUST</button>
      <div style="font-family:'MS Sans Serif',Arial,sans-serif;font-size:9px;color:#444;margin-top:3px" id="sweep-confirm"></div>
    </div>

  </div><!-- end content-area -->

  <!-- Status Bar — written by ui.js renderStatusBar() -->
  <div class="status-bar" id="status-bar">
    <div class="status-cell"><span class="status-dot dot-grey"></span>Loading...</div>
  </div>

</div><!-- end main-window -->

<!-- GEOCITIES FOOTER -->
<div class="geo-divider" style="margin-top:6px">&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;</div>

<div class="geo-footer">
  <div style="margin-bottom:4px">
    <span class="construction-gif">&#x1F6A7;</span>
    <span class="blinkme">&nbsp; UNDER CONSTRUCTION &nbsp;</span>
    <span class="construction-gif">&#x1F6A7;</span>
  </div>
  <div class="visitor-badge">&#x1F464; VISITORS: 000001337 &nbsp;|&nbsp; BEST VIEWED IN NETSCAPE NAVIGATOR 4.0 AT 800x600 &nbsp;|&nbsp; NON-CUSTODIAL SINCE 2025</div>
  <div style="margin-top:4px">
    <a href="#">[SOURCE]</a>
    <a href="#">[GITHUB]</a>
    <a href="#">[PRIVACY]</a>
    <a href="#">[REPORT BUG]</a>
    <a href="#">[WEB RING]</a>
  </div>
  <div style="margin-top:4px">
    <marquee behavior="alternate" scrollamount="2">
      <span style="color:#ff00ff;font-size:9px;font-family:'Courier New',Courier,monospace">
        &#x2665; MADE WITH LOVE AND NOSTALGIA &#x2665; YOUR KEYS YOUR CRYPTO &#x2665; DUST IS MONEY &#x2665;
      </span>
    </marquee>
  </div>
</div>

<!-- Config must load before app.js so window.DUSTKIT_CONFIG is available -->
<script src="config.js"></script>
<script type="module" src="src/app.js"></script>

</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add index.html Win98/Geocities shell with Phase 2/3 sections hidden"
```

---

### Task 9: ui.js — all DOM rendering functions

**Files:**
- Create: `src/ui.js`

DOM target IDs this module writes to:
- `#ticker-marquee` — scrolling ticker content
- `#dust-table-body` — table rows
- `#dust-table-foot` — totals row
- `#dust-summary` — "N tokens · $X.XX gross" in panel title
- `#threshold-display` — threshold value in panel title
- `#ledger-inner` — terminal-style ledger
- `#status-bar` — status indicator cells
- `#wallet-evm-0`, `#wallet-evm-1`, `#wallet-sol-0` — wallet address inputs

Chain badge background colors match the mockup:
- `eth` → `#c0c0c0` (silver)
- `arbitrum` → `#e8f0ff` (light blue)
- `base` → `#fff0e8` (light orange)
- `polygon` → `#f0e8ff` (light purple)
- `optimism` → `#ffe8e8` (light red)
- `solana` → `#e8f0ff` (light blue)

- [ ] **Step 1: Create ui.js**

Create `src/ui.js`:
```javascript
const CHAIN_COLORS = {
  eth:      '#c0c0c0',
  arbitrum: '#e8f0ff',
  base:     '#fff0e8',
  polygon:  '#f0e8ff',
  optimism: '#ffe8e8',
  solana:   '#e8f0ff',
}

function fmt(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtBal(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M'
  if (n >= 1000)    return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  return n.toPrecision(4)
}

// DustToken: {
//   chain, tokenSymbol, humanAmount, usdValue, netValue,
//   isRentAccounts?, walletAddress
// }
export function renderTable(dustTokens) {
  const tbody = document.getElementById('dust-table-body')
  const tfoot = document.getElementById('dust-table-foot')
  const summary = document.getElementById('dust-summary')

  if (dustTokens.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888;font-style:italic;background:#fff">No dust found below threshold.</td></tr>'
    tfoot.innerHTML = ''
    summary.textContent = '0 tokens found'
    return
  }

  const totalUSD = dustTokens.reduce((s, t) => s + t.usdValue, 0)
  const totalNet = dustTokens.reduce((s, t) => s + t.netValue, 0)

  tbody.innerHTML = dustTokens.map(t => {
    const bgColor = CHAIN_COLORS[t.chain] ?? '#c0c0c0'
    const balDisplay = t.isRentAccounts
      ? `${t.humanAmount} accts`
      : fmtBal(t.humanAmount)
    const chainLabel = t.chain === 'arbitrum' ? 'ARB'
      : t.chain === 'optimism' ? 'OP'
      : t.chain === 'polygon'  ? 'POL'
      : t.chain.toUpperCase()

    return `<tr>
      <td><span class="chain-badge" style="background:${bgColor}">${chainLabel}</span></td>
      <td>${t.tokenSymbol}${t.isRentAccounts ? ' &#x1F511;' : ''}</td>
      <td>${balDisplay}</td>
      <td>$${fmt(t.usdValue)}</td>
      <td class="net-positive">+$${fmt(t.netValue)}</td>
      <td><span style="color:#006600;font-size:10px">&#x2705; SWEEP</span></td>
    </tr>`
  }).join('')

  tfoot.innerHTML = `<tr>
    <td colspan="3" style="font-family:'MS Sans Serif',Arial,sans-serif;font-size:10px;font-weight:bold">TOTAL</td>
    <td style="font-family:'Courier New',monospace;font-weight:bold">$${fmt(totalUSD)}</td>
    <td style="font-family:'Courier New',monospace;font-weight:bold;color:#006600">+$${fmt(totalNet)}</td>
    <td></td>
  </tr>`

  summary.textContent = `${dustTokens.length} token${dustTokens.length !== 1 ? 's' : ''} found • $${fmt(totalUSD)} gross`
}

export function renderTicker(dustTokens) {
  const marquee = document.getElementById('ticker-marquee')
  if (!dustTokens.length) {
    marquee.innerHTML = '<span style="color:#555">No dust found — wallet is clean.</span>'
    return
  }

  const totalGross = dustTokens.reduce((s, t) => s + t.usdValue, 0)
  const totalNet   = dustTokens.reduce((s, t) => s + t.netValue, 0)
  const rentToken  = dustTokens.find(t => t.isRentAccounts)
  const chains     = [...new Set(dustTokens.map(t => t.chain))]

  const chainParts = chains.map(chain => {
    const chainTokens = dustTokens.filter(t => t.chain === chain)
    const chainTotal  = chainTokens.reduce((s, t) => s + t.usdValue, 0)
    const label = chain === 'arbitrum' ? 'ARB'
      : chain === 'optimism' ? 'OP'
      : chain === 'polygon'  ? 'POL'
      : chain.toUpperCase()
    return `<span>${label}: <span class="tick-good">$${fmt(chainTotal)}</span></span>`
  }).join('<span class="tick-sep">|</span>')

  const sep = '<span class="tick-sep">&#x26A1;</span>'
  const rentPart = rentToken
    ? `${sep}<span>SOL RENT RECLAIMABLE: <span class="tick-good">$${fmt(rentToken.usdValue)}</span></span>`
    : ''

  marquee.innerHTML = `
    ${sep}
    ${chainParts}
    ${sep}
    <span>DUST FOUND: <span class="tick-good">$${fmt(totalGross)}</span></span>
    <span class="tick-sep">|</span>
    <span>NET RECOVERABLE: <span class="tick-good">$${fmt(totalNet)}</span></span>
    ${rentPart}
    ${sep}
  `
}

// apiStatus: { alchemy: 'mock'|'live'|'error', helius: ..., coingecko: ..., lifi: 'pending'|'ready' }
export function renderStatusBar(apiStatus) {
  const bar = document.getElementById('status-bar')
  const cell = (label, state) => {
    const dotClass = state === 'live' || state === 'ready' ? 'dot-green'
      : state === 'mock' ? 'dot-yellow'
      : 'dot-grey'
    const badge = state === 'mock' ? 'MOCK' : state === 'live' ? 'Live' : state === 'ready' ? 'Ready' : state.toUpperCase()
    return `<div class="status-cell"><span class="status-dot ${dotClass}"></span>${label}: ${badge}</div>`
  }
  bar.innerHTML =
    cell('Alchemy', apiStatus.alchemy) +
    cell('Helius', apiStatus.helius) +
    cell('Li.Fi', apiStatus.lifi) +
    cell('CoinGecko', apiStatus.coingecko)
}

export function renderLedger(entries) {
  const inner = document.getElementById('ledger-inner')
  if (!entries.length) {
    inner.innerHTML = '<span class="ledger-empty">No sweeps recorded yet.</span>'
    return
  }
  const totalNet = entries.reduce((s, e) => s + e.netUSD, 0)
  const firstDate = entries[0]?.date?.slice(0, 10) ?? '—'
  inner.innerHTML = entries.map(e =>
    `<div class="ledger-line"><span class="ledger-prompt">C:\\DUSTKIT&gt;</span> sweep --chain ${e.chain} --token ${e.token}</div>
     <div class="ledger-line ledger-ok">&nbsp;&nbsp;[OK] ${e.date} &mdash; +$${fmt(e.netUSD)} &mdash; ${e.chain.toUpperCase()}&rarr;MASTER</div>`
  ).join('') +
  `<div class="ledger-total">TOTAL RECOVERED: $${fmt(totalNet)} since ${firstDate}</div>`
}

export function renderWallets(wallets) {
  const evmInputs = [
    document.getElementById('wallet-evm-0'),
    document.getElementById('wallet-evm-1'),
  ]
  wallets.evm.forEach((addr, i) => {
    if (evmInputs[i]) evmInputs[i].value = addr
  })
  const solInput = document.getElementById('wallet-sol-0')
  if (solInput && wallets.solana[0]) solInput.value = wallets.solana[0]
}
```

- [ ] **Step 2: Commit**

```bash
git add src/ui.js
git commit -m "feat: add ui.js — renderTable, renderTicker, renderStatusBar, renderLedger, renderWallets"
```

---

### Task 10: app.js — orchestrator

**Files:**
- Create: `src/app.js`

- [ ] **Step 1: Create app.js**

Create `src/app.js`:
```javascript
import { fetchBalances } from './balances.js'
import { fetchPrices }   from './prices.js'
import { getLedger }     from './ledger.js'
import { renderTable, renderTicker, renderStatusBar, renderLedger, renderWallets } from './ui.js'

// DustToken extends TokenBalance with computed fields:
// { ...TokenBalance, humanAmount: number, usdValue: number, gasEstimate: null, netValue: number }
function computeDust(balances, prices, threshold) {
  return balances
    .map(b => {
      const price = prices[b.tokenSymbol] ?? 0
      // isRentAccounts: rawBalance is the count of dead accounts, each worth prices.RENT
      const humanAmount = b.isRentAccounts
        ? parseInt(b.rawBalance, 10)
        : parseInt(b.rawBalance, 10) / Math.pow(10, b.decimals)
      const usdValue = humanAmount * price
      return {
        ...b,
        humanAmount,
        usdValue,
        gasEstimate: null, // Phase 2: subtract real gas cost here
        netValue: usdValue // Phase 2: netValue = usdValue - gasEstimate
      }
    })
    .filter(t => t.usdValue > 0 && t.usdValue < threshold)
    .sort((a, b) => b.usdValue - a.usdValue)
}

async function init() {
  const config = window.DUSTKIT_CONFIG

  renderWallets(config.wallets)
  renderStatusBar({ alchemy: 'mock', helius: 'mock', coingecko: 'mock', lifi: 'pending' })
  renderLedger(getLedger())

  // Fetch balances and prices in parallel
  // TODO (Phase 2+): cache these responses (CoinGecko: 60s TTL, balances: on manual refresh only)
  const symbols = ['PEPE','GMX','USDC','DEGEN','MATIC','OP','BONK','RENT']
  const [balances, prices] = await Promise.all([
    fetchBalances(config.wallets),
    fetchPrices(symbols)
  ])

  function applyThreshold(threshold) {
    const dustTokens = computeDust(balances, prices, threshold)
    renderTable(dustTokens)
    renderTicker(dustTokens)
    document.getElementById('thresh-val').textContent = `$${threshold}`
    document.getElementById('threshold-display').textContent = `$${threshold.toFixed(2)}`
  }

  const slider = document.getElementById('threshold-slider')
  slider.value = config.dustThreshold
  applyThreshold(config.dustThreshold)

  // Threshold slider — re-filter without re-fetching
  slider.addEventListener('input', () => applyThreshold(parseFloat(slider.value)))

  // Expose refresh for the toolbar Refresh button — re-runs full init
  window.dustkitRefresh = () => init()
}

init()
```

- [ ] **Step 2: Commit**

```bash
git add src/app.js
git commit -m "feat: add app.js orchestrator — init, computeDust, threshold slider, refresh"
```

---

### Task 11: End-to-end verification

No code changes in this task — open the app and verify every feature works.

- [ ] **Step 1: Start local dev server**

```bash
cd /Users/adamsmith/Projects/dust-kit
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

- [ ] **Step 2: Verify initial load**

Check each of the following:
- Geocities header visible: "DustKit" logo in green with glow animation
- Star field background visible (deep space, `#000010`)
- Ticker marquee scrolling with live dust totals (not "Loading dust data...")
- Win98 title bar with blue gradient gradient visible
- Menu bar visible: File / Wallets / Sweep / Routes / Ledger / Help
- Toolbar visible with threshold slider set to $5

- [ ] **Step 3: Verify wallet panel**

- "Wallet Addresses" panel shows two EVM addresses from config.js
- Solana address shows in the third row
- Inputs are read-only (cannot type into them)

- [ ] **Step 4: Verify dust inventory table**

Confirm the table shows exactly these rows (all from mock data, threshold = $5):

| CHAIN | TOKEN | USD VALUE | STATUS |
|-------|-------|-----------|--------|
| ETH   | PEPE  | ~$4.20    | ✅ SWEEP |
| ARB   | GMX   | ~$3.18    | ✅ SWEEP |
| ARB   | USDC  | ~$2.55    | ✅ SWEEP |
| BASE  | DEGEN | ~$1.78    | ✅ SWEEP |
| POL   | MATIC | ~$0.54    | ✅ SWEEP |
| OP    | OP    | ~$1.46    | ✅ SWEEP |
| SOL   | BONK  | ~$1.30    | ✅ SWEEP |
| SOL   | RENT🔑| ~$20.40   | ✅ SWEEP |

> Note: GMX mock price of $1514.28 × 0.0021 = $3.18. All values should match mock data × mock prices.

- [ ] **Step 5: Verify threshold slider**

- Drag slider to $2 — rows with USD value > $2 should disappear from table. PEPE, GMX, USDC should remain; check that DEGEN ($1.78) is gone.
- Drag to $25 — all rows including RENT should appear.
- Drag back to $5 — original rows return.
- Panel title "threshold display" updates with each drag.
- Ticker marquee totals update with each drag.

- [ ] **Step 6: Verify hidden Phase 2/3 sections**

Open browser DevTools → Elements. Confirm:
- `#gas-panel` has `display: none` (not visible)
- `#sweep-section` has `display: none` (not visible)

- [ ] **Step 7: Verify Dust Ledger**

- Ledger panel shows "No sweeps recorded yet." (empty localStorage)
- Open DevTools → Console → run:
  ```javascript
  localStorage.setItem('dustkit_ledger', JSON.stringify([
    { date: '2026-05-06T12:00:00Z', chain: 'arbitrum', token: 'GMX', netUSD: 3.15, txHash: '0xabc' }
  ]))
  ```
- Refresh the page — ledger should now show the entry and "TOTAL RECOVERED: $3.15 since 2026-05-06"

- [ ] **Step 8: Verify status bar**

Status bar at the bottom shows:
- 🟡 Alchemy: MOCK
- 🟡 Helius: MOCK
- ⚫ Li.Fi: PENDING
- 🟡 CoinGecko: MOCK

- [ ] **Step 9: Final commit**

```bash
git add -A
git commit -m "feat: Phase 1 complete — working DustKit with mock data, Win98 UI, threshold slider"
```
