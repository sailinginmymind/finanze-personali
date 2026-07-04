import { useMemo, useState } from 'react'
import { useTransactions } from '../context/TransactionContext'
import { useCategories } from '../context/CategoriesContext'
import { useBudgets } from '../context/BudgetContext'
import { usePrivacy } from '../context/PrivacyContext'
import { formatCurrency, maskCurrency } from '../utils/format'
import InsightsPanel from './InsightsPanel'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, Legend, ResponsiveContainer, Cell
} from 'recharts'

// Icona occhio (aperto / chiuso) in stile outline
const EyeIcon = ({ closed }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    {closed ? (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    ) : (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </>
    )}
  </svg>
)

function CustomBarTooltip({ active, payload, label }) {
  const { isPrivacyEnabled } = usePrivacy()
  const fmt = isPrivacyEnabled ? maskCurrency : formatCurrency
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-3 shadow-xl text-sm">
        <p className="text-[var(--text-primary)] font-medium flex items-center gap-2">
          <span className="text-lg">{data.emoji}</span> {data.name}
        </p>
        <p className="text-[var(--text-secondary)] mt-1">{fmt(data.value)}</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const { filteredTransactions, transactions, monthFilter } = useTransactions()
  const { categories } = useCategories()
  const { getBudget } = useBudgets()
  const { isPrivacyEnabled, togglePrivacy } = usePrivacy()
  const [activeTab, setActiveTab] = useState('expense')

  const fmt = isPrivacyEnabled ? maskCurrency : formatCurrency

  const stats = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const balance = income - expense

    // I trend non servono più qui, ma li calcoliamo ancora per altri usi? 
    // Non più necessari nella Hero Card, ma possiamo lasciarli nel calcolo per eventuali altri componenti.
    let prevMonthIncome = 0, prevMonthExpense = 0
    if (monthFilter !== 'all') {
      const [year, month] = monthFilter.split('-').map(Number)
      const prevDate = new Date(year, month - 2, 1)
      const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`
      prevMonthIncome = transactions.filter(t => t.type === 'income' && t.date.startsWith(prevMonthStr)).reduce((s, t) => s + t.amount, 0)
      prevMonthExpense = transactions.filter(t => t.type === 'expense' && t.date.startsWith(prevMonthStr)).reduce((s, t) => s + t.amount, 0)
    }
    const incomeTrend = prevMonthIncome ? ((income - prevMonthIncome) / prevMonthIncome * 100) : null
    const expenseTrend = prevMonthExpense ? ((expense - prevMonthExpense) / prevMonthExpense * 100) : null

    const expenseByCategory = categories.expense
      .map(cat => ({
        name: cat.name,
        value: filteredTransactions.filter(t => t.type === 'expense' && t.category === cat.name).reduce((s, t) => s + t.amount, 0),
        color: cat.color,
        emoji: cat.emoji
      }))
      .filter(c => c.value > 0)
      .sort((a, b) => b.value - a.value)

    const incomeByCategory = categories.income
      .map(cat => ({
        name: cat.name,
        value: filteredTransactions.filter(t => t.type === 'income' && t.category === cat.name).reduce((s, t) => s + t.amount, 0),
        color: cat.color,
        emoji: cat.emoji
      }))
      .filter(c => c.value > 0)
      .sort((a, b) => b.value - a.value)

    const monthlyTrend = (() => {
      const months = []
      const today = new Date()
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const key = `${y}-${m}`
        const label = d.toLocaleDateString('it-IT', { month: 'short', year: '2-digit' })
        const monthIncome = transactions.filter(t => t.type === 'income' && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0)
        const monthExpense = transactions.filter(t => t.type === 'expense' && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0)
        months.push({ label, income: monthIncome, expense: monthExpense })
      }
      return months
    })()

    const dailyTrend = (() => {
      if (monthFilter === 'all') return null
      const [year, month] = monthFilter.split('-').map(Number)
      const daysInMonth = new Date(year, month, 0).getDate()
      const daily = []
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        const dayIncome = transactions.filter(t => t.type === 'income' && t.date === dateStr).reduce((s, t) => s + t.amount, 0)
        const dayExpense = transactions.filter(t => t.type === 'expense' && t.date === dateStr).reduce((s, t) => s + t.amount, 0)
        daily.push({ day: String(day), income: dayIncome, expense: dayExpense })
      }
      return daily
    })()

    return { income, expense, balance, incomeTrend, expenseTrend, expenseByCategory, incomeByCategory, monthlyTrend, dailyTrend }
  }, [filteredTransactions, transactions, monthFilter, categories])

  const currentData = activeTab === 'expense' ? stats.expenseByCategory : stats.incomeByCategory

  return (
    <section className="space-y-5">
      {/* Hero Card – con occhio privacy a destra, senza trend */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            Saldo {monthFilter !== 'all' ? 'del mese' : 'totale'}
          </p>
          <button
            onClick={togglePrivacy}
            className="p-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-white/10 transition-colors"
            title={isPrivacyEnabled ? 'Mostra importi' : 'Nascondi importi'}
            aria-label={isPrivacyEnabled ? 'Mostra importi' : 'Nascondi importi'}
          >
            <EyeIcon closed={isPrivacyEnabled} />
          </button>
        </div>
        <p className={`text-3xl sm:text-4xl font-bold tracking-tight ${stats.balance >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
          {fmt(stats.balance)}
        </p>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">💰</span>
            <div>
              <p className="text-[10px] text-[var(--text-secondary)]">Entrate</p>
              <p className="text-sm font-semibold text-[var(--success)]">{fmt(stats.income)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">💸</span>
            <div>
              <p className="text-[10px] text-[var(--text-secondary)]">Spese</p>
              <p className="text-sm font-semibold text-[var(--danger)]">{fmt(stats.expense)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Andamento */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-lg">
        <h2 className="text-sm font-semibold mb-4 text-[var(--text-primary)]">
          {monthFilter === 'all' ? 'Andamento mensile (ultimi 6 mesi)' : 'Andamento giornaliero'}
        </h2>
        {monthFilter === 'all' ? (
          stats.monthlyTrend.length === 0 ? <p className="text-[var(--text-secondary)] text-center py-8 text-sm">Dati insufficienti</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats.monthlyTrend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip formatter={(value) => fmt(value)} contentStyle={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.875rem' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="income" name="Entrate" stroke="var(--success)" strokeWidth={2} dot={{ r: 4, fill: 'var(--success)' }} isAnimationActive={false} />
                <Line type="monotone" dataKey="expense" name="Spese" stroke="var(--danger)" strokeWidth={2} dot={{ r: 4, fill: 'var(--danger)' }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          )
        ) : (
          stats.dailyTrend && stats.dailyTrend.length === 0 ? <p className="text-[var(--text-secondary)] text-center py-8 text-sm">Nessun dato per questo mese</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.dailyTrend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip formatter={(value) => fmt(value)} contentStyle={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.875rem' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="income" name="Entrate" fill="var(--success)" radius={[4,4,0,0]} isAnimationActive={false} />
                <Bar dataKey="expense" name="Spese" fill="var(--danger)" radius={[4,4,0,0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          )
        )}
      </div>

      {/* Insight del mese (solo se mese selezionato) */}
      {monthFilter !== 'all' && <InsightsPanel />}

      {/* Tab: Spese / Entrate con budget */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('expense')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'expense' ? 'bg-[var(--danger)]/20 text-[var(--danger)]' : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Spese
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'income' ? 'bg-[var(--success)]/20 text-[var(--success)]' : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Entrate
          </button>
        </div>

        {currentData.length === 0 ? (
          <p className="text-[var(--text-secondary)] text-center py-8 text-sm">
            Nessuna {activeTab === 'expense' ? 'spesa' : 'entrata'}
          </p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={Math.max(currentData.length * 44, 200)}>
              <BarChart layout="vertical" data={currentData} margin={{ left: 0, right: 20 }}>
                <defs>
                  {currentData.map((entry, idx) => (
                    <linearGradient key={idx} id={`barGrad-${activeTab}-${idx}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={entry.color} stopOpacity={0.4} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-primary)', fontSize: 13 }} width={100} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="value" radius={[0,8,8,0]} isAnimationActive={false} barSize={24}>
                  {currentData.map((entry, idx) => (
                    <Cell key={idx} fill={`url(#barGrad-${activeTab}-${idx})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {activeTab === 'expense' && monthFilter !== 'all' && (
              <div className="mt-4 space-y-2">
                <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Budget mensile</h3>
                {stats.expenseByCategory.map(cat => {
                  const budget = getBudget(monthFilter, cat.name)
                  if (budget === 0) return null
                  const spent = cat.value
                  const percent = Math.min((spent / budget) * 100, 100)
                  const isOver = spent > budget
                  return (
                    <div key={cat.name} className="flex items-center gap-2 text-xs">
                      <span className="w-20 truncate text-[var(--text-secondary)]">{cat.emoji} {cat.name}</span>
                      <div className="flex-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: isOver ? 'var(--danger)' : cat.color
                          }}
                        />
                      </div>
                      <span className="w-20 text-right text-[var(--text-secondary)]">
                        {fmt(spent)} / {fmt(budget)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}