# DustKit Phase 2 — Evaluate It Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace mock data with live APIs, add real gas cost fetching, compute net recoverable value per token, and surface WAIT/SWEEP status in the UI.

**Architecture:** Each Phase 1 module stub (gas.js, balances.js, prices.js) gets its real implementation. `computeDust()` in app.js gains a GasMap parameter to calculate `netValue = usdValue - gasEstimate`. `ui.js` gains `renderGas()` and updated `renderTable()` WAIT logic. The hidden `#gas-panel` is revealed.

**Tech Stack:** Vanilla JS ES modules, Alchemy REST API (JSON-RPC), Helius RPC API, Etherscan/Arbiscan/Basescan/Polygonscan/OP-Etherscan Gas APIs, CoinGecko free API. No build step. No npm.

**Prerequisites:** All API keys must be present in `config.js` before starting:
- `alchemyKey` — Alchemy (one key, all EVM chains)
- `heliusKey` — Helius (Solana)
- `etherscanKey`, `arbiscanKey`, `basescanKey`, `polygonscanKey`, `optimismKey` — Gas trackers

---

## Files Modified/Created

| File | Action | What Changes |
|---|---|---|
| `config.js` | Modify | Add API key fields |
| `config.example.js` | Modify | Add API key placeholders |
| `src/gas.js` | Modify | Full implementation (was stub) |
| `src/prices.js` | Modify | Full implementation (was mock) |
| `src/balances.js` | Modify | Full implementation (was mock) |
| `src/solana-rent.js` | Create | New module for rent reclaim detection |
| `src/ui.js` | Modify | Add renderGas(), update renderTable() WAIT logic, add renderSolanaRent() |
| `src/app.js` | Modify | Wire gas fetch, update computeDust() signature, wire solana-rent |
| `index.html` | Modify | Reveal #gas-panel (remove display:none) |

---

### Task 1: Add API keys to config.js + config.example.js

**Files:**
- Modify: `config.js`
- Modify: `config.example.js`

- [ ] **Step 1: Update config.js**

Replace the contents of `config.js` with:
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
  masterWallet: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9',

  // Phase 2: Live API keys — never commit this file
  alchemyKey:     'YOUR_ALCHEMY_KEY',
  heliusKey:      'YOUR_HELIUS_KEY',
  etherscanKey:   'YOUR_ETHERSCAN_KEY',
  arbiscanKey:    'YOUR_ARBISCAN_KEY',
  basescanKey:    'YOUR_BASESCAN_KEY',
  polygonscanKey: 'YOUR_POLYGONSCAN_KEY',
  optimismKey:    'YOUR_OPTIMISM_KEY',
}
```

- [ ] **Step 2: Update config.example.js**

Replace the contents of `config.example.js` with:
```javascript
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

  // Phase 2: Live API keys
  alchemyKey:     'YOUR_ALCHEMY_KEY',      // alchemy.com — one key for all EVM chains
  heliusKey:      'YOUR_HELIUS_KEY',       // helius.dev — Solana balances + rent reclaim
  etherscanKey:   'YOUR_ETHERSCAN_KEY',    // etherscan.io/apis — ETH gas
  arbiscanKey:    'YOUR_ARBISCAN_KEY',     // arbiscan.io/apis — ARB gas
  basescanKey:    'YOUR_BASESCAN_KEY',     // basescan.org/apis — BASE gas
  polygonscanKey: 'YOUR_POLYGONSCAN_KEY',  // polygonscan.com/apis — POL gas
  optimismKey:    'YOUR_OPTIMISM_KEY',     // explorer.optimism.io — OP gas
}
```

- [ ] **Step 3: Commit**

```bash
git add config.example.js
git commit -m "feat: add Phase 2 API key fields to config"
```

Note: `config.js` is gitignored — do NOT add it to the commit.

- [ ] **Step 4: Verify config is not staged**

```bash
git status
```

Expected: `config.js` does NOT appear in staged files. If it does, run `git reset HEAD config.js`.

---

### Task 2: Implement gas.js — live gas costs per chain

**Files:**
- Modify: `src/gas.js`

Each block explorer API returns gas price in gwei. We convert to USD using:
`gasUSD = (gasPriceGwei × GAS_LIMIT) / 1e9 × ethPriceUSD`

Where `GAS_LIMIT = 150000` (typical Li.Fi cross-chain swap).

ETH price is fetched independently in this module (CoinGecko, no key required) so gas.js stays self-contained.

Block explorer API endpoints:
- ETH: `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey={key}`
- ARB: `https://api.arbiscan.io/api?module=gastracker&action=gasoracle&apikey={key}`
- BASE: `https://api.basescan.org/api?module=gastracker&action=gasoracle&apikey={key}`
- POL: `https://api.polygonscan.com/api?module=gastracker&action=gasoracle&apikey={key}`
- OP: `https://api-optimistic.etherscan.io/api?module=gastracker&action=gasoracle&apikey={key}`

