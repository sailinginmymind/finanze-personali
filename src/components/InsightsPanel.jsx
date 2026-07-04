import { useMemo } from 'react'
import { useTransactions } from '../context/TransactionContext'
import { useCategories } from '../context/CategoriesContext'
import { usePrivacy } from '../context/PrivacyContext'
import { formatCurrency, maskCurrency } from '../utils/format'

export default function InsightsPanel() {
  const { filteredTransactions, transactions, monthFilter } = useTransactions()
  const { categories } = useCategories()
  const { isPrivacyEnabled } = usePrivacy()

  const fmt = isPrivacyEnabled ? maskCurrency : formatCurrency
  const maskPercent = (val) => isPrivacyEnabled ? '***' : `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`

  const insights = useMemo(() => {
    if (monthFilter === 'all') return null

    const [year, month] = monthFilter.split('-').map(Number)
    const daysInMonth = new Date(year, month, 0).getDate()

    const monthIncome = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const monthExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const balance = monthIncome - monthExpense

    const prevDate = new Date(year, month - 2, 1)
    const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`
    const prevIncome = transactions.filter(t => t.type === 'income' && t.date.startsWith(prevMonthStr)).reduce((s, t) => s + t.amount, 0)
    const prevExpense = transactions.filter(t => t.type === 'expense' && t.date.startsWith(prevMonthStr)).reduce((s, t) => s + t.amount, 0)
    const prevBalance = prevIncome - prevExpense

    const incomeTrend = prevIncome ? ((monthIncome - prevIncome) / prevIncome * 100) : null
    const expenseTrend = prevExpense ? ((monthExpense - prevExpense) / prevExpense * 100) : null
    const balanceTrend = prevBalance ? ((balance - prevBalance) / Math.abs(prevBalance) * 100) : null

    const dailyExpenses = {}
    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
      const day = t.date.slice(-2)
      dailyExpenses[day] = (dailyExpenses[day] || 0) + t.amount
    })
    const maxDay = Object.entries(dailyExpenses).sort((a, b) => b[1] - a[1])[0]
    const maxDayLabel = maxDay ? `${maxDay[0]} ${new Date(year, month - 1, parseInt(maxDay[0])).toLocaleDateString('it-IT', { weekday: 'short' })}` : null

    const avgDailyExpense = daysInMonth > 0 ? monthExpense / daysInMonth : 0

    const topExpenseCat = categories.expense
      .map(cat => ({
        name: cat.name,
        emoji: cat.emoji,
        value: filteredTransactions.filter(t => t.type === 'expense' && t.category === cat.name).reduce((s, t) => s + t.amount, 0)
      }))
      .sort((a, b) => b.value - a.value)[0]

    return {
      incomeTrend,
      expenseTrend,
      balanceTrend,
      maxDayLabel,
      maxDayAmount: maxDay ? maxDay[1] : 0,
      avgDailyExpense,
      topExpenseCat
    }
  }, [filteredTransactions, transactions, monthFilter, categories])

  if (!insights) return null

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[var(--accent)]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
        Insight del mese
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Trend entrate */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
          <div className="flex items-center gap-2">
            <span className="text-lg">💰</span>
            <div>
              <p className="text-[10px] text-[var(--text-secondary)]">Entrate vs mese prec.</p>
              <p className={`text-sm font-semibold ${insights.incomeTrend >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                {insights.incomeTrend !== null ? maskPercent(insights.incomeTrend) : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Trend spese */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
          <div className="flex items-center gap-2">
            <span className="text-lg">💸</span>
            <div>
              <p className="text-[10px] text-[var(--text-secondary)]">Spese vs mese prec.</p>
              <p className={`text-sm font-semibold ${insights.expenseTrend <= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                {insights.expenseTrend !== null ? maskPercent(insights.expenseTrend) : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Media giornaliera */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <div>
              <p className="text-[10px] text-[var(--text-secondary)]">Media spesa giornaliera</p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {fmt(insights.avgDailyExpense)}
              </p>
            </div>
          </div>
        </div>

        {/* Giorno più caro */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <div>
              <p className="text-[10px] text-[var(--text-secondary)]">Giorno più caro</p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {insights.maxDayLabel || '—'}
              </p>
              {insights.maxDayLabel && (
                <p className="text-[10px] text-[var(--text-secondary)]">
                  {fmt(insights.maxDayAmount)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}