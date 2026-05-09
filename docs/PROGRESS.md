# DustKit — Build Progress

## Phase 1: See It ✅ COMPLETE

**Shipped:** 2026-05-06
**GitHub:** https://github.com/AdamWolcottSmith/dust-kit
**Commits:** 12 (aceeca3 → b82c4eb)

### What's working
- Win98/Geocities UI shell — full design from mockup
- Mock token balances across all 6 chains (ETH, ARB, BASE, POL, OP, SOL)
- USD values computed via mock CoinGecko prices
- Dust threshold slider — live filter, no re-fetch
- Dust Ledger — localStorage, real from day one
- Status bar with MOCK/PENDING badges
- Phase 2/3 panels in HTML, hidden via CSS

### Files delivered
```
index.html          ← Win98 shell, loads config.js + src/app.js
config.js           ← gitignored — your wallet addresses
config.example.js   ← safe template
src/
  app.js            ← orchestrator: setup(), fetchAndRender(), computeDust()
  balances.js       ← fetchBalances() — mock, Alchemy/Helius TODO
  prices.js         ← fetchPrices() — mock, CoinGecko TODO
  gas.js            ← Phase 2 stub
  sweep.js          ← Phase 3 stub
  ledger.js         ← localStorage read/write
  ui.js             ← renderTable, renderTicker, renderStatusBar, renderLedger, renderWallets
  mock/
    balances.mock.js
    prices.mock.js
docs/
  superpowers/
    specs/2026-05-06-phase1-architecture-design.md
    plans/2026-05-06-phase1-implementation.md
```

### To run locally
```bash
python3 -m http.server 8080
# open http://localhost:8080
```

---

## Phase 2: Evaluate It ✅ COMPLETE

**Shipped:** 2026-05-08
**Commits:** 16 (aa99227 → d8f136d)

### What's working
- Live Alchemy EVM balances — 3 wallets × 5 chains in parallel
- Live Helius Solana balances — SPL tokens priced via Jupiter Price API
- Live CoinGecko prices — 60s cache, 20+ token mapping
- Live Etherscan V2 gas tracker — single key, all EVM chains via chainid param
- Polygon gas correctly uses MATIC/USD (not ETH/USD)
- Net value calc: `dustUSD − gasCostUSD` in `computeDust()`
- WAIT rows: 50% opacity + ⚠️ WAIT when netValue ≤ 0
- UNKNOWN rows: when gas fetch fails (fail-closed, no false sweep)
- Gas Tracker panel revealed — Win98 gas bars per chain
- Solana rent reclaim detection — dead account count + USD value in banner
- Status bar shows Live badges for all Phase 2 APIs

### Files delivered
```
src/
  gas.js          ← Etherscan V2 gas tracker (MATIC/ETH split)
  prices.js       ← CoinGecko + Jupiter Price API (60s cache)
  balances.js     ← Alchemy EVM + Helius Solana (live)
  solana-rent.js  ← Dead Solana account detection
  ui.js           ← renderGas(), renderSolanaRent(), 7-col table
  app.js          ← gas + rent wired into fetchAndRender()
```

---

## Phase 3: Do It ⬜

- [ ] Li.Fi SDK → swap routing per token
- [ ] MetaMask/Phantom signing flow
- [ ] Solana rent reclaim execution
- [ ] Reveal `#sweep-section` in UI
- [ ] Sweep confirmation modal
- [ ] Append sweep results to Dust Ledger

---

## Phase 4: Polish ⬜

- [ ] Sweep Share Card (html2canvas PNG)
- [ ] Route Intelligence (local Li.Fi route logging)
- [ ] Gas timing indicator (green/yellow/red)
- [ ] Chain toggles
- [ ] Token blocklist
- [ ] "Total Recovered All-Time" counter
- [ ] Sweep Profile: JSON export/import