All return: `{ result: { ProposeGasPrice: "17" } }` (gwei as string)

- [ ] **Step 1: Replace src/gas.js with full implementation**

```javascript
const GAS_LIMIT = 150000 // typical Li.Fi swap gas units

const EXPLORERS = {
  eth:      key => `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${key}`,
  arbitrum: key => `https://api.arbiscan.io/api?module=gastracker&action=gasoracle&apikey=${key}`,
  base:     key => `https://api.basescan.org/api?module=gastracker&action=gasoracle&apikey=${key}`,
  polygon:  key => `https://api.polygonscan.com/api?module=gastracker&action=gasoracle&apikey=${key}`,
  optimism: key => `https://api-optimistic.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${key}`,
}

async function fetchEthPrice() {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
  )
  const data = await res.json()
  return data.ethereum.usd
}

async function fetchChainGas(chain, apiKey, ethPriceUSD) {
  const urlFn = EXPLORERS[chain]
  if (!urlFn) return null

  const res = await fetch(urlFn(apiKey))
  const data = await res.json()
  if (data.status !== '1') return null

  const gwei = parseFloat(data.result.ProposeGasPrice)
  const usdCost = (gwei * GAS_LIMIT / 1e9) * ethPriceUSD
  return { gwei, usdCost }
}

// GasMap: { [chain: string]: { gwei: number, usdCost: number } | null }
// null means the fetch failed — treat as unknown gas cost
export async function fetchGasCosts(config) {
  const keys = {
    eth:      config.etherscanKey,
    arbitrum: config.arbiscanKey,
    base:     config.basescanKey,
    polygon:  config.polygonscanKey,
    optimism: config.optimismKey,
  }

  const ethPriceUSD = await fetchEthPrice()

  const results = await Promise.allSettled(
    Object.entries(keys).map(async ([chain, key]) => {
      const gas = await fetchChainGas(chain, key, ethPriceUSD)
      return [chain, gas]
    })
  )

  const gasMap = { solana: { gwei: 0, usdCost: 0.001 } } // Solana fee is flat ~$0.001
  for (const result of results) {
    if (result.status === 'fulfilled') {
      const [chain, gas] = result.value
      gasMap[chain] = gas
    }
  }
  return gasMap
}
```

- [ ] **Step 2: Commit**

```bash
git add src/gas.js
git commit -m "feat: implement gas.js with live Etherscan gas tracker per chain"
```

- [ ] **Step 3: Verify in browser console**

Open the app at http://localhost:8080, open DevTools console, run:
```javascript
import('/src/gas.js').then(m => m.fetchGasCosts(window.DUSTKIT_CONFIG)).then(console.log)
```
Expected: object with keys eth, arbitrum, base, polygon, optimism, solana — each with `gwei` and `usdCost` numbers.

---

### Task 3: Add renderGas() to ui.js

**Files:**
- Modify: `src/ui.js`

Add `renderGas(gasMap)` export to ui.js. This function writes to `#gas-content` (inside `#gas-panel`). The gas bars use the same Win98 beveled style as the mockup.

- [ ] **Step 1: Add renderGas to src/ui.js**

Add this function after `renderWallets` at the end of the file:

