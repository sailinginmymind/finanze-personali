import { useState } from 'react'
import { useTransactions } from '../context/TransactionContext'
import { useCategories } from '../context/CategoriesContext'
import CategoryManager from '../components/CategoryManager'

export default function ProfilePage({ onSeed }) {
  const { transactions } = useTransactions()
  const { categories } = useCategories()
  const [showCategories, setShowCategories] = useState(false)

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

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">Profilo & Impostazioni</h2>
      <div className="bg-[#0d1321] border border-white/5 rounded-2xl p-5 space-y-4">
        <button onClick={() => setShowCategories(true)} className="w-full text-left flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
          <span className="font-medium">Gestione categorie</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        </button>
        <button onClick={onSeed} className="w-full text-left flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
          <span className="font-medium">Importa dati demo</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
        </button>
        <button onClick={exportData} className="w-full text-left flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
          <span className="font-medium">Esporta dati (JSON)</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
        </button>
        <button onClick={resetData} className="w-full text-left flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors text-rose-400">
          <span className="font-medium">Cancella tutti i dati</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
        </button>
      </div>
      <p className="text-xs text-slate-600 text-center">Fin.Io v1.0</p>
      {showCategories && <CategoryManager onClose={() => setShowCategories(false)} />}
    </div>
  )
}