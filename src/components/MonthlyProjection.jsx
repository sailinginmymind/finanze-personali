import { useMemo } from 'react'
import { useTransactions } from '../context/TransactionContext'
import { usePrivacy } from '../context/PrivacyContext'
import { formatCurrency, maskCurrency } from '../utils/format'

export default function MonthlyProjection() {
  const { filteredTransactions, transactions, monthFilter } = useTransactions()
  const { isPrivacyEnabled } = usePrivacy()
  const fmt = isPrivacyEnabled ? maskCurrency : formatCurrency

  const projection = useMemo(() => {
    if (monthFilter === 'all') return null

    const [year, month] = monthFilter.split('-').map(Number)
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth() + 1

    // Se il mese selezionato non è il mese corrente, non mostrare la proiezione
    if (year !== currentYear || month !== currentMonth) return null

    // Calcola spese del mese corrente
    const monthTransactions = transactions.filter(t => t.date.startsWith(monthFilter))
    const income = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const currentBalance = income - expense

    // Giorni trascorsi del mese
    const todayDate = today.getDate()
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
    const daysRemaining = daysInMonth - todayDate

    // Spesa media giornaliera (solo giorni passati)
    const avgDailyExpense = todayDate > 0 ? expense / todayDate : 0

    // Proiezione spese per il resto del mese
    const projectedExpense = expense + (avgDailyExpense * daysRemaining)
    const projectedBalance = income - projectedExpense

    // Differenza rispetto al saldo attuale
    const difference = projectedBalance - currentBalance

    // Messaggio di avviso
    let warning = null
    if (projectedBalance < 0) {
      warning = {
        level: 'danger',
        message: `Attenzione: stai spendendo troppo velocemente! Proiezione saldo negativo di ${fmt(Math.abs(projectedBalance))} a fine mese.`
      }
    } else if (difference < 0 && difference > -100) {
      warning = {
        level: 'warning',
        message: `Attenzione: al ritmo attuale, finirai il mese con ${fmt(difference)} in meno rispetto al saldo attuale.`
      }
    } else if (projectedBalance > currentBalance && projectedBalance > 0) {
      warning = {
        level: 'success',
        message: `Ottimo! Al ritmo attuale, finirai il mese con ${fmt(projectedBalance - currentBalance)} in più. Continua così! 💪`
      }
    }

    return {
      currentBalance,
      projectedBalance,
      avgDailyExpense,
      daysRemaining,
      daysPassed: todayDate,
      totalDays: daysInMonth,
      difference,
      warning,
      income,
      expense
    }
  }, [filteredTransactions, transactions, monthFilter, fmt])

  if (!projection) return null

  const { currentBalance, projectedBalance, avgDailyExpense, daysRemaining, daysPassed, totalDays, difference, warning, income, expense } = projection
  const progress = Math.min((daysPassed / totalDays) * 100, 100)

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[var(--accent)]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          Previsione fine mese
        </h2>
        <span className="text-xs text-[var(--text-secondary)]">
          Giorno {daysPassed}/{totalDays}
        </span>
      </div>

      {/* Barra di avanzamento mese */}
      <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${progress}%`,
            backgroundColor: progress > 80 ? 'var(--danger)' : 'var(--accent)'
          }}
        />
      </div>

      {/* Numeri */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-[10px] text-[var(--text-secondary)]">Saldo attuale</p>
          <p className={`text-base font-bold ${currentBalance >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
            {fmt(currentBalance)}
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-[10px] text-[var(--text-secondary)]">Proiezione fine mese</p>
          <p className={`text-base font-bold ${projectedBalance >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
            {fmt(projectedBalance)}
          </p>
        </div>
      </div>

      {/* Dettagli */}
      <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-1">
          <span>📊</span> Media giornaliera: <span className="text-[var(--text-primary)] font-medium">{fmt(avgDailyExpense)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>📅</span> Giorni rimanenti: <span className="text-[var(--text-primary)] font-medium">{daysRemaining}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>💰</span> Entrate: <span className="text-[var(--success)] font-medium">{fmt(income)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>💸</span> Spese: <span className="text-[var(--danger)] font-medium">{fmt(expense)}</span>
        </div>
      </div>

      {/* Avviso */}
      {warning && (
        <div className={`rounded-xl px-4 py-3 ${
          warning.level === 'danger' ? 'bg-[var(--danger)]/20 border border-[var(--danger)]/30' :
          warning.level === 'warning' ? 'bg-[var(--accent)]/20 border border-[var(--accent)]/30' :
          'bg-[var(--success)]/20 border border-[var(--success)]/30'
        }`}>
          <p className={`text-sm font-medium ${
            warning.level === 'danger' ? 'text-[var(--danger)]' :
            warning.level === 'warning' ? 'text-[var(--accent)]' :
            'text-[var(--success)]'
          }`}>
            {warning.message}
          </p>
        </div>
      )}
    </div>
  )
}