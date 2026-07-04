import { useMemo } from 'react'

export default function MonthSelector({ value, onChange }) {
  // Mese corrente reale (oggi)
  const today = new Date()
  const currentRealMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

  const months = useMemo(() => {
    const list = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      list.push({
        value: `${year}-${month}`,
        label: d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
      })
    }
    return list
  }, [])

  const currentIndex = months.findIndex(m => m.value === value)

  const goToNext = () => {
    if (value === 'all') onChange(months[0].value)
    else if (currentIndex === months.length - 1) onChange('all')
    else onChange(months[currentIndex + 1].value)
  }

  const goToPrevious = () => {
    if (value === 'all') onChange(months[months.length - 1].value)
    else if (currentIndex === 0) onChange('all')
    else onChange(months[currentIndex - 1].value)
  }

  const label = value === 'all' ? 'Tutti i mesi' : months[currentIndex]?.label || ''

  return (
    <div className="flex items-center justify-between bg-[#0d1321] border border-white/5 rounded-2xl px-2 sm:px-3 py-2 shadow-lg overflow-hidden">
      {/* Freccia sinistra */}
      <button
        onClick={goToPrevious}
        className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all shrink-0"
        aria-label="Mese precedente"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Mese visualizzato */}
      <div className="flex-1 flex flex-col items-center justify-center mx-1 min-w-0">
        <button
          onClick={() => onChange(value === 'all' ? months[months.length - 1].value : 'all')}
          className={`text-xs sm:text-sm font-semibold transition-all w-full truncate ${
            value === 'all'
              ? 'text-amber-300 bg-amber-500/10 px-2 sm:px-4 py-1 rounded-full'
              : value === currentRealMonth
                ? 'text-amber-400 hover:text-amber-300'   // Mese corrente in ambra
                : 'text-slate-200 hover:text-white'
          }`}
        >
          {label}
        </button>
        {value !== 'all' && (
          <button
            onClick={() => onChange('all')}
            className="text-[10px] sm:text-xs text-slate-500 hover:text-amber-400 transition-colors mt-0.5"
          >
            (mostra tutti)
          </button>
        )}
      </div>

      {/* Freccia destra */}
      <button
        onClick={goToNext}
        className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all shrink-0"
        aria-label="Mese successivo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  )
}