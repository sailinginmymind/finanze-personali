import { useState, lazy, Suspense, useEffect, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useTransactions } from './context/TransactionContext'
import { seedData } from './utils/seedData'
import Sidebar from './components/Layout/Sidebar'
import BottomNav from './components/Layout/BottomNav'
import TransactionForm from './components/TransactionForm'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

// Componente che gestisce lo scroll all'inizio di ogni navigazione
function ScrollToTop() {
  const { pathname } = useLocation()
  const mainRef = useRef(null)

  useEffect(() => {
    // Cerca il main con overflow-y-auto
    const main = document.querySelector('main')
    if (main) {
      main.scrollTo(0, 0)
    }
  }, [pathname])

  return null
}

function PageFallback() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-[var(--bg-secondary)] rounded-2xl p-6 h-40 border border-[var(--border)]">
        <div className="w-32 h-4 bg-white/10 rounded" />
        <div className="w-48 h-8 bg-white/10 rounded mt-3" />
        <div className="flex gap-4 mt-4">
          <div className="w-24 h-6 bg-white/10 rounded" />
          <div className="w-24 h-6 bg-white/10 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[var(--bg-secondary)] rounded-2xl p-5 h-60 border border-[var(--border)]">
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
        <div className="bg-[var(--bg-secondary)] rounded-2xl p-5 h-60 border border-[var(--border)]">
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
    <div className="h-full bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans flex flex-col md:flex-row">
      <Sidebar onSeed={handleSeed} />
      <ScrollToTop /> {/* 👈 Gestisce lo scroll su ogni cambio di pagina */}

      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 md:ml-64 safe-top">
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

      <BottomNav onAdd={() => setShowForm(true)} />

      <button
        onClick={() => setShowForm(true)}
        className="hidden md:flex fixed bottom-8 right-8 z-40 w-14 h-14 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] rounded-2xl items-center justify-center text-[var(--bg-primary)] text-2xl shadow-lg shadow-[var(--accent)]/30 hover:scale-105 active:scale-95 transition-transform"
        aria-label="Aggiungi transazione"
      >
        +
      </button>

      {showForm && <TransactionForm onClose={() => setShowForm(false)} />}
    </div>
  )
}