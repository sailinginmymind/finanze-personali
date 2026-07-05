import { useState, useEffect, useRef } from 'react'
import { useTransactions } from '../context/TransactionContext'
import { useCategories } from '../context/CategoriesContext'
import { formatNumber } from '../utils/format'

export default function TransactionList({ transactions }) {
  const { deleteTransaction } = useTransactions()
  const { categories } = useCategories()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const modalRef = useRef(null)

  useEffect(() => {
    if (deleteTarget) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [deleteTarget])

  const handleDeleteRequest = (id) => setDeleteTarget(id)
  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteTransaction(deleteTarget)
      setDeleteTarget(null)
    }
  }
  const handleDeleteCancel = () => setDeleteTarget(null)

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) setDeleteTarget(null)
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 sm:py-16 text-[var(--text-secondary)]">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <span className="text-3xl sm:text-4xl opacity-50">📊</span>
        </div>
        <p className="text-base sm:text-lg font-medium text-[var(--text-secondary)]">Nessuna transazione</p>
        <p className="text-xs sm:text-sm mt-1">Prova ad aggiungerne una o cambia filtro</p>
      </div>
    )
  }

  // Raggruppa per data (YYYY-MM-DD)
  const grouped = transactions.reduce((acc, t) => {
    const date = t.date
    if (!acc[date]) acc[date] = []
    acc[date].push(t)
    return acc
  }, {})
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  // Mese corrente per evidenziare l'intestazione
  const today = new Date()
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

  return (
    <>
      <div className="space-y-4">
        {sortedDates.map(date => {
          const month = date.substring(0, 7)
          const isCurrentMonth = month === currentMonth
          const dateObj = new Date(date)
          const day = dateObj.getDate()
          const monthName = dateObj.toLocaleDateString('it-IT', { month: 'short' })
          const weekday = dateObj.toLocaleDateString('it-IT', { weekday: 'short' })
          const year = dateObj.getFullYear()

          return (
            <div key={date}>
              <p className={`text-xs font-semibold mb-2 ml-2 uppercase tracking-wider ${
                isCurrentMonth ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'
              }`}>
                {weekday} {day} {monthName} {year}
              </p>
              <div className="space-y-2">
                {grouped[date].map(t => {
                  const catList = categories[t.type] || []
                  const cat = catList.find(c => c.name === t.category)
                  const emoji = cat?.emoji || (t.type === 'expense' ? '📌' : '💰')
                  const color = cat?.color || '#64748B'
                  return (
                    <div
                      key={t.id}
                      className="group flex items-center justify-between bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-3 sm:p-4 hover:border-[var(--text-secondary)]/30 hover:bg-[var(--bg-secondary)]/80 transition-all duration-300 active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: `${color}20` }}>
                          <span>{emoji}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--text-primary)] text-sm sm:text-base truncate">{t.note || t.category}</p>
                          <p className="text-xs text-[var(--text-secondary)]">{t.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <span className={`font-bold text-sm sm:text-base ${t.type === 'expense' ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                          {t.type === 'expense' ? '-' : '+'} €{formatNumber(t.amount)}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteRequest(t.id); }}
                          className="text-slate-700 hover:text-[var(--danger)] transition-colors text-lg p-2 -mr-2 sm:opacity-0 sm:group-hover:opacity-100"
                          aria-label="Elimina"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={handleOverlayClick}>
          <div ref={modalRef} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-zoom-in">
            <h3 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">Conferma eliminazione</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-6">
              Sei sicuro di voler eliminare questa transazione? L'operazione non può essere annullata.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={handleDeleteCancel} className="px-4 py-2 rounded-full text-sm font-medium bg-white/5 text-[var(--text-primary)] hover:bg-white/10 transition-colors">
                Annulla
              </button>
              <button onClick={handleDeleteConfirm} className="px-4 py-2 rounded-full text-sm font-medium bg-[var(--danger)]/20 text-[var(--danger)] hover:bg-[var(--danger)]/30 transition-colors">
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}