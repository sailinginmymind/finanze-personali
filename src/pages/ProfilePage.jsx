import { useState } from 'react'
import { useTransactions } from '../context/TransactionContext'
import { useCategories } from '../context/CategoriesContext'
import CategoryManager from '../components/CategoryManager'
import { usePrivacy } from '../context/PrivacyContext'
import BudgetManagerModal from '../components/BudgetManagerModal'
import ExportModal from '../components/ExportModal'
import FeedbackModal from '../components/FeedbackModal'

export default function ProfilePage() {
  const { transactions } = useTransactions()
  const { categories } = useCategories()
  const [showCategories, setShowCategories] = useState(false)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const { isPrivacyEnabled, togglePrivacy } = usePrivacy()

  const exportJSON = () => {
    const data = { transactions, categories }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'finanze_backup.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetData = () => {
    if (window.confirm('Cancellare TUTTI i dati? Questa azione è irreversibile.')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  const handleSeed = () => {
    if (transactions.length > 0) {
      if (!window.confirm('Sostituire i dati esistenti con quelli demo?')) return
    }
    import('../utils/seedData').then(module => module.seedData())
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Profilo & Impostazioni</h2>

      {/* Card 1 – Gestione Budget */}
      <div
        onClick={() => setShowBudgetModal(true)}
        className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-4 shadow-lg cursor-pointer hover:bg-white/5 transition-colors active:scale-[0.99] flex items-center justify-between"
      >
        <span className="font-medium text-[var(--text-primary)] text-sm flex items-center gap-3">
          <span className="w-8 text-center text-base">💰</span>
          Gestione Budget
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[var(--text-secondary)] shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>

      {/* Card 2 – Gestione Categorie */}
      <div
        onClick={() => setShowCategories(true)}
        className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-4 shadow-lg cursor-pointer hover:bg-white/5 transition-colors active:scale-[0.99] flex items-center justify-between"
      >
        <span className="font-medium text-[var(--text-primary)] text-sm flex items-center gap-3">
          <span className="w-8 text-center text-base">📂</span>
          Gestione categorie
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[var(--text-secondary)] shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>

      {/* Card 3 – Esporta CSV/PDF */}
      <div
        onClick={() => setShowExportModal(true)}
        className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-4 shadow-lg cursor-pointer hover:bg-white/5 transition-colors active:scale-[0.99] flex items-center justify-between"
      >
        <span className="font-medium text-[var(--text-primary)] text-sm flex items-center gap-3">
          <span className="w-8 text-center text-base">📤</span>
          Esporta dati (CSV/PDF)
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[var(--text-secondary)] shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>

      {/* Card 4 – Importa dati demo */}
      <div
        onClick={handleSeed}
        className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-4 shadow-lg cursor-pointer hover:bg-white/5 transition-colors active:scale-[0.99] flex items-center justify-between"
      >
        <span className="font-medium text-[var(--text-primary)] text-sm flex items-center gap-3">
          <span className="w-8 text-center text-base">📥</span>
          Importa dati demo
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[var(--text-secondary)] shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>

      {/* Card 5 – Esporta backup JSON */}
      <div
        onClick={exportJSON}
        className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-4 shadow-lg cursor-pointer hover:bg-white/5 transition-colors active:scale-[0.99] flex items-center justify-between"
      >
        <span className="font-medium text-[var(--text-primary)] text-sm flex items-center gap-3">
          <span className="w-8 text-center text-base">📦</span>
          Esporta backup (JSON)
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[var(--text-secondary)] shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>

      {/* Card 6 – Invia feedback (STILIZZATA e PENULTIMA) */}
      <div
        onClick={() => setShowFeedbackModal(true)}
        className="bg-[var(--bg-secondary)] border-2 border-[var(--accent)]/40 rounded-2xl p-4 shadow-lg cursor-pointer hover:bg-[var(--accent)]/5 hover:border-[var(--accent)] transition-colors active:scale-[0.99] flex items-center justify-between"
      >
        <span className="font-medium text-[var(--text-primary)] text-sm flex items-center gap-3">
          <span className="w-8 text-center text-base">💬</span>
          <span className="text-[var(--accent)]">Invia feedback</span>
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[var(--accent)] shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>

      {/* Card 7 – Cancella tutti i dati */}
      <div
        onClick={resetData}
        className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-4 shadow-lg cursor-pointer hover:bg-white/5 transition-colors active:scale-[0.99] flex items-center justify-between"
      >
        <span className="font-medium text-sm flex items-center gap-3 text-[var(--danger)]">
          <span className="w-8 text-center text-base">🗑️</span>
          Cancella tutti i dati
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[var(--danger)] shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>

      {/* Card 8 – Privacy */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-[var(--text-primary)] text-sm flex items-center gap-3">
            <span className="w-8 text-center text-base">🔒</span>
            Privacy
          </span>
          <button
            onClick={togglePrivacy}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
              isPrivacyEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isPrivacyEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <p className="text-xs text-[var(--text-secondary)] ml-11">
          Quando attivo, tutti gli importi vengono sostituiti da asterischi per proteggere la tua privacy.
        </p>
      </div>

      {/* Footer */}
      <p className="text-xs text-[var(--text-secondary)] text-center pt-2">Fin.Io v1.0</p>

      {/* Modali */}
      {showCategories && <CategoryManager onClose={() => setShowCategories(false)} />}
      {showBudgetModal && <BudgetManagerModal onClose={() => setShowBudgetModal(false)} />}
      {showExportModal && <ExportModal onClose={() => setShowExportModal(false)} />}
      {showFeedbackModal && <FeedbackModal onClose={() => setShowFeedbackModal(false)} />}
    </div>
  )
}