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

    // ---- Calcolo transazioni del mese corrente ----
    const monthTransactions = transactions.filter(t => t.date.startsWith(monthFilter))
    const currentIncome = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const currentExpense = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const currentBalance = currentIncome - currentExpense

    // Giorni trascorsi del mese
    const todayDate = today.getDate()
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
    const daysRemaining = daysInMonth - todayDate

    // ---- Calcolo storico: ultimi 6 mesi (escluso il mese corrente) ----
    const historicalMonths = []
    for (let i = 1; i <= 6; i++) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const key = `${y}-${m}`
      
      const monthData = transactions.filter(t => t.date.startsWith(key))
      const income = monthData.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const expense = monthData.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      
      if (income > 0 || expense > 0) {
        historicalMonths.push({ income, expense, key })
      }
    }

    // Se abbiamo meno di 3 mesi di storico, non abbiamo abbastanza dati
    if (historicalMonths.length < 3) {
      return {
        isEarly: true,
        daysPassed: todayDate,
        totalDays: daysInMonth,
        currentBalance,
        currentIncome,
        currentExpense,
        message: `📊 Non hai ancora abbastanza storico (${historicalMonths.length} mesi) per fare una previsione affidabile. Continua a registrare le tue transazioni!`,
        historicalMonths: historicalMonths.length
      }
    }

    // Calcola la media storica mensile di spesa
    const avgHistoricalExpense = historicalMonths.reduce((s, m) => s + m.expense, 0) / historicalMonths.length
    
    // Calcola la media storica mensile di entrate
    const avgHistoricalIncome = historicalMonths.reduce((s, m) => s + m.income, 0) / historicalMonths.length

    // Proiezione: se il mese è già iniziato, usiamo i dati reali + media storica per i giorni rimanenti
    const daysPassed = todayDate
    const avgDailyExpense = avgHistoricalExpense / 30 // media giornaliera storica
    const avgDailyIncome = avgHistoricalIncome / 30

    // Spesa proiettata: spesa reale + media storica * giorni rimanenti
    const projectedExpense = currentExpense + (avgDailyExpense * daysRemaining)
    const projectedIncome = currentIncome + (avgDailyIncome * daysRemaining)
    const projectedBalance = projectedIncome - projectedExpense

    // Differenza rispetto al saldo attuale
    const difference = projectedBalance - currentBalance

    // Limita la proiezione del saldo a un minimo di -5000€ (per evitare numeri assurdi)
    const MIN_PROJECTED = -5000
    const finalProjectedBalance = Math.max(projectedBalance, MIN_PROJECTED)

    // Confronto con la media storica
    const vsHistoricalExpense = currentExpense - avgHistoricalExpense
    const vsHistoricalIncome = currentIncome - avgHistoricalIncome

    // Messaggio di avviso
    let warning = null
    if (finalProjectedBalance < 0) {
      warning = {
        level: 'danger',
        message: `⚠️ Attenzione: al ritmo attuale, finirai il mese con ${fmt(Math.abs(finalProjectedBalance))} di scoperto. Rivedi le tue spese!`
      }
    } else if (finalProjectedBalance < 100 && finalProjectedBalance >= 0) {
      warning = {
        level: 'warning',
        message: `⚠️ Attenzione: al ritmo attuale, finirai il mese con solo ${fmt(finalProjectedBalance)}. Cerca di risparmiare.`
      }
    } else if (finalProjectedBalance > currentBalance + 200) {
      warning = {
        level: 'success',
        message: `💪 Ottimo! Al ritmo attuale, finirai il mese con ${fmt(finalProjectedBalance - currentBalance)} in più. Continua così!`
      }
    } else if (vsHistoricalExpense > 100) {
      warning = {
        level: 'warning',
        message: `📊 Stai spendendo ${fmt(vsHistoricalExpense)} in più rispetto alla tua media storica (${fmt(avgHistoricalExpense)}/mese). Attenzione!`
      }
    } else if (vsHistoricalExpense < -50) {
      warning = {
        level: 'success',
        message: `📉 Stai spendendo ${fmt(Math.abs(vsHistoricalExpense))} in meno rispetto alla tua media storica (${fmt(avgHistoricalExpense)}/mese). Ottimo lavoro!`
      }
    }

    return {
      isEarly: false,
      currentBalance,
      projectedBalance: finalProjectedBalance,
      avgHistoricalExpense,
      avgHistoricalIncome,
      avgDailyExpense,
      avgDailyIncome,
      daysPassed: todayDate,
      totalDays: daysInMonth,
      daysRemaining,
      difference,
      warning,
      currentIncome,
      currentExpense,
      historicalMonths: historicalMonths.length,
      vsHistoricalExpense,
      vsHistoricalIncome
    }
  }, [transactions, monthFilter, fmt])

  if (!projection) return null

  // ---- Caso: pochi dati storici ----
  if (projection.isEarly) {
    return (
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[var(--accent)]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Previsione fine mese
          </h2>
          <span className="text-xs text-[var(--text-secondary)]">
            Giorno {projection.daysPassed}/{projection.totalDays}
          </span>
        </div>
        <div className="mt-3 p-4 rounded-xl bg-white/5 border border-[var(--border)]">
          <p className="text-sm text-[var(--text-secondary)] text-center">
            {projection.message}
          </p>
          <p className="text-xs text-[var(--text-secondary)] text-center mt-2">
            Transazioni attuali: {projection.currentIncome > 0 || projection.currentExpense > 0 ? '✅ mese in corso' : '❌ nessuna transazione questo mese'}
          </p>
        </div>
      </div>
    )
  }

  // ---- Caso: proiezione disponibile ----
  const {
    currentBalance,
    projectedBalance,
    avgHistoricalExpense,
    avgDailyExpense,
    daysPassed,
    totalDays,
    daysRemaining,
    warning,
    currentIncome,
    currentExpense,
    historicalMonths,
    vsHistoricalExpense
  } = projection

  const isNegative = projectedBalance < 0
  const progress = Math.min((daysPassed / totalDays) * 100, 100)

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[var(--accent)]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          Previsione fine mese
        </h2>
        <span className="text-xs text-[var(--text-secondary)]">
          Giorno {daysPassed}/{totalDays} · {historicalMonths} mesi storici
        </span>
      </div>

      {/* Barra di avanzamento mese */}
      <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(progress, 100)}%`,
            backgroundColor: progress > 80 ? 'var(--danger)' : 'var(--accent)'
          }}
        />
      </div>

      {/* Griglia 4 colonne come InsightsPanel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Saldo attuale */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
          <div className="flex items-center gap-2">
            <span className="text-lg">💰</span>
            <div>
              <p className="text-[10px] text-[var(--text-secondary)]">Saldo attuale</p>
              <p className={`text-sm font-semibold ${currentBalance >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                {fmt(currentBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* Proiezione fine mese */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
          <div className="flex items-center gap-2">
            <span className="text-lg">📈</span>
            <div>
              <p className="text-[10px] text-[var(--text-secondary)]">Proiezione fine mese</p>
              <p className={`text-sm font-semibold ${!isNegative ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                {fmt(projectedBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* Media storica */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <div>
              <p className="text-[10px] text-[var(--text-secondary)]">Media spesa storica</p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {fmt(avgHistoricalExpense)}/mese
              </p>
              <p className={`text-[10px] font-medium ${vsHistoricalExpense <= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                {vsHistoricalExpense > 0 ? '+' : ''}{fmt(vsHistoricalExpense)} vs media
              </p>
            </div>
          </div>
        </div>

        {/* Giorni rimanenti */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
          <div className="flex items-center gap-2">
            <span className="text-lg">📅</span>
            <div>
              <p className="text-[10px] text-[var(--text-secondary)]">Giorni rimanenti</p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {daysRemaining}
              </p>
              <p className="text-[10px] text-[var(--text-secondary)]">
                su {totalDays} totali
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Avviso (stile InsightsPanel) */}
      {warning && (
        <div className={`rounded-xl px-4 py-3 ${
          warning.level === 'danger' ? 'bg-[var(--danger)]/20 border border-[var(--danger)]/30' :
          warning.level === 'warning' ? 'bg-[var(--accent)]/20 border border-[var(--accent)]/30' :
          warning.level === 'success' ? 'bg-[var(--success)]/20 border border-[var(--success)]/30' :
          'bg-white/5 border border-[var(--border)]'
        }`}>
          <p className={`text-sm font-medium ${
            warning.level === 'danger' ? 'text-[var(--danger)]' :
            warning.level === 'warning' ? 'text-[var(--accent)]' :
            warning.level === 'success' ? 'text-[var(--success)]' :
            'text-[var(--text-secondary)]'
          }`}>
            {warning.message}
          </p>
        </div>
      )}

      {/* Dettagli storici aggiuntivi (solo se ha senso) */}
      {historicalMonths >= 3 && (
        <div className="grid grid-cols-2 gap-3 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-1">
            <span>📈</span> Media entrate: <span className="text-[var(--text-primary)] font-medium">{fmt(projection.avgHistoricalIncome)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📊</span> Media spese: <span className="text-[var(--text-primary)] font-medium">{fmt(avgHistoricalExpense)}</span>
          </div>
        </div>
      )}
    </div>
  )
}