import { useState, useEffect } from 'react'
import { useCategories } from '../context/CategoriesContext'
import { useBudgets } from '../context/BudgetContext'

export default function BudgetManagerInline() {
  const { categories } = useCategories()
  const { getMonthBudgets, setBudget } = useBudgets()
  const [budgets, setBudgets] = useState({})
  
  // Mese corrente per default
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  // Carica i budget per il mese selezionato
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
    // Feedback visivo (opzionale)
    alert('Budget salvato con successo!')
  }

  const expenseCategories = categories.expense

  // Genera lista mesi per il selettore
  const months = []
  const today = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const year = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    months.push({
      value: `${year}-${m}`,
      label: d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
    })
  }

  return (
    <div className="space-y-4">
      {/* Selettore mese compatto */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            const idx = months.findIndex(m => m.value === month)
            if (idx > 0) setMonth(months[idx - 1].value)
          }}
          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <span className="flex-1 text-center text-sm font-medium text-[var(--text-primary)]">
          {months.find(m => m.value === month)?.label || ''}
        </span>
        <button
          onClick={() => {
            const idx = months.findIndex(m => m.value === month)
            if (idx < months.length - 1) setMonth(months[idx + 1].value)
          }}
          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Lista categorie con input */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {expenseCategories.map(cat => (
          <div key={cat.name} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5">
            <span className="text-base">{cat.emoji}</span>
            <span className="flex-1 text-xs text-[var(--text-primary)] truncate">{cat.name}</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={budgets[cat.name] || ''}
              onChange={(e) => handleChange(cat.name, e.target.value)}
              className="w-20 bg-white/5 border border-[var(--border)] rounded-lg px-2 py-1 text-xs text-[var(--text-primary)] text-right focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/50"
            />
          </div>
        ))}
      </div>

      {/* Pulsante salva */}
      <button
        onClick={handleSave}
        className="w-full px-4 py-2 rounded-full text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] hover:bg-[var(--accent-hover)] transition-colors active:scale-95"
      >
        Salva Budget
      </button>
    </div>
  )
}