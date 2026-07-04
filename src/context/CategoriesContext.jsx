import { createContext, useContext, useState, useEffect } from 'react'

const CategoriesContext = createContext()

const DEFAULT_CATEGORIES = {
  expense: [
    { name: 'Cibo', color: '#F59E0B', emoji: '🍔' },
    { name: 'Trasporti', color: '#3B82F6', emoji: '🚗' },
    { name: 'Casa', color: '#8B5CF6', emoji: '🏠' },
    { name: 'Salute', color: '#EC4899', emoji: '💊' },
    { name: 'Intrattenimento', color: '#10B981', emoji: '🎬' },
    { name: 'Altro', color: '#EF4444', emoji: '📦' }
  ],
  income: [
    { name: 'Stipendio', color: '#10B981', emoji: '💼' },
    { name: 'Freelance', color: '#3B82F6', emoji: '💻' },
    { name: 'Regalo', color: '#F59E0B', emoji: '🎁' },
    { name: 'Investimenti', color: '#8B5CF6', emoji: '📈' },
    { name: 'Altro', color: '#06B6D4', emoji: '💰' }
  ]
}

const STORAGE_KEY = 'finance_categories'

function normalizeCategoryItem(item, type) {
  if (typeof item === 'object' && item !== null && typeof item.name === 'string') {
    return {
      name: item.name,
      color: item.color || '#64748B',
      emoji: item.emoji || '📌'
    }
  }
  if (typeof item === 'string') {
    const defaults = DEFAULT_CATEGORIES[type]
    const found = defaults.find(c => c.name === item)
    return found ? { ...found } : { name: item, color: '#64748B', emoji: '📌' }
  }
  return { name: 'Sconosciuto', color: '#64748B', emoji: '❓' }
}

function getInitial() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      const normalized = { expense: [], income: [] }
      for (const type of ['expense', 'income']) {
        if (Array.isArray(parsed[type])) {
          normalized[type] = parsed[type].map(item => normalizeCategoryItem(item, type))
        } else {
          normalized[type] = DEFAULT_CATEGORIES[type].map(c => ({ ...c }))
        }
      }
      return normalized
    }
  } catch (e) {}
  return JSON.parse(JSON.stringify(DEFAULT_CATEGORIES))
}

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState(getInitial)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
  }, [categories])

  const addCategory = (type, name, color = '#64748B', emoji = '📌') =>
    setCategories(prev => ({ ...prev, [type]: [...prev[type], { name, color, emoji }] }))
  const removeCategory = (type, name) =>
    setCategories(prev => ({ ...prev, [type]: prev[type].filter(c => c.name !== name) }))
  const updateCategory = (type, oldName, newCat) =>
    setCategories(prev => ({ ...prev, [type]: prev[type].map(c => c.name === oldName ? { ...newCat } : c) }))
  const renameCategory = (type, oldName, newName) =>
    setCategories(prev => ({ ...prev, [type]: prev[type].map(c => c.name === oldName ? { ...c, name: newName } : c) }))

  return (
    <CategoriesContext.Provider value={{ categories, addCategory, removeCategory, updateCategory, renameCategory }}>
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories() {
  const ctx = useContext(CategoriesContext)
  if (!ctx) throw new Error('useCategories must be used within CategoriesProvider')
  return ctx
}