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
