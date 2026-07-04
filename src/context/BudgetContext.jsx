import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const BudgetContext = createContext()
const STORAGE_KEY = 'finance_budgets'

function getInitial() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch (e) {}
  return {}
}

export function BudgetProvider({ children }) {
  const [budgets, setBudgets] = useState(getInitial)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets))
  }, [budgets])

  const setBudget = useCallback((month, category, amount) => {
    setBudgets(prev => {
      const monthKey = month // formato 'YYYY-MM'
      const updated = {
        ...prev,
        [monthKey]: {
          ...(prev[monthKey] || {}),
          [category]: amount
        }
      }
      // Se amount è 0 o vuoto, rimuovi la categoria dal mese per pulizia
      if (amount === 0 || amount === '' || amount === null) {
        delete updated[monthKey][category]
        if (Object.keys(updated[monthKey]).length === 0) {
          delete updated[monthKey]
        }
      }
      return updated
    })
  }, [])

  const getBudget = (month, category) => {
    return budgets[month]?.[category] || 0
  }

  const getMonthBudgets = (month) => {
    return budgets[month] || {}
  }

  return (
    <BudgetContext.Provider value={{ budgets, setBudget, getBudget, getMonthBudgets }}>
      {children}
    </BudgetContext.Provider>
  )
}

export function useBudgets() {
  const context = useContext(BudgetContext)
  if (!context) throw new Error('useBudgets must be used within BudgetProvider')
  return context
}