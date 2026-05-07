# 🧹 CLAUDE.md — DustKit Dev Guide
> This file is for Claude Code. Read it fully before touching anything.

---

## What Is DustKit?

DustKit is a **non-custodial, local-first web app** that scans EVM wallets and Solana for token balances below a user-defined "dust" threshold, calculates net recoverable value after gas costs, and sweeps everything into a single master wallet — without ever touching private keys.

**Current phase:** Personal use only. One user. No backend. No auth. No deployment.
**Future phase:** Public freemium app if the personal tool proves useful.

**Core promise:** *"Here's exactly how much you're leaving on the table. One button to clean it up — your keys never leave your wallet."*

**PMF Score:** 8.6/10 (validated via idearalph)
**Full PRD:** `../Dropbox/Master Of Reality/Blockchain & Web3/Active/dust-kit/DUSTKIT_PRD.md`

---

## The Golden Rule

> **NEVER request, store, log, transmit, or touch private keys. Ever.**
> All transaction signing happens via MetaMask / Phantom injected providers.
> DustKit is read-only until the user explicitly clicks Sweep — then it only builds and routes the transaction. The wallet signs it.

---

## Tech Stack

### MVP (Current)
```
index.html          — single file, vanilla JS, no framework
Alchemy API         — EVM token balances (multi-chain)
Helius API          — Solana balances + token account rent reclaim
Li.Fi SDK           — cross-chain swap routing (no API key required)
CoinGecko API       — token prices (free tier, no key required)
Etherscan Gas API   — live gas tracking per chain
html2canvas         — Sweep Share Card PNG generation (future)
```

### API Keys (personal use — never commit to git)
- Store in a `config.js` file that is `.gitignore`d
- Template provided in `config.example.js`
- Keys needed: Alchemy, Helius, Etherscan
- Li.Fi and CoinGecko need no keys

### Future Public Stack
```
React + Vite + Tailwind CSS
Wagmi/Viem          — EVM wallet connection
@solana/wallet-adapter — Solana wallet connection
Vercel              — static deploy (free tier)
Supabase            — Pro tier auth + scheduled sweeps
Plausible           — privacy-first analytics
```

---

## Project Structure

```
dust-kit/
├── CLAUDE.md                    ← you are here
├── index.html                   ← MVP entry point (single file)
├── config.js                    ← API keys (gitignored)
├── config.example.js            ← template, safe to commit
├── dustkit-design-mockup.html   ← visual design reference
├── /src
│   ├── balances.js              ← Alchemy + Helius balance fetching
│   ├── prices.js                ← CoinGecko price feed
│   ├── gas.js                   ← Etherscan gas tracker
│   ├── sweep.js                 ← Li.Fi routing + tx building
│   ├── solana-rent.js           ← Helius rent reclaim module
│   ├── ledger.js                ← local JSON sweep history
│   └── sharecard.js             ← html2canvas share card generator
├── /assets
│   ├── broom.gif                ← mascot (low-res, <20kb)
│   └── bg-stars.gif             ← tiled starfield bg (optional)
└── /docs
    └── DUSTKIT_PRD.md           ← copy of PRD for reference
```

---

## Core Features (Build Order)

### Phase 1 — See It ✅ Build this first
- [ ] Hardcoded wallet addresses in `config.js`
- [ ] Alchemy API → EVM token balances (ETH, Base, Arbitrum, Polygon, Optimism)
- [ ] Helius API → Solana SPL token balances
- [ ] CoinGecko → USD value per token
- [ ] Render balance table: Chain / Token / Balance / USD
- [ ] Dust threshold slider (default $5)
- [ ] Filter table to only show tokens below threshold

### Phase 2 — Evaluate It
- [ ] Etherscan Gas API → gas cost per chain
- [ ] Net value calc: `Dust USD − Gas = Net Recoverable`
- [ ] Color-code rows: SWEEP (green) / WAIT (red/greyed)
- [ ] Never show Sweep button if all nets are negative
- [ ] Helius → list dead Solana token accounts + locked rent

### Phase 3 — Do It
- [ ] Li.Fi SDK integration → find best swap route per token
- [ ] Build transaction → open MetaMask/Phantom for signing
- [ ] Solana rent reclaim → close dead accounts, recover SOL
- [ ] Dust Ledger → write sweep result to localStorage as JSON
- [ ] Chain toggles (include/exclude chains)
- [ ] Token blocklist (never sweep specific tokens)

### Phase 4 — Polish
- [ ] Sweep Profile: export/import JSON config
- [ ] Sweep Share Card: html2canvas PNG after successful sweep
- [ ] Route Intelligence: log which Li.Fi routes netted best results
- [ ] Gas timing indicator (green/yellow/red with gwei tooltip)
- [ ] "Total Recovered All-Time" counter on dashboard

---

## Design System — STRICT RULES

DustKit uses a **Web 1.0 / Windows 98 / Geocities** aesthetic.
These rules are non-negotiable for the visual layer.

### Layout Rules
- **Use `<table>` for ALL layouts.** Use `<div>` sparingly and only when a table genuinely cannot do the job.
- **No CSS resets.** Let browser defaults breathe. Build on top of them.
- **Use HTML attributes over CSS** for borders, alignment, spacing where possible (e.g. `cellpadding`, `border`, `align`, `bgcolor` on tables).
- Design for **800×600 base ratio**. Use relative units (`%`, `em`) so it scales to modern screens.
- Must be **mobile-friendly** — the Win98 window fills the screen on narrow viewports. Retro aesthetic, modern usability.

