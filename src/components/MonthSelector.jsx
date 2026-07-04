import { useMemo } from 'react'

export default function MonthSelector({ value, onChange }) {
  const months = useMemo(() => {
    const today = new Date()
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
  const isAll = value === 'all'

  const goToPrevious = () => {
    if (isAll) onChange(months[months.length - 1].value)
    else { const newIndex = currentIndex - 1; if (newIndex >= 0) onChange(months[newIndex].value) }
  }

  const goToNext = () => {
    if (isAll) onChange(months[0].value)
    else { const newIndex = currentIndex + 1; if (newIndex < months.length) onChange(months[newIndex].value); else onChange('all') }
  }

  return (
    <div className="flex items-center justify-between bg-[#0d1321] border border-white/5 rounded-2xl px-3 py-2 shadow-lg">
      <button onClick={goToPrevious} className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-30" disabled={!isAll && currentIndex === 0} aria-label="Mese precedente">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
      </button>
      <div className="flex-1 text-center">
        <button onClick={() => onChange('all')} className={`text-sm font-semibold transition-all ${isAll ? 'text-amber-300 bg-amber-500/10 px-4 py-1 rounded-full' : 'text-slate-400 hover:text-white'}`}>
          {isAll ? 'Tutti i mesi' : months[currentIndex]?.label || ''}
        </button>
        {!isAll && <button onClick={() => onChange('all')} className="block mx-auto mt-0.5 text-xs text-slate-500 hover:text-amber-400 transition-colors">(mostra tutti)</button>}
      </div>
      <button onClick={goToNext} className="p-2 text-slate-400 hover:text-white transition-colors" aria-label="Mese successivo">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
      </button>
    </div>
  )
}