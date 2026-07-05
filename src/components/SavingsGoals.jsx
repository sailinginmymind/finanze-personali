import { useState } from 'react'
import { useSavings } from '../context/SavingsContext'
import { usePrivacy } from '../context/PrivacyContext'
import { formatCurrency, maskCurrency } from '../utils/format'

export default function SavingsGoals() {
  const { goals, addGoal, updateGoal, deleteGoal, addSavings } = useSavings()
  const { isPrivacyEnabled } = usePrivacy()
  const fmt = isPrivacyEnabled ? maskCurrency : formatCurrency
  const [showForm, setShowForm] = useState(false)
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', deadline: '', monthlyContribution: '' })
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [contributionAmount, setContributionAmount] = useState('')

  const handleAddGoal = (e) => {
    e.preventDefault()
    if (!newGoal.name || !newGoal.targetAmount) return
    addGoal(newGoal.name, newGoal.targetAmount, newGoal.deadline, newGoal.monthlyContribution)
    setNewGoal({ name: '', targetAmount: '', deadline: '', monthlyContribution: '' })
    setShowForm(false)
  }

  const handleAddContribution = (goalId) => {
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) return
    addSavings(goalId, parseFloat(contributionAmount))
    setContributionAmount('')
    setSelectedGoal(null)
  }

  const calculateMonthlyNeeded = (goal) => {
    if (!goal.deadline) return null
    const now = new Date()
    const deadline = new Date(goal.deadline)
    const months = (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth())
    if (months <= 0) return null
    const remaining = goal.targetAmount - goal.savedAmount
    return remaining / months
  }

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[var(--accent)]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Obiettivi di risparmio
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs bg-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/30 px-3 py-1.5 rounded-full transition-colors"
        >
          {showForm ? '✕' : '+ Nuovo'}
        </button>
      </div>

      {/* Form nuovo obiettivo */}
      {showForm && (
        <form onSubmit={handleAddGoal} className="bg-white/5 rounded-xl p-4 space-y-3">
          <input
            type="text"
            placeholder="Nome obiettivo (es. Vacanze estive)"
            value={newGoal.name}
            onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
            className="w-full bg-white/5 border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Importo target"
              value={newGoal.targetAmount}
              onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
              className="w-full bg-white/5 border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
              required
              min="0"
              step="0.01"
            />
            <input
              type="number"
              placeholder="Contributo mensile (opzionale)"
              value={newGoal.monthlyContribution}
              onChange={(e) => setNewGoal({ ...newGoal, monthlyContribution: e.target.value })}
              className="w-full bg-white/5 border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
              min="0"
              step="0.01"
            />
          </div>
          <input
            type="date"
            placeholder="Scadenza (opzionale)"
            value={newGoal.deadline}
            onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
            className="w-full bg-white/5 border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 rounded-full text-sm font-medium bg-white/5 text-[var(--text-primary)] hover:bg-white/10 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-full text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] hover:bg-[var(--accent-hover)] transition-colors"
            >
              Crea obiettivo
            </button>
          </div>
        </form>
      )}

      {/* Lista obiettivi */}
      {goals.length === 0 ? (
        <p className="text-center text-[var(--text-secondary)] text-sm py-8">
          Nessun obiettivo di risparmio impostato.
          <br />
          <span className="text-xs">Clicca su "+ Nuovo" per iniziare! 🎯</span>
        </p>
      ) : (
        <div className="space-y-4">
          {goals.map(goal => {
            const progress = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100)
            const monthlyNeeded = calculateMonthlyNeeded(goal)
            const isComplete = progress >= 100

            return (
              <div key={goal.id} className="bg-white/5 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-primary)]">{goal.name}</h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {fmt(goal.savedAmount)} / {fmt(goal.targetAmount)}
                      {goal.deadline && (
                        <span className="ml-2">
                          · Scadenza: {new Date(goal.deadline).toLocaleDateString('it-IT')}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setSelectedGoal(goal.id)
                        setContributionAmount('')
                      }}
                      className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] px-2 py-1 rounded hover:bg-white/5 transition-colors"
                    >
                      + Aggiungi
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="text-xs text-[var(--text-secondary)] hover:text-[var(--danger)] px-2 py-1 rounded hover:bg-white/5 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Barra di avanzamento */}
                <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isComplete ? 'bg-[var(--success)]' : 'bg-[var(--accent)]'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                  <span>{isComplete ? '✅ Completato!' : `${Math.round(progress)}%`}</span>
                  {monthlyNeeded !== null && !isComplete && (
                    <span>Devi risparmiare {fmt(monthlyNeeded)}/mese</span>
                  )}
                  {goal.monthlyContribution > 0 && (
                    <span>Contributo: {fmt(goal.monthlyContribution)}/mese</span>
                  )}
                </div>

                {/* Form contributo rapido */}
                {selectedGoal === goal.id && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="number"
                      placeholder="Importo"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      className="flex-1 bg-white/5 border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                      min="0"
                      step="0.01"
                      autoFocus
                    />
                    <button
                      onClick={() => handleAddContribution(goal.id)}
                      className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] hover:bg-[var(--accent-hover)] transition-colors"
                    >
                      Salva
                    </button>
                    <button
                      onClick={() => setSelectedGoal(null)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/5 text-[var(--text-secondary)] hover:bg-white/10 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}