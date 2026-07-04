import { useState, useEffect, useRef } from 'react'
import { useCategories } from '../context/CategoriesContext'

const COLORS = ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#64748B']

export default function CategoryManager({ onClose }) {
  const { categories, addCategory, removeCategory, updateCategory, renameCategory } = useCategories()
  const [activeTab, setActiveTab] = useState('expense')
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(COLORS[0])
  const [newEmoji, setNewEmoji] = useState('📌')
  const modalRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const currentList = Array.isArray(categories[activeTab]) ? categories[activeTab] : []

  const handleAdd = () => {
    const name = newName.trim()
    if (name && !currentList.some(c => c.name === name)) {
      addCategory(activeTab, name, newColor, newEmoji)
      setNewName('')
      setNewColor(COLORS[0])
      setNewEmoji('📌')
    }
  }

  const handleUpdate = (oldName, newProps) => updateCategory(activeTab, oldName, newProps)
  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4" onClick={handleOverlayClick}>
      <div ref={modalRef} className="w-full sm:max-w-md bg-[#0d1321]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto animate-zoom-in">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold">Gestione Categorie</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div className="flex gap-2 mb-4">
          <button onClick={() => setActiveTab('expense')} className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'expense' ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5 text-slate-400'}`}>Spese</button>
          <button onClick={() => setActiveTab('income')} className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400'}`}>Entrate</button>
        </div>
        <div className="space-y-2 mb-5">
          {currentList.map(cat => (
            <CategoryRow key={cat.name} category={cat} onDelete={() => removeCategory(activeTab, cat.name)} onUpdate={(props) => handleUpdate(cat.name, props)} onRename={(newName) => renameCategory(activeTab, cat.name, newName)} />
          ))}
        </div>
        <div className="border-t border-white/5 pt-4 space-y-3">
          <h3 className="text-sm font-medium text-slate-300">Nuova categoria</h3>
          <div className="flex gap-2 items-center">
            <input type="text" placeholder="Nome" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0" />
            <input type="text" value={newEmoji} onChange={(e) => setNewEmoji(e.target.value || '📌')} maxLength="2" className="w-12 bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-center text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            <button onClick={handleAdd} className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3 py-2 rounded-xl text-sm font-medium">+</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CategoryRow({ category, onDelete, onUpdate, onRename }) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(category.name)
  const [editColor, setEditColor] = useState(category.color)
  const [editEmoji, setEditEmoji] = useState(category.emoji)

  const save = () => {
    const newName = editName.trim()
    if (newName && newName !== category.name) onRename(newName)
    onUpdate({ name: newName || category.name, color: editColor, emoji: editEmoji })
    setEditing(false)
  }

  return (
    <div className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2 gap-2">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-lg">{category.emoji}</span>
        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: category.color }} />
        {editing ? (
          <input value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm w-full" autoFocus />
        ) : (
          <span className="text-white text-sm truncate">{category.name}</span>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {editing ? (
          <>
            <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
            <input type="text" value={editEmoji} onChange={(e) => setEditEmoji(e.target.value || '📌')} maxLength="2" className="w-8 bg-white/5 border border-white/10 rounded px-1 text-center text-sm" />
            <button onClick={save} className="text-xs text-emerald-400 hover:text-emerald-300 p-1">✓</button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)} className="text-xs text-slate-400 hover:text-white p-1">✏️</button>
            <button onClick={onDelete} className="text-xs text-slate-400 hover:text-rose-400 p-1">🗑️</button>
          </>
        )}
      </div>
    </div>
  )
}