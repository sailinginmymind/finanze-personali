import { useState } from 'react'
import { useTransactions } from '../context/TransactionContext'
import { useCategories } from '../context/CategoriesContext'
import CategoryManager from '../components/CategoryManager'
import { usePrivacy } from '../context/PrivacyContext'

export default function ProfilePage() {
  const { transactions } = useTransactions()
  const { categories } = useCategories()
  const [showCategories, setShowCategories] = useState(false)
  const { isPrivacyEnabled, togglePrivacy } = usePrivacy()

  const exportData = () => {
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
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">Profilo & Impostazioni</h2>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
        <button onClick={() => setShowCategories(true)} className="w-full text-left flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
          <span className="font-medium text-[var(--text-primary)]">Gestione categorie</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[var(--text-secondary)]"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        </button>
        <button onClick={handleSeed} className="w-full text-left flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
          <span className="font-medium text-[var(--text-primary)]">Importa dati demo</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[var(--text-secondary)]"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
        </button>
        <button onClick={exportData} className="w-full text-left flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
          <span className="font-medium text-[var(--text-primary)]">Esporta dati (JSON)</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[var(--text-secondary)]"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
        </button>
        <button onClick={resetData} className="w-full text-left flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors text-[var(--danger)]">
          <span className="font-medium">Cancella tutti i dati</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
        </button>
      </div>

      {/* Blocco Privacy */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-medium text-[var(--text-primary)]">Privacy</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-secondary)]">Modalità privacy</span>
          <button
            onClick={togglePrivacy}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
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
        <p className="text-xs text-[var(--text-secondary)]">
          Quando attivo, tutti gli importi vengono sostituiti da asterischi per proteggere la tua privacy.
        </p>
      </div>

      <p className="text-xs text-[var(--text-secondary)] text-center">Fin.Io v1.0</p>
      {showCategories && <CategoryManager onClose={() => setShowCategories(false)} />}
    </div>
  )
}