import { useState, useEffect, useRef } from 'react'
import { useCategories } from '../context/CategoriesContext'
import { useBudgets } from '../context/BudgetContext'

export default function BudgetManagerModal({ onClose }) {
  const { categories } = useCategories()
  const { getMonthBudgets, setBudget } = useBudgets()
  const [budgets, setBudgets] = useState({})
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [applyToAllMonths, setApplyToAllMonths] = useState(false)
  const modalRef = useRef(null)

  // Mese corrente come stringa "YYYY-MM"
  const todayStr = (() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })()

  // Genera una lista di mesi: da 6 mesi fa a 12 mesi nel futuro
  const months = []
  const today = new Date()
  const startOffset = -6
  const endOffset = 12
  for (let i = startOffset; i <= endOffset; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1)
    const year = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const value = `${year}-${m}`
    months.push({
      value,
      label: d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }),
      isCurrent: value === todayStr,
      isFuture: d > today
    })
  }

  // Indice del mese corrente nella lista
  const currentIndex = months.findIndex(m => m.value === month)
  const monthData = months.find(m => m.value === month)
  const isCurrent = monthData?.isCurrent || false

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Carica i budget per il mese selezionato
  useEffect(() => {
    setBudgets(getMonthBudgets(month))
  }, [month, getMonthBudgets])

  const handleChange = (category, value) => {
    const amount = parseFloat(value) || 0
    setBudgets(prev => ({ ...prev, [category]: amount }))
  }

  const handleSave = () => {
    if (applyToAllMonths) {
      // Applica a TUTTI i mesi della lista (passato e futuro)
      months.forEach(m => {
        Object.entries(budgets).forEach(([cat, amount]) => {
          setBudget(m.value, cat, amount)
        })
      })
    } else {
      // Solo per il mese selezionato
      Object.entries(budgets).forEach(([cat, amount]) => {
        setBudget(month, cat, amount)
      })
    }
    onClose()
  }

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose()
  }

  const expenseCategories = categories.expense
  const monthLabel = monthData?.label || ''

  const goPrevious = () => {
    if (currentIndex > 0) setMonth(months[currentIndex - 1].value)
  }

  const goNext = () => {
    if (currentIndex < months.length - 1) setMonth(months[currentIndex + 1].value)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="w-full sm:max-w-md bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto animate-zoom-in"
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">💰 Gestione Budget</h2>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-white text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Selettore mese con mese corrente evidenziato */}
        <div className="flex items-center gap-2 mb-4 bg-white/5 rounded-xl px-3 py-2">
          <button
            onClick={goPrevious}
            disabled={currentIndex === 0}
            className={`p-1 rounded-lg transition-colors ${
              currentIndex === 0
                ? 'text-[var(--text-secondary)]/30 cursor-not-allowed'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <span
            className={`flex-1 text-center text-sm font-medium ${
              isCurrent ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'
            }`}
          >
            {monthLabel}
          </span>

          <button
            onClick={goNext}
            disabled={currentIndex === months.length - 1}
            className={`p-1 rounded-lg transition-colors ${
              currentIndex === months.length - 1
                ? 'text-[var(--text-secondary)]/30 cursor-not-allowed'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* Toggle per applicare a tutti i mesi (senza "passato e futuro") */}
        <div className="flex items-center justify-between mb-4 bg-white/5 rounded-xl px-3 py-2">
          <span className="text-sm text-[var(--text-primary)]">Applica a tutti i mesi</span>
          <button
            onClick={() => setApplyToAllMonths(!applyToAllMonths)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              applyToAllMonths ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                applyToAllMonths ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Lista categorie con input */}
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {expenseCategories.map(cat => (
            <div key={cat.name} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2">
              <span className="text-lg">{cat.emoji}</span>
              <span className="flex-1 text-sm text-[var(--text-primary)]">{cat.name}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={budgets[cat.name] || ''}
                onChange={(e) => handleChange(cat.name, e.target.value)}
                className="w-28 bg-white/5 border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] text-right focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-full text-sm font-medium bg-white/5 text-[var(--text-primary)] hover:bg-white/10 transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-full text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] hover:bg-[var(--accent-hover)] transition-colors"
          >
            Salva
          </button>
        </div>
      </div>
    </div>
  )
}