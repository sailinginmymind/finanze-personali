import { useState } from 'react'
import MonthSelector from '../components/MonthSelector'
import Dashboard from '../components/Dashboard'
import BudgetManager from '../components/BudgetManager'
import { useTransactions } from '../context/TransactionContext'

export default function DashboardPage() {
  const { monthFilter, setMonthFilter } = useTransactions()
  const [showBudget, setShowBudget] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <MonthSelector value={monthFilter} onChange={setMonthFilter} />
        {monthFilter !== 'all' && (
          <button
            onClick={() => setShowBudget(true)}
            className="shrink-0 px-3 py-2 rounded-full text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 hover:bg-[var(--accent)]/20 transition-colors"
          >
            Budget
          </button>
        )}
      </div>
      <Dashboard />
      {showBudget && <BudgetManager onClose={() => setShowBudget(false)} month={monthFilter} />}
    </div>
  )
}