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

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const CHAIN_LABELS = { arbitrum: 'ARB', optimism: 'OP', polygon: 'POL' }
function chainLabel(chain) {
  return CHAIN_LABELS[chain] ?? chain.toUpperCase()
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
    const label = escapeHtml(chainLabel(t.chain))

    return `<tr>
      <td><span class="chain-badge" style="background:${bgColor}">${label}</span></td>
      <td>${escapeHtml(t.tokenSymbol)}${t.isRentAccounts ? ' &#x1F511;' : ''}</td>
      <td>${balDisplay}</td>
      <td>$${fmt(t.usdValue)}</td>
      <td class="net-positive">+$${fmt(t.netValue)}</td>
      <td><span style="color:#006600;font-size:10px">&#x2705; SWEEP</span></td><!-- Phase 2: replace with SWEEP/WAIT based on netValue > 0 -->
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
    return `<span>${chainLabel(chain)}: <span class="tick-good">$${fmt(chainTotal)}</span></span>`
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
  wallets.evm.forEach((addr, i) => {
    const el = document.getElementById(`wallet-evm-${i}`)
    if (el) el.value = addr
  })
  wallets.solana.forEach((addr, i) => {
    const el = document.getElementById(`wallet-sol-${i}`)
    if (el) el.value = addr
  })
}