```javascript
// gasMap: { [chain]: { gwei: number, usdCost: number } | null }
export function renderGas(gasMap) {
  const content = document.getElementById('gas-content')
  if (!content) return

  const chains = [
    { key: 'eth',      label: 'ETH',  color: '#0000cc' },
    { key: 'arbitrum', label: 'ARB',  color: '#009900' },
    { key: 'base',     label: 'BASE', color: '#0055ff' },
    { key: 'polygon',  label: 'POL',  color: '#6600cc' },
    { key: 'optimism', label: 'OP',   color: '#cc0000' },
    { key: 'solana',   label: 'SOL',  color: '#9900cc' },
  ]

  // Find max gwei for bar scaling
  const maxGwei = Math.max(
    1,
    ...chains.map(c => gasMap[c.key]?.gwei ?? 0)
  )

  content.innerHTML = chains.map(({ key, label, color }) => {
    const gas = gasMap[key]
    if (!gas) return `
      <div style="display:flex;align-items:center;gap:4px;margin:3px 0;font-family:'Courier New',monospace;font-size:clamp(9px,1.3vw,11px)">
        <span style="width:60px;color:#000;font-size:10px">${label}</span>
        <span style="color:#888;font-style:italic;font-size:9px">unavailable</span>
      </div>`

    const pct = Math.min(100, (gas.gwei / maxGwei) * 100)
    const statusColor = gas.gwei < 20 ? '#00aa00' : gas.gwei < 60 ? '#ff8800' : '#cc0000'
    const statusText  = gas.gwei < 20 ? 'LOW' : gas.gwei < 60 ? 'MED' : 'HIGH'

    return `
      <div style="display:flex;align-items:center;gap:4px;margin:3px 0;font-family:'Courier New',monospace;font-size:clamp(9px,1.3vw,11px)">
        <span style="width:60px;color:#000;font-size:10px;font-family:'MS Sans Serif',Arial,sans-serif">${label}</span>
        <div style="flex:1;height:14px;background:#fff;border:2px solid;border-color:#0a0a0a #ffffff #ffffff #0a0a0a;box-shadow:inset 1px 1px #808080;position:relative">
          <div style="height:100%;width:${pct}%;background:${color};position:absolute;left:0;top:0"></div>
        </div>
        <span style="font-family:'Courier New',monospace;font-size:10px;width:70px;text-align:right">${key === 'solana' ? '~$0.001' : gas.gwei.toFixed(1) + ' gwei'}</span>
        <span style="font-size:9px;width:36px;text-align:center;padding:1px 2px;background:${statusColor};color:#fff;font-family:'MS Sans Serif',Arial,sans-serif">${statusText}</span>
      </div>`
  }).join('') +
  `<div style="padding:4px 0 0 0;font-family:'Courier New',monospace;font-size:9px;color:#444">
    Gas cost estimate based on 150k gas units per swap
  </div>`
}
```

- [ ] **Step 2: Commit**

```bash
git add src/ui.js
git commit -m "feat: add renderGas() to ui.js with Win98-style gas bar per chain"
```

---

### Task 4: Update computeDust() and renderTable() for net value + WAIT logic

**Files:**
- Modify: `src/app.js` — computeDust() gains gasMap parameter
- Modify: `src/ui.js` — renderTable() shows WAIT for negative net rows

- [ ] **Step 1: Update computeDust in src/app.js**

Replace the `computeDust` function:

```javascript
// gasMap: { [chain]: { gwei: number, usdCost: number } | null }
function computeDust(balances, prices, threshold, gasMap) {
  return balances
    .map(b => {
      const price = prices[b.tokenSymbol] ?? 0
      const humanAmount = b.isRentAccounts
        ? Number(b.rawBalance)
        : Number(BigInt(b.rawBalance) * 10000n / BigInt(10 ** b.decimals)) / 10000
      const usdValue = humanAmount * price
      const gasEstimate = gasMap[b.chain]?.usdCost ?? null
      const netValue = gasEstimate !== null ? usdValue - gasEstimate : usdValue
      return {
        ...b,
        humanAmount,
        usdValue,
        gasEstimate,
        netValue,
        shouldSweep: gasEstimate !== null ? netValue > 0 : true
      }
    })
    .filter(t => t.usdValue > 0 && t.usdValue < threshold)
    .sort((a, b) => b.usdValue - a.usdValue)
}
```

- [ ] **Step 2: Update renderTable in src/ui.js**

Replace the `tbody.innerHTML = dustTokens.map(...)` block inside `renderTable`. The full updated map callback:

