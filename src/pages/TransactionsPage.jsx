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
        <h2 className="text-lg font-bold">Transazioni</h2>
        <button onClick={() => setShowCategories(true)} className="text-xs bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 rounded-full px-3 py-1.5 transition-all">Gestisci categorie</button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {['all', 'expense', 'income'].map(type => (
          <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${filterType === type ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/5 text-slate-400 border border-white/5'}`}>{type === 'all' ? 'Tutti' : type === 'expense' ? 'Spese' : 'Entrate'}</button>
        ))}
        <input type="text" placeholder="Cerca..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-[150px] bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
      </div>
      <TransactionList transactions={filtered} />
      {showCategories && <CategoryManager onClose={() => setShowCategories(false)} />}
    </div>
  )
}