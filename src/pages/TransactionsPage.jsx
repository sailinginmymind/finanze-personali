import { useState, useMemo } from 'react'
import { useTransactions } from '../context/TransactionContext'
import TransactionList from '../components/TransactionList'

export default function TransactionsPage() {
  const { transactions } = useTransactions()
  const [filterType, setFilterType] = useState('all')
  const [search, setSearch] = useState('')
  const [loadedMonths, setLoadedMonths] = useState(1)

  const availableMonths = useMemo(() => {
    const monthsSet = new Set()
    transactions.forEach(t => {
      const month = t.date.substring(0, 7)
      monthsSet.add(month)
    })
    return Array.from(monthsSet).sort((a, b) => b.localeCompare(a))
  }, [transactions])

  const filteredByTypeAndSearch = useMemo(() => {
    return transactions.filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false
      if (search && !t.note.toLowerCase().includes(search.toLowerCase()) && !t.category.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [transactions, filterType, search])

  const monthsToShow = availableMonths.slice(0, loadedMonths)

  const displayedTransactions = useMemo(() => {
    if (monthsToShow.length === 0) return []
    return filteredByTypeAndSearch.filter(t => {
      const month = t.date.substring(0, 7)
      return monthsToShow.includes(month)
    })
  }, [filteredByTypeAndSearch, monthsToShow])

  const hasMoreMonths = loadedMonths < availableMonths.length
  const hasNoTransactions = displayedTransactions.length === 0

  const loadNextMonth = () => {
    if (hasMoreMonths) {
      setLoadedMonths(prev => prev + 1)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">Transazioni</h2>

      {/* Filtri + ricerca */}
      <div className="flex gap-2 flex-wrap items-center">
        {['all', 'expense', 'income'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterType === type
                ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30'
                : 'bg-white/5 text-[var(--text-secondary)] border border-[var(--border)]'
            }`}
          >
            {type === 'all' ? 'Tutti' : type === 'expense' ? 'Spese' : 'Entrate'}
          </button>
        ))}

        <input
          type="text"
          placeholder="Cerca..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[120px] bg-white/5 border border-[var(--border)] rounded-full px-4 py-1.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
        />
      </div>

      {/* Indicatore dei mesi caricati */}
      {!hasNoTransactions && (
        <div className="text-xs text-[var(--text-secondary)] text-center">
          Mostrando {monthsToShow.length} di {availableMonths.length} mesi
        </div>
      )}

      {/* Lista transazioni */}
      <TransactionList transactions={displayedTransactions} />

      {/* Pulsante "Carica mese precedente" */}
      {hasMoreMonths && !hasNoTransactions && (
        <div className="flex justify-center pt-2 pb-4">
          <button
            onClick={loadNextMonth}
            className="px-5 py-2.5 rounded-full text-sm font-medium bg-white/5 border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-all active:scale-95"
          >
            Carica anche {availableMonths[loadedMonths]?.replace('-', ' ')} ↗
          </button>
        </div>
      )}

      {/* Se sono stati caricati tutti i mesi, mostra un messaggio */}
      {!hasMoreMonths && !hasNoTransactions && availableMonths.length > 0 && (
        <div className="text-center text-xs text-[var(--text-secondary)] py-4">
          ✅ Tutte le transazioni caricate ({availableMonths.length} mesi)
        </div>
      )}
    </div>
  )
}