```javascript
  tbody.innerHTML = dustTokens.map(t => {
    const bgColor = CHAIN_COLORS[t.chain] ?? '#c0c0c0'
    const balDisplay = t.isRentAccounts
      ? `${t.humanAmount} accts`
      : fmtBal(t.humanAmount)
    const label = chainLabel(t.chain)

    const gasCell = t.gasEstimate !== null
      ? `$${fmt(t.gasEstimate)}`
      : '<span style="color:#888">—</span>'

    const netCell = t.gasEstimate !== null
      ? t.shouldSweep
        ? `<span class="net-positive">+$${fmt(t.netValue)}</span>`
        : `<span class="net-negative">-$${fmt(Math.abs(t.netValue))}</span>`
      : `<span style="color:#888">$${fmt(t.usdValue)}</span>`

    const statusCell = t.shouldSweep
      ? `<span style="color:#006600;font-size:10px">&#x2705; SWEEP</span>`
      : `<span style="color:#cc0000;font-size:10px">&#x26A0; WAIT</span>`

    const rowStyle = t.shouldSweep ? '' : 'opacity:0.5'

    return `<tr style="${rowStyle}">
      <td><span class="chain-badge" style="background:${bgColor}">${escapeHtml(label)}</span></td>
      <td>${escapeHtml(t.tokenSymbol)}${t.isRentAccounts ? ' &#x1F511;' : ''}</td>
      <td>${balDisplay}</td>
      <td>$${fmt(t.usdValue)}</td>
      <td>${gasCell}</td>
      <td>${netCell}</td>
      <td>${statusCell}</td>
    </tr>`
  }).join('')
```

Also update the table header in `index.html` to add a GAS COST column between USD VALUE and NET VALUE:

In `index.html`, find the `<thead>` block and replace it:
```html
          <thead>
            <tr>
              <th>CHAIN</th>
              <th>TOKEN</th>
              <th>BALANCE</th>
              <th>USD VALUE</th>
              <th>GAS COST</th>
              <th>NET VALUE</th>
              <th>STATUS</th>
            </tr>
          </thead>
```

Also update the `tfoot.innerHTML` in `renderTable` to include the gas column:
```javascript
  tfoot.innerHTML = `<tr>
    <td colspan="3" style="font-family:'MS Sans Serif',Arial,sans-serif;font-size:10px;font-weight:bold">TOTAL</td>
    <td style="font-family:'Courier New',monospace;font-weight:bold">$${fmt(totalUSD)}</td>
    <td style="font-family:'Courier New',monospace;font-weight:bold;color:#cc0000">$${fmt(dustTokens.reduce((s,t) => s + (t.gasEstimate ?? 0), 0))}</td>
    <td style="font-family:'Courier New',monospace;font-weight:bold;color:#006600">+$${fmt(totalNet)}</td>
    <td></td>
  </tr>`
```

- [ ] **Step 3: Commit**

```bash
git add src/app.js src/ui.js index.html
git commit -m "feat: add net value calculation with gas costs, WAIT/SWEEP row logic"
```

- [ ] **Step 4: Verify in browser**

Open http://localhost:8080. Table should now show:
- GAS COST column with dollar values
- WAIT rows greyed out at 50% opacity with ⚠️ WAIT label
- SWEEP rows in green as before
- Total row shows summed gas costs

---

### Task 5: Wire fetchGasCosts into app.js init + reveal gas panel

**Files:**
- Modify: `src/app.js`
- Modify: `index.html`

- [ ] **Step 1: Import fetchGasCosts in app.js**

Add to the imports at the top of `src/app.js`:
```javascript
import { fetchGasCosts } from './gas.js'
```

- [ ] **Step 2: Update fetchAndRender in app.js**

Replace the `fetchAndRender` function body:

```javascript
async function fetchAndRender(config, applyThreshold) {
  renderStatusBar({ alchemy: 'mock', helius: 'mock', coingecko: 'live', lifi: 'pending' })
  renderLedger(getLedger())

  try {
    const balances = await fetchBalances(config.wallets)
    const symbols = [...new Set(balances.map(b => b.tokenSymbol))]

    // Fetch prices and gas in parallel — both are independent
    const [prices, gasMap] = await Promise.all([
      fetchPrices(symbols),
      fetchGasCosts(config)
    ])

    renderGas(gasMap)
    applyThreshold(config.dustThreshold, balances, prices, gasMap)
    renderStatusBar({ alchemy: 'live', helius: 'live', coingecko: 'live', lifi: 'pending' })
  } catch (err) {
    renderStatusBar({ alchemy: 'error', helius: 'error', coingecko: 'error', lifi: 'pending' })
    const tbody = document.getElementById('dust-table-body')
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#cc0000;background:#fff">Error loading data. Click Refresh to retry.</td></tr>`
    throw err
  }
}
```

- [ ] **Step 3: Update applyThreshold in setup() to pass gasMap**

In the `setup()` function, update `applyThreshold`:

```javascript
  let currentGasMap = {}

  function applyThreshold(threshold, balances, prices, gasMap) {
    if (balances !== undefined) state = { balances, prices }
    if (gasMap !== undefined) currentGasMap = gasMap
    const dustTokens = computeDust(state.balances, state.prices, threshold, currentGasMap)
    renderTable(dustTokens)
    renderTicker(dustTokens)
    document.getElementById('thresh-val').textContent = `$${threshold}`
    document.getElementById('threshold-display').textContent = `$${threshold.toFixed(2)}`
  }
