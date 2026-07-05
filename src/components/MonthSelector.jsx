import { useMemo } from 'react'

export default function MonthSelector({ value, onChange }) {
  // Mese corrente
  const today = new Date()
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

  // Determina se siamo in modalità "Tutto l'anno"
  const isAllMode = value === 'all'

  // Calcola il mese da visualizzare
  const displayMonth = isAllMode ? currentMonth : value
  const [year, month] = displayMonth.split('-').map(Number)
  const displayDate = new Date(year, month - 1, 1)
  const displayLabel = displayDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })

  // Verifica se il mese visualizzato è quello corrente
  const isCurrentMonth = displayMonth === currentMonth

  // Navigazione mesi (solo se non siamo in modalità "Tutto l'anno")
  const goToMonth = (offset) => {
    if (isAllMode) {
      // Se siamo su "Tutto l'anno", la freccia torna al mese corrente
      onChange(currentMonth)
    } else {
      const [y, m] = displayMonth.split('-').map(Number)
      const newDate = new Date(y, m - 1 + offset, 1)
      const newMonth = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`
      onChange(newMonth)
    }
  }

  // Toggle modalità "Tutto l'anno"
  const toggleAllMode = () => {
    if (isAllMode) {
      onChange(currentMonth)
    } else {
      onChange('all')
    }
  }

  return (
    <div 
      className="flex items-center justify-between bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl px-1.5 sm:px-3 py-1.5 shadow-lg overflow-hidden w-full cursor-pointer hover:bg-[var(--bg-secondary)]/80 transition-colors"
      onClick={toggleAllMode}
    >
      {/* Freccia sinistra */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          goToMonth(-1)
        }}
        className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 active:bg-white/15 transition-all shrink-0 cursor-pointer"
        aria-label="Mese precedente"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Area centrale - cliccabile tramite il div padre */}
      <div className="flex-1 flex flex-col items-center justify-center mx-1 min-w-0 pointer-events-none">
        <span 
          className={`text-xs sm:text-sm font-semibold transition-all w-full truncate text-center ${
            isAllMode
              ? 'text-[var(--accent)]'
              : isCurrentMonth
                ? 'text-[var(--accent)]'  // 👈 Mese corrente in GIALLO
                : 'text-[var(--text-primary)]'
          }`}
        >
          {isAllMode ? 'Tutto l\'anno' : displayLabel}
        </span>
        <span className="text-[10px] sm:text-xs text-[var(--text-secondary)] transition-colors mt-0.5">
          {isAllMode ? 'tutti i mesi dell\'anno' : '(mostra tutto l\'anno)'}
        </span>
      </div>

      {/* Freccia destra */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          goToMonth(1)
        }}
        className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 active:bg-white/15 transition-all shrink-0 cursor-pointer"
        aria-label="Mese successivo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  )
}