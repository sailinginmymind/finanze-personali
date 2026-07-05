import { useState, useEffect, useRef } from 'react'
import { useTransactions } from '../context/TransactionContext'
import { useCategories } from '../context/CategoriesContext'
import { formatNumber } from '../utils/format'

export default function ExportModal({ onClose }) {
  const { transactions } = useTransactions()
  const { categories } = useCategories()
  const [period, setPeriod] = useState('3')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [exportType, setExportType] = useState('csv')
  const modalRef = useRef(null)

  // Imposta date di default: end = oggi, start = oggi - 3 mesi
  useEffect(() => {
    const now = new Date()
    const end = now.toISOString().slice(0, 10)
    setEndDate(end)
    const start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
    setStartDate(start.toISOString().slice(0, 10))
  }, [])

  // Aggiorna start/end in base al periodo preimpostato
  useEffect(() => {
    if (period === 'custom') return
    const now = new Date()
    const end = now.toISOString().slice(0, 10)
    setEndDate(end)
    const months = parseInt(period)
    const start = new Date(now.getFullYear(), now.getMonth() - months, now.getDate())
    setStartDate(start.toISOString().slice(0, 10))
  }, [period])

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose()
  }

  // Filtra le transazioni per periodo
  const getFilteredTransactions = () => {
    if (!startDate || !endDate) return []
    return transactions.filter(t => t.date >= startDate && t.date <= endDate)
  }

  // Formatta data per l'esportazione (DD/MM/YYYY)
  const formatDateExport = (dateStr) => {
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
  }

  // Esporta in CSV
  const exportCSV = () => {
    const filtered = getFilteredTransactions()
    if (filtered.length === 0) {
      alert('Nessuna transazione nel periodo selezionato.')
      return
    }

    // Intestazioni
    const headers = ['Data', 'Tipo', 'Categoria', 'Importo', 'Nota']
    const rows = filtered.map(t => {
      const catList = categories[t.type] || []
      const cat = catList.find(c => c.name === t.category)
      return [
        formatDateExport(t.date),
        t.type === 'expense' ? 'Spesa' : 'Entrata',
        t.category,
        formatNumber(t.amount),
        t.note || ''
      ]
    })

    // Costruisci CSV
    let csv = headers.join(',') + '\n'
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n'
    })

    // Scarica
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transazioni_${startDate}_${endDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Esporta in PDF (usa window.print() con styling)
  const exportPDF = () => {
    const filtered = getFilteredTransactions()
    if (filtered.length === 0) {
      alert('Nessuna transazione nel periodo selezionato.')
      return
    }

    // Crea una finestra di stampa con styling dedicato
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Per favore, abilita i popup per questa pagina.')
      return
    }

    const style = `
      <style>
        body { font-family: 'Helvetica', Arial, sans-serif; margin: 40px; color: #333; }
        h1 { font-size: 24px; margin-bottom: 8px; color: #d4942b; }
        .subtitle { font-size: 14px; color: #666; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background-color: #f5f5f5; text-align: left; padding: 8px 12px; border-bottom: 2px solid #ddd; }
        td { padding: 6px 12px; border-bottom: 1px solid #eee; }
        tr:nth-child(even) { background-color: #fafafa; }
        .total { margin-top: 20px; font-weight: bold; text-align: right; font-size: 14px; }
        .negative { color: #c4554d; }
        .positive { color: #2e9e7b; }
        .footer { margin-top: 30px; font-size: 10px; color: #999; text-align: center; border-top: 1px solid #ddd; padding-top: 10px; }
      </style>
    `

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Transazioni ${startDate} - ${endDate}</title>
        ${style}
      </head>
      <body>
        <h1>📊 Fin.Io - Report Transazioni</h1>
        <div class="subtitle">Periodo: ${formatDateExport(startDate)} - ${formatDateExport(endDate)}</div>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Categoria</th>
              <th>Importo</th>
              <th>Nota</th>
            </tr>
          </thead>
          <tbody>
    `

    let totalIncome = 0
    let totalExpense = 0

    filtered.sort((a, b) => a.date.localeCompare(b.date)).forEach(t => {
      const amount = parseFloat(t.amount)
      if (t.type === 'income') totalIncome += amount
      else totalExpense += amount

      const catList = categories[t.type] || []
      const cat = catList.find(c => c.name === t.category)
      const emoji = cat?.emoji || ''
      const typeLabel = t.type === 'expense' ? 'Spesa' : 'Entrata'
      const amountStr = t.type === 'expense' ? `- € ${formatNumber(amount)}` : `+ € ${formatNumber(amount)}`
      const amountClass = t.type === 'expense' ? 'negative' : 'positive'

      html += `
        <tr>
          <td>${formatDateExport(t.date)}</td>
          <td>${emoji} ${typeLabel}</td>
          <td>${t.category}</td>
          <td class="${amountClass}">${amountStr}</td>
          <td>${t.note || ''}</td>
        </tr>
      `
    })

    const balance = totalIncome - totalExpense
    const balanceClass = balance >= 0 ? 'positive' : 'negative'

    html += `
          </tbody>
        </table>
        <div class="total">
          Totale Entrate: <span class="positive">+ € ${formatNumber(totalIncome)}</span><br>
          Totale Spese: <span class="negative">- € ${formatNumber(totalExpense)}</span><br>
          Saldo: <span class="${balanceClass}">${balance >= 0 ? '+' : '-'} € ${formatNumber(Math.abs(balance))}</span>
        </div>
        <div class="footer">
          Generato da Fin.Io il ${new Date().toLocaleDateString('it-IT')} · ${filtered.length} transazioni
        </div>
      </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()

    // Attendere il caricamento e poi stampare
    printWindow.onload = function() {
      printWindow.print()
      printWindow.onafterprint = function() {
        printWindow.close()
      }
    }
  }

  const handleExport = () => {
    if (exportType === 'csv') {
      exportCSV()
    } else {
      exportPDF()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="w-full sm:max-w-md bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto animate-zoom-in"
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">📤 Esporta dati</h2>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-white text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Formato esportazione */}
        <div className="mb-4">
          <p className="text-xs text-[var(--text-secondary)] mb-2">Formato</p>
          <div className="flex gap-2">
            <button
              onClick={() => setExportType('csv')}
              className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                exportType === 'csv'
                  ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30'
                  : 'bg-white/5 text-[var(--text-secondary)] border border-[var(--border)] hover:bg-white/10'
              }`}
            >
              📄 CSV
            </button>
            <button
              onClick={() => setExportType('pdf')}
              className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                exportType === 'pdf'
                  ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30'
                  : 'bg-white/5 text-[var(--text-secondary)] border border-[var(--border)] hover:bg-white/10'
              }`}
            >
              📑 PDF
            </button>
          </div>
        </div>

        {/* Selettore periodo */}
        <div className="mb-4">
          <p className="text-xs text-[var(--text-secondary)] mb-2">Periodo</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {['3', '6', '12'].map(months => (
              <button
                key={months}
                onClick={() => setPeriod(months)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  period === months
                    ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30'
                    : 'bg-white/5 text-[var(--text-secondary)] border border-[var(--border)] hover:bg-white/10'
                }`}
              >
                Ultimi {months} mesi
              </button>
            ))}
            <button
              onClick={() => setPeriod('custom')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                period === 'custom'
                  ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30'
                  : 'bg-white/5 text-[var(--text-secondary)] border border-[var(--border)] hover:bg-white/10'
              }`}
            >
              Personalizzato
            </button>
          </div>

          {period === 'custom' && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[10px] text-[var(--text-secondary)] block mb-1">Da</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white/5 border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-[var(--text-secondary)] block mb-1">A</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white/5 border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                />
              </div>
            </div>
          )}
        </div>

        {/* Info transazioni */}
        <div className="bg-white/5 rounded-xl px-4 py-3 mb-4">
          <p className="text-xs text-[var(--text-secondary)]">
            Transazioni nel periodo selezionato:{' '}
            <span className="font-semibold text-[var(--text-primary)]">
              {getFilteredTransactions().length}
            </span>
          </p>
        </div>

        {/* Pulsanti azione */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-full text-sm font-medium bg-white/5 text-[var(--text-primary)] hover:bg-white/10 transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleExport}
            className="flex-1 px-4 py-2 rounded-full text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] hover:bg-[var(--accent-hover)] transition-colors active:scale-95"
          >
            Esporta {exportType === 'csv' ? 'CSV' : 'PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}