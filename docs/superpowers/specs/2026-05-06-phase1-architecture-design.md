# DustKit Phase 1 — Architecture Design
**Date:** 2026-05-06
**Scope:** Phase 1 (See It) — working product with mock data, full UI shell

---

## Overview

Phase 1 delivers a fully working DustKit in the browser: wallet balances aggregated across 6 chains, USD values computed, dust filtered by threshold, and the Win98/Geocities UI rendered. All data sources return mock data with clear comments marking where real API calls go. Phase 2/3 UI sections exist in the HTML but are hidden via CSS.

---

## File Structure

```
dust-kit/
├── index.html                  ← Win98 shell, loads app.js as ES module
├── config.js                   ← wallet addresses, dustThreshold, masterWallet (gitignored)
├── config.example.js           ← safe template to commit
├── dustkit-design-mockup.html  ← design reference (untouched)
├── CLAUDE.md
│
├── src/
│   ├── app.js                  ← orchestrator: init, wires all modules, renders
│   ├── balances.js             ← returns token balances (mock → Alchemy/Helius)
│   ├── prices.js               ← returns USD prices (mock → CoinGecko)
│   ├── gas.js                  ← Phase 2 stub, not called in Phase 1
│   ├── sweep.js                ← Phase 3 stub, not called in Phase 1
│   ├── ledger.js               ← localStorage sweep history (real from day one)
│   ├── ui.js                   ← all DOM: table, ticker, status bar, ledger
│   │
│   └── mock/
│       ├── balances.mock.js    ← fake data mirroring Alchemy + Helius shapes
│       └── prices.mock.js      ← fake data mirroring CoinGecko shape
│
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-05-06-phase1-architecture-design.md
```

---

## Module Responsibilities & Interfaces

### `config.js`
Loaded via plain `<script>` tag (not a module) so it populates `window.DUSTKIT_CONFIG` before `app.js` runs.
```javascript
window.DUSTKIT_CONFIG = {
  wallets: {
    evm: ['0xWallet1', '0xWallet2'],
    solana: ['SolWallet1']
  },
  dustThreshold: 5.00,       // USD — tokens below this qualify as dust
  masterWallet: '0xWallet1'  // sweep destination
}
```

### `balances.js`
```javascript
// Phase 1: returns MOCK_BALANCES from src/mock/balances.mock.js
// TODO (real): replace body with:
//   - Alchemy alchemy_getTokenBalances per chain (eth, arbitrum, base, polygon, optimism)
//   - Helius getTokenAccountsByOwner for Solana SPL tokens
export async function fetchBalances(wallets) → TokenBalance[]

// TokenBalance shape:
// { chain, tokenSymbol, contractAddress, rawBalance, decimals, walletAddress, isRentAccounts? }
```

### `prices.js`
```javascript
// Phase 1: returns MOCK_PRICES from src/mock/prices.mock.js
// TODO (real): GET https://api.coingecko.com/api/v3/simple/price
//   Cache results for 60s — free tier is 30 calls/min
export async function fetchPrices(symbols) → PriceMap
// PriceMap: { [tokenSymbol]: usdPrice }
```

### `gas.js`
```javascript
// PHASE 2 STUB — not imported or called in Phase 1
// TODO (Phase 2): GET Etherscan /api?module=gastracker&action=gasoracle per chain
//   Returns estimated USD cost for a single swap transaction
export async function fetchGasCosts(chains) → GasMap
// GasMap: { [chain]: { gwei, usdCost } }
```

### `sweep.js`
```javascript
// PHASE 3 STUB — not imported or called in Phase 1
// TODO (Phase 3): integrate Li.Fi SDK
//   import { getRoutes, executeRoute } from '@lifi/sdk'
//   Build and route transactions, open MetaMask/Phantom for signing
export async function buildSweepRoutes(dustTokens) → Route[]
export async function executeSweep(routes) → SweepResult[]
```

### `ledger.js`
```javascript
// Real from day one — localStorage needs no API
export function getLedger() → SweepEntry[]
export function appendLedger(entry) → void
// SweepEntry: { date, chain, token, netUSD, txHash }
```

### `ui.js`
```javascript
// All DOM manipulation — takes plain data, writes to DOM
// No external dependencies
export function renderTable(dustTokens) → void
export function renderTicker(summary) → void
export function renderStatusBar(apiStatus) → void
export function renderLedger(entries) → void
```

### `app.js`
Entry point. Wires all modules together. Owns the threshold slider event listener.
```javascript
export async function init() → void
```

---

## Mock Data

### `src/mock/balances.mock.js`
Mirrors Alchemy + Helius response shapes. All 6 chains covered. Balances are dust-range values matching the mockup.

