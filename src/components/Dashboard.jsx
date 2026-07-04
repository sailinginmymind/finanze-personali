import { useMemo } from 'react'
import { useTransactions } from '../context/TransactionContext'
import { useCategories } from '../context/CategoriesContext'
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
        <p className="text-slate-300 mt-1">€ {data.value.toFixed(2)}</p>
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
      <div className="relative overflow-hidden bg-gradient-to-br from-[#111827] to-[#0a0f1a] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-bl from-amber-500/10 via-transparent to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-xs sm:text-sm text-slate-400 font-medium">Saldo {monthFilter !== 'all' ? 'del mese' : 'totale'}</p>
          <p className={`text-3xl sm:text-4xl font-bold mt-1 tracking-tight ${stats.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>€ {stats.balance.toFixed(2)}</p>
          <div className="flex gap-4 mt-4">
            <div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <span>Entrate</span>
                {stats.incomeTrend !== null && <span className={`ml-1 font-medium ${stats.incomeTrend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{stats.incomeTrend >= 0 ? '+' : ''}{stats.incomeTrend.toFixed(1)}%</span>}
              </div>
              <p className="text-base sm:text-lg font-semibold text-emerald-400">€ {stats.income.toFixed(2)}</p>
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <span>Spese</span>
                {stats.expenseTrend !== null && <span className={`ml-1 font-medium ${stats.expenseTrend <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{stats.expenseTrend >= 0 ? '+' : ''}{stats.expenseTrend.toFixed(1)}%</span>}
              </div>
              <p className="text-base sm:text-lg font-semibold text-rose-400">€ {stats.expense.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0d1321] border border-white/5 rounded-2xl p-4 sm:p-5 shadow-lg">
        <h2 className="text-sm sm:text-base font-semibold mb-4">{monthFilter === 'all' ? 'Andamento mensile' : 'Andamento giornaliero'}</h2>
        {monthFilter === 'all' ? (
          stats.monthlyTrend.length === 0 ? <p className="text-slate-600 text-center py-8 text-sm">Dati insufficienti</p> : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.monthlyTrend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip formatter={(value) => `€ ${value.toFixed(2)}`} contentStyle={{ background: '#1a1f2e', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.875rem' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="income" name="Entrate" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} isAnimationActive={false} />
                <Line type="monotone" dataKey="expense" name="Spese" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, fill: '#ef4444' }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          )
        ) : (
          stats.dailyTrend && stats.dailyTrend.length === 0 ? <p className="text-slate-600 text-center py-8 text-sm">Nessun dato per questo mese</p> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.dailyTrend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip formatter={(value) => `€ ${value.toFixed(2)}`} contentStyle={{ background: '#1a1f2e', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.875rem' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="income" name="Entrate" fill="#10b981" radius={[4,4,0,0]} isAnimationActive={false} />
                <Bar dataKey="expense" name="Spese" fill="#ef4444" radius={[4,4,0,0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          )
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-[#0d1321] border border-white/5 rounded-2xl p-4 sm:p-5 shadow-lg">
          <h2 className="text-sm sm:text-base font-semibold mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-400" /> Spese per categoria</h2>
          {stats.expenseByCategory.length === 0 ? <p className="text-slate-600 text-center py-8 text-sm">Nessuna spesa</p> : (
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
                <Bar dataKey="value" radius={[0,8,8,0]} isAnimationActive={false} barSize={24}>
                  {stats.expenseByCategory.map((entry, idx) => (<Cell key={idx} fill={`url(#expenseGrad-${idx})`} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-[#0d1321] border border-white/5 rounded-2xl p-4 sm:p-5 shadow-lg">
          <h2 className="text-sm sm:text-base font-semibold mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Entrate per categoria</h2>
          {stats.incomeByCategory.length === 0 ? <p className="text-slate-600 text-center py-8 text-sm">Nessuna entrata</p> : (
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
                <Bar dataKey="value" radius={[0,8,8,0]} isAnimationActive={false} barSize={24}>
                  {stats.incomeByCategory.map((entry, idx) => (<Cell key={idx} fill={`url(#incomeGrad-${idx})`} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  )
}