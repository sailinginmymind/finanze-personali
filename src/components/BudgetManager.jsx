import { useState, useEffect, useRef } from 'react'
import { useCategories } from '../context/CategoriesContext'
import { useBudgets } from '../context/BudgetContext'

export default function BudgetManager({ onClose, month }) {
  const { categories } = useCategories()
  const { getMonthBudgets, setBudget } = useBudgets()
  const [budgets, setBudgets] = useState({})
  const modalRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Carica i budget esistenti per il mese selezionato
  useEffect(() => {
    setBudgets(getMonthBudgets(month))
  }, [month, getMonthBudgets])

  const handleChange = (category, value) => {
    const amount = parseFloat(value) || 0
    setBudgets(prev => ({ ...prev, [category]: amount }))
  }

  const handleSave = () => {
    Object.entries(budgets).forEach(([cat, amount]) => {
      setBudget(month, cat, amount)
    })
    onClose()
  }

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose()
  }

  const expenseCategories = categories.expense

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4" onClick={handleOverlayClick}>
      <div ref={modalRef} className="w-full sm:max-w-md bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto animate-zoom-in">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Budget Mensile</h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mb-4">
          Imposta un limite di spesa per ogni categoria per {new Date(month + '-01').toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
        </p>
        <div className="space-y-3">
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
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-full text-sm font-medium bg-white/5 text-[var(--text-primary)] hover:bg-white/10 transition-colors">
            Annulla
          </button>
          <button onClick={handleSave} className="flex-1 px-4 py-2 rounded-full text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] hover:bg-[var(--accent-hover)] transition-colors">
            Salva Budget
          </button>
        </div>
      </div>
    </div>
  )
}