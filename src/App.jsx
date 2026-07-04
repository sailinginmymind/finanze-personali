import { useState, lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useTransactions } from './context/TransactionContext'
import { seedData } from './utils/seedData'
import Sidebar from './components/Layout/Sidebar'
import BottomNav from './components/Layout/BottomNav'
import TransactionForm from './components/TransactionForm'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

function PageFallback() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-[#0d1321] rounded-2xl p-6 h-40 border border-white/5">
        <div className="w-32 h-4 bg-white/10 rounded" />
        <div className="w-48 h-8 bg-white/10 rounded mt-3" />
        <div className="flex gap-4 mt-4">
          <div className="w-24 h-6 bg-white/10 rounded" />
          <div className="w-24 h-6 bg-white/10 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#0d1321] rounded-2xl p-5 h-60 border border-white/5">
          <div className="w-36 h-5 bg-white/10 rounded mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-16 h-4 bg-white/10 rounded" />
                <div className="flex-1 h-5 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#0d1321] rounded-2xl p-5 h-60 border border-white/5">
          <div className="w-36 h-5 bg-white/10 rounded mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-16 h-4 bg-white/10 rounded" />
                <div className="flex-1 h-5 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [showForm, setShowForm] = useState(false)
  const { transactions } = useTransactions()

  const handleSeed = () => {
    if (transactions.length > 0) {
      if (!window.confirm('Sostituire i dati esistenti con quelli demo?')) return
    }
    seedData()
  }

  return (
    <div className="min-h-screen bg-[#060b14] text-slate-100 font-sans flex flex-col md:flex-row safe-bottom">
      <Sidebar onSeed={handleSeed} />

      <main className="flex-1 pb-20 md:pb-0 md:ml-64">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </Suspense>
        </div>
      </main>

      {/* Bottom nav mobile (contiene già il pulsante “+” nel FAB centrale) */}
      <BottomNav onAdd={() => setShowForm(true)} />

      {/* Pulsante “+” flottante su desktop (nascosto su mobile perché già nella BottomNav) */}
      <button
        onClick={() => setShowForm(true)}
        className="hidden md:flex fixed bottom-8 right-8 z-40 w-14 h-14 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl items-center justify-center text-[#060b14] text-2xl shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-transform"
        aria-label="Aggiungi transazione"
      >
        +
      </button>

      {showForm && <TransactionForm onClose={() => setShowForm(false)} />}
    </div>
  )
}