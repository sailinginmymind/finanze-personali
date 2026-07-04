// TransactionsPage.jsx
import { useState, useMemo } from 'react'
import { useTransactions } from '../context/TransactionContext'
import TransactionList from '../components/TransactionList'
import CategoryManager from '../components/CategoryManager'

export default function TransactionsPage() {
  const { transactions } = useTransactions()
  const [filterType, setFilterType] = useState('all')
  const [search, setSearch] = useState('')
  const [showCategories, setShowCategories] = useState(false)

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false
      if (search && !t.note.toLowerCase().includes(search.toLowerCase()) && !t.category.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [transactions, filterType, search])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Transazioni</h2>
        <button onClick={() => setShowCategories(true)} className="text-xs bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] rounded-full px-3 py-1.5 transition-all">Gestisci categorie</button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {['all', 'expense', 'income'].map(type => (
          <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${filterType === type ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30' : 'bg-white/5 text-[var(--text-secondary)] border border-[var(--border)]'}`}>{type === 'all' ? 'Tutti' : type === 'expense' ? 'Spese' : 'Entrate'}</button>
        ))}
        <input type="text" placeholder="Cerca..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-[150px] bg-white/5 border border-[var(--border)] rounded-full px-4 py-1.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50" />
      </div>
      <TransactionList transactions={filtered} />
      {showCategories && <CategoryManager onClose={() => setShowCategories(false)} />}
    </div>
  )
}