```

- [ ] **Step 4: Add renderGas import to app.js**

Update the ui.js import line:
```javascript
import { renderTable, renderTicker, renderStatusBar, renderLedger, renderWallets, renderGas } from './ui.js'
```

- [ ] **Step 5: Reveal #gas-panel in index.html**

In `index.html`, find and remove the `display:none` rule for gas-panel only:

Replace:
```css
  /* Phase 2/3 panels — hidden until those phases are implemented */
  #gas-panel     { display: none; }
  #sweep-section { display: none; }
```

With:
```css
  /* Phase 3 panel — hidden until sweep is implemented */
  #sweep-section { display: none; }
```

- [ ] **Step 6: Commit**

```bash
git add src/app.js index.html
git commit -m "feat: wire gas tracker into app init, reveal gas panel"
```

- [ ] **Step 7: Verify in browser**

Open http://localhost:8080. Confirm:
- Gas Tracker panel is now visible
- Gas bars show per chain (color-coded)
- Table GAS COST column has real dollar values
- Any tokens where gas > dust value show ⚠️ WAIT (ETH mainnet likely)

---

### Task 6: Replace mock prices with live CoinGecko

**Files:**
- Modify: `src/prices.js`

CoinGecko maps token symbols to IDs. We maintain this mapping locally — it's a one-time setup. Rate limit is 30 calls/min; cache for 60s.

- [ ] **Step 1: Replace src/prices.js with live implementation**

```javascript
// Maps DustKit token symbols to CoinGecko API IDs
// Add new tokens here when expanding the supported set
const COINGECKO_IDS = {
  PEPE:  'pepe',
  GMX:   'gmx',
  USDC:  'usd-coin',
  DEGEN: 'degen-base',
  MATIC: 'matic-network',
  OP:    'optimism',
  BONK:  'bonk',
  RENT:  null,  // synthetic — fixed rate, not on CoinGecko
  ETH:   'ethereum',
  WETH:  'weth',
}

const RENT_PRICE_USD = 0.30  // per dead Solana token account (SOL rent ~0.002 SOL)

let priceCache = null
let priceCacheTime = 0
const CACHE_TTL = 60000  // 60 seconds