### Visual Rules
- **Beveled edges everywhere** on panels, buttons, and borders:
  ```css
  border-color: #ffffff #0a0a0a #0a0a0a #ffffff; /* raised */
  border-color: #0a0a0a #ffffff #ffffff #0a0a0a; /* sunken */
  box-shadow: inset -1px -1px #808080, inset 1px 1px #dfdfdf;
  ```
- **Non-blurred drop shadows only.** Use `box-shadow: 3px 3px 0 #000` — never `blur()`.
- **All images must be low-res GIFs** under 20kb. Pixel art preferred.
- **`<marquee>` tag is required** for live data (gas prices, dust totals). Not for decoration only.
- **98.css** is the base UI library: `https://unpkg.com/98.css`

### Typography Rules
- **System fonts only:**
  - UI chrome: `"MS Sans Serif", Arial, sans-serif`
  - Data/terminal: `"Courier New", Courier, monospace`
  - Headers: `"Times New Roman", Times, serif`
  - Never use: Inter, Roboto, Space Grotesk, or any Google Font
- **Fancy/gradient text** (logo, section titles): Use FlamingText PNGs from `https://flamingtext.com` or simulate with `text-shadow` stacking.

### Color Palette (Win98 Silver)
```
Background (desktop):  #000010 (deep space)
Window chrome:         #c0c0c0 (classic silver)
Title bar:             linear-gradient(90deg, #000080, #1084d0)
Active text:           #000080 (navy)
Terminal BG:           #000000
Terminal text:         #00ff41 (matrix green)
Positive value:        #006600
Negative value:        #cc0000
Warning:               #ff8800
```

### Functional Constraints (Design NEVER blocks these)
- Gas math is always shown before any sweep action
- Rows with negative net value are visually blocked (greyed, WAIT label) — no sweep button for those rows
- Confirmation details always visible before signing: chain name, amount, destination wallet
- MIDI/audio is **muted by default** — opt-in only via toolbar button
- No auto-popups, no blinking text on data rows
- Mobile layout: outer Geocities shell collapses, Win98 window fills viewport

---

## Key Business Logic

### Net Value Calculation
```javascript
// Never allow a sweep where this is negative
const netValue = (dustUSD - gasCostUSD);
const shouldSweep = netValue > 0;
```

### Dust Threshold
```javascript
// Token qualifies as dust if USD value is below threshold
const isDust = (tokenUSD < config.dustThreshold); // default: 5.00
```

### Sweep Safety Checks (run before EVERY sweep)
1. Net value > 0 for all included tokens
2. Destination is master wallet address (not a contract)
3. User has explicitly clicked Sweep (no auto-sweep)
4. MetaMask/Phantom is connected and unlocked
5. Confirm modal shown with full breakdown

### Solana Rent Reclaim Logic
```javascript
// Helius: fetch all token accounts with zero balance
// Each closed account returns ~0.002 SOL (~$0.30) in rent
// Close all → net is almost always positive (fee ~$0.001)
// Show count: "68 dead accounts → ~$18.30 reclaimable"
```

---

## API Reference

### Alchemy — EVM Balances
```javascript
// Endpoint: alchemy_getTokenBalances
// Chains: eth-mainnet, arb-mainnet, base-mainnet, opt-mainnet, polygon-mainnet
// Returns: array of { contractAddress, tokenBalance }
// Rate limit: 300M compute units/mo free tier
```

### Helius — Solana
```javascript
// Balance: getTokenAccountsByOwner (native Solana RPC via Helius)
// Rent reclaim: getTokenAccountsByOwner (filter zeroes) → closeAccount
// Rate limit: 100k requests/mo free tier
```

### Li.Fi SDK — Swap Routing
```javascript
// No API key required
// import { getRoutes, executeRoute } from '@lifi/sdk'
// getRoutes({ fromChain, toChain, fromToken, toToken, fromAmount })
// Returns best route with estimated output and gas
```

### CoinGecko — Prices
```javascript
// Endpoint: /simple/price?ids=TOKEN_ID&vs_currencies=usd
// No key required for basic use
// Rate limit: 30 calls/min — cache results for 60s
```

### Etherscan Gas Tracker
```javascript
// Endpoint: /api?module=gastracker&action=gasoracle
// Returns: SafeGasPrice, ProposeGasPrice, FastGasPrice (gwei)
// Rate limit: 5 calls/sec free tier
```

---

## Git Rules

```
.gitignore must include:
  config.js         ← API keys
  .env
  node_modules/
  .DS_Store

Never commit:
  - Any private keys (obviously)
  - Any wallet addresses in source (use config.js)
  - Any API keys
```

---

## Linked Resources

- **Full PRD:** `../Dropbox/Master Of Reality/Blockchain & Web3/Active/dust-kit/DUSTKIT_PRD.md`
- **Design mockup:** `dustkit-design-mockup.html` (open in browser)
- **98.css docs:** https://jdan.github.io/98.css/
- **Li.Fi SDK:** https://docs.li.fi/integrate-li.fi-sdk
- **Alchemy docs:** https://docs.alchemy.com/reference/token-api-quickstart
- **Helius docs:** https://docs.helius.dev/
- **FlamingText:** https://flamingtext.com/Fire-Logos

---

## Notes From Adam

- Personal use first. Build it for yourself. If it works, then we talk public.
- When in doubt, make it work before making it pretty.
- The gas math is the product. If the gas math is wrong, everything is wrong.
- SOL rent reclaim is an underrated feature — surface it prominently.
- The Dust Ledger "Total Recovered" counter is the north star metric.

---

*CLAUDE.md v1.0 — DustKit — Generated May 2026*
*Non-custodial since day one.*