```javascript
export const MOCK_BALANCES = [
  { chain: 'eth',      tokenSymbol: 'PEPE',  contractAddress: '0x...', rawBalance: '4201337000000000000', decimals: 18, walletAddress: '0xWallet1' },
  { chain: 'arbitrum', tokenSymbol: 'GMX',   contractAddress: '0x...', rawBalance: '2100000000000000',    decimals: 18, walletAddress: '0xWallet1' },
  { chain: 'arbitrum', tokenSymbol: 'USDC',  contractAddress: '0x...', rawBalance: '2550000',             decimals: 6,  walletAddress: '0xWallet1' },
  { chain: 'base',     tokenSymbol: 'DEGEN', contractAddress: '0x...', rawBalance: '892400000000000000',  decimals: 18, walletAddress: '0xWallet1' },
  { chain: 'polygon',  tokenSymbol: 'MATIC', contractAddress: '0x...', rawBalance: '1200000000000000000', decimals: 18, walletAddress: '0xWallet2' },
  { chain: 'optimism', tokenSymbol: 'OP',    contractAddress: '0x...', rawBalance: '800000000000000000',  decimals: 18, walletAddress: '0xWallet2' },
  { chain: 'solana',   tokenSymbol: 'BONK',  contractAddress: 'Bon...', rawBalance: '120000000000',       decimals: 5,  walletAddress: 'SolWallet1' },
  { chain: 'solana',   tokenSymbol: 'RENT',  contractAddress: null,    rawBalance: '68',                  decimals: 0,  walletAddress: 'SolWallet1', isRentAccounts: true },
]
```

### `src/mock/prices.mock.js`
Mirrors CoinGecko `/simple/price` response shape.

```javascript
// TODO (real): GET https://api.coingecko.com/api/v3/simple/price
//   ?ids=pepe,gmx,usd-coin,degen-base,matic-network,optimism,bonk
//   &vs_currencies=usd
export const MOCK_PRICES = {
  PEPE:  0.000001,
  GMX:   1514.28,
  USDC:  1.00,
  DEGEN: 0.002,
  MATIC: 0.45,
  OP:    1.82,
  BONK:  0.0000108,
  RENT:  0.30,   // per dead account, fixed rate
}
```

---

## Data Flow

```
app.js init()
│
├── 1. Load config from window.DUSTKIT_CONFIG
│
├── 2. Promise.all([
│       fetchBalances(config.wallets),   ← balances.js
│       fetchPrices(uniqueSymbols)       ← prices.js
│     ])
│
├── 3. computeDust(balances, prices, threshold)   ← pure function in app.js
│       - rawBalance / 10^decimals = humanAmount
│       - humanAmount * price = usdValue
│       - filter: usdValue < threshold
│       - gasEstimate: null (Phase 2)
│       - netValue: usdValue (Phase 2 subtracts gas)
│       returns DustToken[]
│
├── 4. renderTable(dustTokens)            ← ui.js
├── 5. renderTicker({ dustTokens })       ← ui.js
├── 6. renderStatusBar({ alchemy: 'mock', helius: 'mock', coingecko: 'mock', lifi: 'pending' })
└── 7. renderLedger(getLedger())          ← ledger.js → ui.js

Threshold slider onChange:
└── re-run step 3 with new threshold → re-render table + ticker (no re-fetch)
```

Steps 2a and 2b run in parallel via `Promise.all` — no blocking between balance and price fetches.

---

## UI Rendering

`index.html` is the static Win98/Geocities shell. `ui.js` writes into named DOM targets via `getElementById` — no full re-renders, targeted updates only.

### Phase 1 — Visible
- Geocities header + star field
- Live marquee ticker (dust total, per-chain breakdown)
- Win98 title bar, menu bar, toolbar with live threshold slider
- Wallet addresses panel (read-only from config)
- Dust inventory table (all rows from mock data)
- Dust Ledger panel (localStorage, real from day one)
- Status bar with MOCK badges

### Phase 2/3 — Hidden via CSS (`display: none`)
- `#gas-panel` — Gas Tracker (Phase 2)
- `#sweep-section` — Net recoverable + Sweep button (Phase 3)

Single class swap reveals each section when the phase is implemented.

### Status Bar (Phase 1)
```
[● MOCK] Alchemy    [● MOCK] Helius    [◌ PENDING] Li.Fi    [● MOCK] CoinGecko
```

### Table STATUS Column (Phase 1)
All rows show `✅ SWEEP` — no gas math yet to disqualify any token. Phase 2 introduces `⚠️ WAIT` for negative-net rows.

---

## Key Constraints

- `index.html` loads only `src/app.js` via `<script type="module">` — all other imports flow from there
- `config.js` is a plain `<script>` (not a module) — populates `window.DUSTKIT_CONFIG` before app.js runs
- `gas.js` and `sweep.js` exist as stubs but are not imported in Phase 1
- ES modules require a local dev server — `python3 -m http.server 8080` or VS Code Live Server
- No frameworks, no build step, no node_modules — vanilla JS only for Phase 1
- Future Vercel deployment: static hosting, no changes needed for free tier. API keys move behind a Vercel Edge Function proxy for the public version.

---

## Out of Scope (Phase 1)

- Gas cost fetching (Phase 2)
- Net value calculation with gas (Phase 2)
- WAIT/SWEEP status logic (Phase 2)
- Li.Fi routing and sweep execution (Phase 3)
- Solana rent reclaim (Phase 2)
- Sweep Share Card (Phase 4)
- Chain toggles, token blocklist (Phase 3)
