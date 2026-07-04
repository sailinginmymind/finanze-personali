import { useTransactions } from '../context/TransactionContext'
import { useCategories } from '../context/CategoriesContext'

export default function TransactionList({ transactions }) {
  const { deleteTransaction } = useTransactions()
  const { categories } = useCategories()

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 sm:py-16 text-slate-600">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <span className="text-3xl sm:text-4xl opacity-50">📊</span>
        </div>
        <p className="text-base sm:text-lg font-medium text-slate-500">Nessuna transazione</p>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">Prova ad aggiungerne una o cambia filtro</p>
      </div>
    )
  }

  const grouped = transactions.reduce((acc, t) => {
    const date = t.date
    if (!acc[date]) acc[date] = []
    acc[date].push(t)
    return acc
  }, {})
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="space-y-4">
      {sortedDates.map(date => (
        <div key={date}>
          <p className="text-xs font-semibold text-slate-500 mb-2 ml-2 uppercase tracking-wider">
            {new Date(date).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}
          </p>
          <div className="space-y-2">
            {grouped[date].map(t => {
              const catList = categories[t.type] || []
              const cat = catList.find(c => c.name === t.category)
              const emoji = cat?.emoji || (t.type === 'expense' ? '📌' : '💰')
              const color = cat?.color || '#64748B'
              return (
                <div key={t.id} className="group flex items-center justify-between bg-[#0d1321] border border-white/5 rounded-2xl p-3 sm:p-4 hover:border-white/10 hover:bg-[#111827] transition-all duration-300 active:scale-[0.98]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: `${color}20` }}>
                      <span>{emoji}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white text-sm sm:text-base truncate">{t.note || t.category}</p>
                      <p className="text-xs text-slate-500">{t.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className={`font-bold text-sm sm:text-base ${t.type === 'expense' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {t.type === 'expense' ? '-' : '+'}€{t.amount.toFixed(2)}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); deleteTransaction(t.id) }} className="text-slate-700 hover:text-rose-400 transition-colors text-lg p-2 -mr-2 sm:opacity-0 sm:group-hover:opacity-100" aria-label="Elimina">🗑️</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}