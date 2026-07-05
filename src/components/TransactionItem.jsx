// TransactionItem.jsx
import { formatNumber } from '../utils/format'

export default function TransactionItem({ transaction, categories, fmtNumber }) {
  const catList = categories[transaction.type] || []
  const cat = catList.find(c => c.name === transaction.category)
  const emoji = cat?.emoji || (transaction.type === 'expense' ? '📌' : '💰')
  const color = cat?.color || '#64748B'
  
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0" style={{ backgroundColor: `${color}20` }}>
          <span>{emoji}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{transaction.note || transaction.category}</p>
          <p className="text-[10px] text-[var(--text-secondary)]">
            {new Date(transaction.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} · {transaction.category}
          </p>
        </div>
      </div>
      <span className={`text-sm font-semibold ml-2 ${transaction.type === 'expense' ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
        {transaction.type === 'expense' ? '-' : '+'} €{fmtNumber(transaction.amount)}
      </span>
    </div>
  )
}