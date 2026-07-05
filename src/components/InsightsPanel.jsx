import { useMemo } from 'react'
import { useTransactions } from '../context/TransactionContext'
import { useCategories } from '../context/CategoriesContext'
import { usePrivacy } from '../context/PrivacyContext'
import { formatCurrency, maskCurrency } from '../utils/format'

export default function InsightsPanel({ isYearly = false }) {
  const { filteredTransactions, transactions, monthFilter } = useTransactions()
  const { categories } = useCategories()
  const { isPrivacyEnabled } = usePrivacy()

  const fmt = isPrivacyEnabled ? maskCurrency : formatCurrency
  const maskPercent = (val) => isPrivacyEnabled ? '***' : `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`

  const insights = useMemo(() => {
    // Se isYearly, usa TUTTE le transazioni (non filtrate per mese)
    const data = isYearly ? transactions : filteredTransactions
    const currentMonth = monthFilter

    if (isYearly) {
      // Calcoli per l'ANNO: da gennaio al mese corrente
      const year = new Date().getFullYear()
      const yearTransactions = transactions.filter(t => t.date.startsWith(`${year}`))
      
      const income = yearTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const expense = yearTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      const balance = income - expense
      
      // Anno precedente per trend
      const prevYear = year - 1
      const prevYearTransactions = transactions.filter(t => t.date.startsWith(`${prevYear}`))
      const prevIncome = prevYearTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const prevExpense = prevYearTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      
      const incomeTrend = prevIncome ? ((income - prevIncome) / prevIncome * 100) : null
      const expenseTrend = prevExpense ? ((expense - prevExpense) / prevExpense * 100) : null
      
      // Media mensile
      const monthsCount = new Date().getMonth() + 1 // gennaio = 1, dicembre = 12
      const avgMonthlyIncome = monthsCount > 0 ? income / monthsCount : 0
      const avgMonthlyExpense = monthsCount > 0 ? expense / monthsCount : 0
      
      return {
        type: 'yearly',
        income,
        expense,
        balance,
        incomeTrend,
        expenseTrend,
        avgMonthlyIncome,
        avgMonthlyExpense,
        monthsCount
      }
    } else {
      // Calcoli per il MESE (come prima)
      const income = data.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const expense = data.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      const balance = income - expense
      
      // Mese precedente per trend
      let prevMonthIncome = 0, prevMonthExpense = 0
      if (currentMonth !== 'all') {
        const [year, month] = currentMonth.split('-').map(Number)
        const prevDate = new Date(year, month - 2, 1)
        const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`
        prevMonthIncome = transactions.filter(t => t.type === 'income' && t.date.startsWith(prevMonthStr)).reduce((s, t) => s + t.amount, 0)
        prevMonthExpense = transactions.filter(t => t.type === 'expense' && t.date.startsWith(prevMonthStr)).reduce((s, t) => s + t.amount, 0)
      }
      const incomeTrend = prevMonthIncome ? ((income - prevMonthIncome) / prevMonthIncome * 100) : null
      const expenseTrend = prevMonthExpense ? ((expense - prevMonthExpense) / prevMonthExpense * 100) : null
      
      // Media giornaliera
      const daysInMonth = currentMonth !== 'all' ? new Date(parseInt(currentMonth.split('-')[0]), parseInt(currentMonth.split('-')[1]), 0).getDate() : 30
      const avgDailyExpense = daysInMonth > 0 ? expense / daysInMonth : 0
      
      // Giorno con più spese
      const dailyExpenses = {}
      data.filter(t => t.type === 'expense').forEach(t => {
        const day = t.date.slice(-2)
        dailyExpenses[day] = (dailyExpenses[day] || 0) + t.amount
      })
      const maxDay = Object.entries(dailyExpenses).sort((a, b) => b[1] - a[1])[0]
      const maxDayLabel = maxDay && currentMonth !== 'all' 
        ? `${maxDay[0]} ${new Date(parseInt(currentMonth.split('-')[0]), parseInt(currentMonth.split('-')[1]) - 1, parseInt(maxDay[0])).toLocaleDateString('it-IT', { weekday: 'short' })}`
        : null
      
      // Categoria con più spese
      const topExpenseCat = categories.expense
        .map(cat => ({
          name: cat.name,
          emoji: cat.emoji,
          value: data.filter(t => t.type === 'expense' && t.category === cat.name).reduce((s, t) => s + t.amount, 0)
        }))
        .sort((a, b) => b.value - a.value)[0]
      
      return {
        type: 'monthly',
        income,
        expense,
        balance,
        incomeTrend,
        expenseTrend,
        avgDailyExpense,
        maxDayLabel,
        maxDayAmount: maxDay ? maxDay[1] : 0,
        topExpenseCat
      }
    }
  }, [filteredTransactions, transactions, monthFilter, categories, isYearly])

  if (!insights) return null

  // Render per la vista annuale
  if (insights.type === 'yearly') {
    return (
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[var(--accent)]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          Insight dell'anno ({insights.monthsCount} mesi)
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
            <div className="flex items-center gap-2">
              <span className="text-lg">💰</span>
              <div>
                <p className="text-[10px] text-[var(--text-secondary)]">Totale entrate</p>
                <p className="text-sm font-semibold text-[var(--success)]">{fmt(insights.income)}</p>
                {insights.incomeTrend !== null && (
                  <p className={`text-[10px] font-medium ${insights.incomeTrend >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                    {maskPercent(insights.incomeTrend)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
            <div className="flex items-center gap-2">
              <span className="text-lg">💸</span>
              <div>
                <p className="text-[10px] text-[var(--text-secondary)]">Totale spese</p>
                <p className="text-sm font-semibold text-[var(--danger)]">{fmt(insights.expense)}</p>
                {insights.expenseTrend !== null && (
                  <p className={`text-[10px] font-medium ${insights.expenseTrend <= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                    {maskPercent(insights.expenseTrend)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <div>
                <p className="text-[10px] text-[var(--text-secondary)]">Media mensile entrate</p>
                <p className="text-sm font-semibold text-[var(--success)]">{fmt(insights.avgMonthlyIncome)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
            <div className="flex items-center gap-2">
              <span className="text-lg">📈</span>
              <div>
                <p className="text-[10px] text-[var(--text-secondary)]">Media mensile spese</p>
                <p className="text-sm font-semibold text-[var(--danger)]">{fmt(insights.avgMonthlyExpense)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render per la vista mensile (come prima)
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[var(--accent)]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
        Insight del mese
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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