// PriceMap: { [tokenSymbol: string]: number }
// TODO (real): if adding many new tokens, expand COINGECKO_IDS above
export async function fetchPrices(symbols) {
  const now = Date.now()
  if (priceCache && now - priceCacheTime < CACHE_TTL) return priceCache

  const cgIds = symbols
    .map(s => COINGECKO_IDS[s])
    .filter(Boolean)
  const uniqueIds = [...new Set(cgIds)]

  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${uniqueIds.join(',')}&vs_currencies=usd`
  )
  const data = await res.json()

  const prices = {}
  for (const symbol of symbols) {
    const cgId = COINGECKO_IDS[symbol]
    if (symbol === 'RENT') {
      prices[symbol] = RENT_PRICE_USD
    } else if (cgId && data[cgId]?.usd) {
      prices[symbol] = data[cgId].usd
    } else {
      prices[symbol] = 0
    }
  }

  priceCache = prices
  priceCacheTime = now
  return prices
}
```

- [ ] **Step 2: Commit**

```bash
git add src/prices.js
git commit -m "feat: implement live CoinGecko price feed with 60s cache"
```

- [ ] **Step 3: Verify in browser console**

```javascript
import('/src/prices.js').then(m => m.fetchPrices(['PEPE','GMX','USDC','DEGEN','MATIC','OP','BONK','RENT'])).then(console.log)
```

Expected: object with all symbols mapped to current USD prices.

---

### Task 7: Replace mock balances with live Alchemy (EVM) + Helius (Solana)

**Files:**
- Modify: `src/balances.js`

Alchemy REST API (no npm SDK needed):
- Endpoint: `POST https://{network}.g.alchemy.com/v2/{apiKey}`
- Method `alchemy_getTokenBalances` returns non-zero ERC-20 balances
- Method `alchemy_getTokenMetadata` returns decimals + symbol for each contract

Helius RPC:
- Endpoint: `POST https://mainnet.helius-rpc.com/?api-key={apiKey}`
- Method `getTokenAccountsByOwner` returns all SPL token accounts

- [ ] **Step 1: Replace src/balances.js with full implementation**

```javascript
const ALCHEMY_NETWORKS = {
  eth:      'eth-mainnet',
  arbitrum: 'arb-mainnet',
  base:     'base-mainnet',
  polygon:  'polygon-mainnet',
  optimism: 'opt-mainnet',
}

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

  const nonZero = result.tokenBalances.filter(
    t => t.tokenBalance !== '0x0000000000000000000000000000000000000000000000000000000000000000'
  )
  if (!nonZero.length) return []

  // Batch metadata fetch — one call per token
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
      if (!symbol || decimals === null) return null
      // Convert hex balance to decimal string
      const rawBalance = BigInt(t.tokenBalance).toString()
      return {
        chain,
        tokenSymbol: symbol.toUpperCase(),
        contractAddress: t.contractAddress,
        rawBalance,
        decimals: decimals ?? 18,
        walletAddress
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

  return data.result.value
    .map(account => {
      const info = account.account.data.parsed.info
      const amount = info.tokenAmount
      if (amount.uiAmount === 0) return null
      return {
        chain: 'solana',
        tokenSymbol: info.mint.slice(0, 4).toUpperCase(), // fallback — override with metadata
        contractAddress: info.mint,
        rawBalance: amount.amount,
        decimals: amount.decimals,
        walletAddress
      }
    })
    .filter(Boolean)
}

// TokenBalance: { chain, tokenSymbol, contractAddress, rawBalance, decimals, walletAddress, isRentAccounts? }
export async function fetchBalances(wallets) {
  const config = window.DUSTKIT_CONFIG

  // EVM: all wallets × all chains in parallel
  const evmJobs = wallets.evm.flatMap(wallet =>
    Object.keys(ALCHEMY_NETWORKS).map(chain =>
      fetchEvmBalancesForWallet(wallet, chain, config.alchemyKey)
        .catch(err => { console.warn(`EVM ${chain} ${wallet}:`, err.message); return [] })
    )
  )

  // Solana: all wallets in parallel
  const solJobs = wallets.solana.map(wallet =>
    fetchSolanaBalances(wallet, config.heliusKey)
      .catch(err => { console.warn(`Solana ${wallet}:`, err.message); return [] })
  )

  const results = await Promise.all([...evmJobs, ...solJobs])
  return results.flat()
}
```

- [ ] **Step 2: Commit**

```bash
git add src/balances.js
git commit -m "feat: implement live Alchemy EVM + Helius Solana balance fetching"
```

- [ ] **Step 3: Verify in browser console**

```javascript
import('/src/balances.js').then(m => m.fetchBalances(window.DUSTKIT_CONFIG.wallets)).then(console.log)
```

Expected: array of TokenBalance objects with real token symbols, raw balances, and decimals.

---

### Task 8: Create src/solana-rent.js — dead account detection

**Files:**
- Create: `src/solana-rent.js`

Dead Solana token accounts are accounts with `uiAmount === 0`. Each holds ~0.002 SOL in rent (~$0.30). `solana-rent.js` finds them and returns a summary for display.

- [ ] **Step 1: Create src/solana-rent.js**

```javascript
const LAMPORTS_PER_SOL = 1_000_000_000

// Fetches all zero-balance token accounts (dead accounts) for a Solana wallet.
// Each dead account has locked SOL rent that can be reclaimed by closing it.
// Returns: { accountCount, lamports, estimatedSOL, estimatedUSD }
// Phase 3: closing accounts via Phantom wallet signing
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

  const deadAccounts = data.result.value.filter(account => {
    const amount = account.account.data.parsed.info.tokenAmount
    return amount.uiAmount === 0
  })

  const lamports = deadAccounts.reduce(
    (sum, a) => sum + a.account.lamports, 0
  )
  const estimatedSOL = lamports / LAMPORTS_PER_SOL
  const estimatedUSD = estimatedSOL * solPriceUSD

  return {
    accountCount: deadAccounts.length,
    lamports,
    estimatedSOL,
    estimatedUSD,
    // Phase 3: pass these pubkeys to the close-account instruction
    accountPubkeys: deadAccounts.map(a => a.pubkey)
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/solana-rent.js
git commit -m "feat: add solana-rent.js for dead token account detection and rent valuation"
```

---

### Task 9: Wire solana-rent into app.js and surface in UI

**Files:**
- Modify: `src/app.js`
- Modify: `src/ui.js`

- [ ] **Step 1: Import fetchRentReclaimable in app.js**

Add to imports:
```javascript
import { fetchRentReclaimable } from './solana-rent.js'
```

- [ ] **Step 2: Wire into fetchAndRender in app.js**

Inside the `try` block of `fetchAndRender`, after `renderGas(gasMap)`, add:

```javascript
    // Fetch Solana rent data for each Solana wallet
    const solPriceUSD = prices['SOL'] ?? prices['WSOL'] ?? 0
    const rentResults = await Promise.allSettled(
      config.wallets.solana.map(wallet =>
        fetchRentReclaimable(wallet, config.heliusKey, solPriceUSD)
      )
    )
    const rentSummary = rentResults
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value)
      .reduce(
        (acc, r) => ({
          accountCount: acc.accountCount + r.accountCount,
          estimatedUSD: acc.estimatedUSD + r.estimatedUSD
        }),
        { accountCount: 0, estimatedUSD: 0 }
      )
    renderSolanaRent(rentSummary)
```

Note: SOL price needs to be in the prices map. Add `'SOL'` to the COINGECKO_IDS in prices.js:
```javascript
  SOL:   'solana',
```

- [ ] **Step 3: Add renderSolanaRent to ui.js**

Add after `renderGas`:

```javascript
// rentSummary: { accountCount: number, estimatedUSD: number }
export function renderSolanaRent(rentSummary) {
  // Find or create the rent reclaim banner below the dust table panel
  let banner = document.getElementById('rent-banner')
  if (!banner) {
    banner = document.createElement('div')
    banner.id = 'rent-banner'
    banner.className = 'panel'
    banner.style.marginBottom = '4px'
    const dustPanel = document.querySelector('.panel:nth-of-type(2)')
    if (dustPanel) dustPanel.after(banner)
  }

  if (!rentSummary.accountCount) {
    banner.style.display = 'none'
    return
  }

  banner.style.display = ''
  banner.innerHTML = `
    <div class="panel-title">
      <span>&#x1F511; Solana Rent Reclaimable</span>
      <span style="font-size:9px;font-weight:normal">PHASE 3: reclaim via Phantom</span>
    </div>
    <div class="panel-content" style="font-family:'Courier New',monospace;font-size:11px;color:#006600;font-weight:bold">
      ${rentSummary.accountCount} dead token accounts &rarr;
      <strong>~$${fmt(rentSummary.estimatedUSD)}</strong> reclaimable SOL rent
    </div>`
}
```

- [ ] **Step 4: Add renderSolanaRent to app.js import**

Update the ui.js import:
```javascript
import { renderTable, renderTicker, renderStatusBar, renderLedger, renderWallets, renderGas, renderSolanaRent } from './ui.js'
```

- [ ] **Step 5: Commit**

```bash
git add src/app.js src/ui.js src/prices.js
git commit -m "feat: wire Solana rent reclaim detection and surface count + value in UI"
```

- [ ] **Step 6: End-to-end browser verification**

Open http://localhost:8080. Verify:
1. Table shows real token balances from your actual wallets
2. USD values match current market prices (CoinGecko)
3. Gas cost column shows real per-chain gas costs
4. ETH mainnet tokens likely show ⚠️ WAIT (gas usually too high)
5. L2 tokens (ARB, BASE, OP) likely show ✅ SWEEP
6. Gas Tracker panel shows live gas bars for all chains
7. Solana rent banner appears if you have dead token accounts
8. Status bar shows Live badges (not MOCK)

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "feat: Phase 2 complete — live APIs, gas costs, net value, WAIT/SWEEP logic"
git push origin master
```
