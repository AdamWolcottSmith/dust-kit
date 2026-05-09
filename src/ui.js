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
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#888;font-style:italic;background:#fff">No dust found below threshold.</td></tr>'
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
    const label = chainLabel(t.chain)

    const gasCell = t.gasEstimate !== null
      ? `$${fmt(t.gasEstimate)}`
      : '<span style="color:#888">—</span>'

    const netCell = t.gasEstimate !== null
      ? t.shouldSweep
        ? `<span class="net-positive">+$${fmt(t.netValue)}</span>`
        : `<span class="net-negative">-$${fmt(Math.abs(t.netValue))}</span>`
      : `<span style="color:#888">$${fmt(t.usdValue)}</span>`

    const statusCell = t.gasEstimate === null
      ? `<span style="color:#888;font-size:10px">&#x2753; UNKNOWN</span>`
      : t.shouldSweep
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

  tfoot.innerHTML = `<tr>
    <td colspan="3" style="font-family:'MS Sans Serif',Arial,sans-serif;font-size:10px;font-weight:bold">TOTAL</td>
    <td style="font-family:'Courier New',monospace;font-weight:bold">$${fmt(totalUSD)}</td>
    <td style="font-family:'Courier New',monospace;font-weight:bold;color:#cc0000">$${fmt(dustTokens.reduce((s,t) => s + (t.gasEstimate ?? 0), 0))}</td>
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

// rentSummary: { accountCount: number, estimatedUSD: number }
export function renderSolanaRent(rentSummary) {
  let banner = document.getElementById('rent-banner')
  if (!banner) {
    banner = document.createElement('div')
    banner.id = 'rent-banner'
    banner.className = 'panel'
    banner.style.cssText = 'margin-bottom:4px'
    const dustPanel = document.querySelector('#dust-panel')
    if (dustPanel) dustPanel.after(banner)
  }

  if (!rentSummary || !rentSummary.accountCount) {
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
