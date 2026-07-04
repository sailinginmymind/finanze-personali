import { useMemo } from 'react'
import { useTransactions } from '../context/TransactionContext'
import { useCategories } from '../context/CategoriesContext'
import { formatCurrency, formatNumber } from '../utils/format'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, Legend, ResponsiveContainer, Cell
} from 'recharts'

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-3 shadow-xl text-sm">
        <p className="text-white font-medium flex items-center gap-2">
          <span className="text-lg">{data.emoji}</span> {data.name}
        </p>
        <p className="text-slate-300 mt-1">{formatCurrency(data.value)}</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const { filteredTransactions, transactions, monthFilter } = useTransactions()
  const { categories } = useCategories()

  const stats = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const balance = income - expense

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

  return (
    <section className="space-y-5">
      {/* 👇 Nuova Hero Card – ridisegnata */}
      <div className="bg-[#0d1321] border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl">
        <p className="text-sm sm:text-base font-medium text-slate-300 mb-4">
          Saldo {monthFilter !== 'all' ? 'del mese' : 'totale'}
        </p>
        <p className={`text-4xl sm:text-5xl font-bold tracking-tight mb-6 ${stats.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {formatCurrency(stats.balance)}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card Entrate */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-lg shrink-0">💰</div>
              <div>
                <p className="text-xs text-slate-400">Entrate</p>
                <p className="text-lg font-bold text-emerald-400">{formatCurrency(stats.income)}</p>
              </div>
            </div>
            {stats.incomeTrend !== null && (
              <div className={`flex items-center gap-1 text-xs font-medium ${stats.incomeTrend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d={stats.incomeTrend >= 0 ? "M4.5 15.75l7.5-7.5 7.5 7.5" : "M19.5 8.25l-7.5 7.5-7.5-7.5"} />
                </svg>
                {stats.incomeTrend >= 0 ? '+' : ''}{stats.incomeTrend.toFixed(1)}%
              </div>
            )}
          </div>

          {/* Card Spese */}
          <div className="bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-500/20 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-lg shrink-0">💸</div>
              <div>
                <p className="text-xs text-slate-400">Spese</p>
                <p className="text-lg font-bold text-rose-400">{formatCurrency(stats.expense)}</p>
              </div>
            </div>
            {stats.expenseTrend !== null && (
              <div className={`flex items-center gap-1 text-xs font-medium ${stats.expenseTrend <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d={stats.expenseTrend <= 0 ? "M4.5 15.75l7.5-7.5 7.5 7.5" : "M19.5 8.25l-7.5 7.5-7.5-7.5"} />
                </svg>
                {stats.expenseTrend >= 0 ? '+' : ''}{stats.expenseTrend.toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Andamento mensile / giornaliero */}
      <div className="bg-[#0d1321] border border-white/5 rounded-2xl p-4 sm:p-5 shadow-lg">
        <h2 className="text-sm sm:text-base font-semibold mb-4">
          {monthFilter === 'all' ? 'Andamento mensile' : 'Andamento giornaliero'}
        </h2>
        {monthFilter === 'all' ? (
          stats.monthlyTrend.length === 0 ? (
            <p className="text-slate-600 text-center py-8 text-sm">Dati insufficienti</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.monthlyTrend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    background: '#1a1f2e',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                    fontSize: '0.875rem'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="income" name="Entrate" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} isAnimationActive={false} />
                <Line type="monotone" dataKey="expense" name="Spese" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, fill: '#ef4444' }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          )
        ) : (
          stats.dailyTrend && stats.dailyTrend.length === 0 ? (
            <p className="text-slate-600 text-center py-8 text-sm">Nessun dato per questo mese</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.dailyTrend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    background: '#1a1f2e',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                    fontSize: '0.875rem'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="income" name="Entrate" fill="#10b981" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="expense" name="Spese" fill="#ef4444" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          )
        )}
      </div>

      {/* Barre per categoria (invariate) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-[#0d1321] border border-white/5 rounded-2xl p-4 sm:p-5 shadow-lg">
          <h2 className="text-sm sm:text-base font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400" /> Spese per categoria
          </h2>
          {stats.expenseByCategory.length === 0 ? (
            <p className="text-slate-600 text-center py-8 text-sm">Nessuna spesa</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(stats.expenseByCategory.length * 44, 200)}>
              <BarChart layout="vertical" data={stats.expenseByCategory} margin={{ left: 0, right: 20 }}>
                <defs>
                  {stats.expenseByCategory.map((entry, idx) => (
                    <linearGradient key={idx} id={`expenseGrad-${idx}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={entry.color} stopOpacity={0.4} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#e2e8f0', fontSize: 13 }} width={100} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} isAnimationActive={false} barSize={24}>
                  {stats.expenseByCategory.map((entry, idx) => (
                    <Cell key={idx} fill={`url(#expenseGrad-${idx})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-[#0d1321] border border-white/5 rounded-2xl p-4 sm:p-5 shadow-lg">
          <h2 className="text-sm sm:text-base font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Entrate per categoria
          </h2>
          {stats.incomeByCategory.length === 0 ? (
            <p className="text-slate-600 text-center py-8 text-sm">Nessuna entrata</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(stats.incomeByCategory.length * 44, 200)}>
              <BarChart layout="vertical" data={stats.incomeByCategory} margin={{ left: 0, right: 20 }}>
                <defs>
                  {stats.incomeByCategory.map((entry, idx) => (
                    <linearGradient key={idx} id={`incomeGrad-${idx}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={entry.color} stopOpacity={0.4} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#e2e8f0', fontSize: 13 }} width={100} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} isAnimationActive={false} barSize={24}>
                  {stats.incomeByCategory.map((entry, idx) => (
                    <Cell key={idx} fill={`url(#incomeGrad-${idx})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  )
}