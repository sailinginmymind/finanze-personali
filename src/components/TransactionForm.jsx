import { useState, useEffect, useRef } from 'react'
import { useTransactions } from '../context/TransactionContext'
import { useCategories } from '../context/CategoriesContext'

export default function TransactionForm({ onClose }) {
  const { addTransaction } = useTransactions()
  const { categories } = useCategories()
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: categories.expense[0]?.name || 'Altro',
    date: new Date().toISOString().slice(0, 10),
    note: ''
  })
  const modalRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const currentCategories = formData.type === 'expense' ? categories.expense : categories.income

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.amount || parseFloat(formData.amount) <= 0) return
    addTransaction({ ...formData, amount: parseFloat(formData.amount) })
    onClose()
  }

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4" onClick={handleOverlayClick}>
      <div
        ref={modalRef}
        // overflow-x-hidden impedisce qualsiasi sconfinamento orizzontale
        className="w-full sm:max-w-md bg-[#0d1321]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-black/40 max-h-[90vh] overflow-y-auto overflow-x-hidden animate-zoom-in"
      >
        <div className="flex justify-between items-center mb-4 sm:mb-5">
          <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">Nuova Transazione</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none transition">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="flex gap-1.5 sm:gap-2 p-1 bg-white/5 rounded-full">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense', category: categories.expense[0]?.name || 'Altro' })}
              className={`flex-1 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-all ${
                formData.type === 'expense' ? 'bg-rose-500/20 text-rose-400 shadow-sm' : 'text-slate-500 hover:text-white'
              }`}
            >
              💸 Spesa
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income', category: categories.income[0]?.name || 'Altro' })}
              className={`flex-1 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-all ${
                formData.type === 'income' ? 'bg-emerald-500/20 text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-white'
              }`}
            >
              💰 Entrata
            </button>
          </div>

          {/* Importo */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 ml-1">Importo</label>
            <input
              type="number" step="0.01" min="0" required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              className="w-full min-w-0 bg-white/5 border border-white/10 rounded-xl px-2.5 sm:px-3 py-2.5 sm:py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm sm:text-base"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 ml-1">Categoria</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full min-w-0 bg-white/5 border border-white/10 rounded-xl px-2.5 sm:px-3 py-2.5 sm:py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all appearance-none text-sm sm:text-base"
            >
              {currentCategories.map(cat => (
                <option key={cat.name} value={cat.name}>
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Data – l'input incriminato: riduciamo il padding e aggiungiamo min-w-0 */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 ml-1">Data</label>
            <input
              type="date" required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full min-w-0 bg-white/5 border border-white/10 rounded-xl px-2.5 sm:px-3 py-2.5 sm:py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm sm:text-base"
            />
          </div>

          {/* Nota */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 ml-1">Nota</label>
            <input
              type="text"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Dettaglio..."
              className="w-full min-w-0 bg-white/5 border border-white/10 rounded-xl px-2.5 sm:px-3 py-2.5 sm:py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm sm:text-base"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#060b14] font-bold py-2.5 sm:py-3 rounded-full transition-all active:scale-95 shadow-lg shadow-amber-500/25 text-sm sm:text-base"
          >
            Salva
          </button>
        </form>
      </div>
    </div>
  )
}