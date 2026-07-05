import { createContext, useContext, useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

const SavingsContext = createContext()
const STORAGE_KEY = 'finance_savings_goals'

function getInitial() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch (e) {}
  return []
}

export function SavingsProvider({ children }) {
  const [goals, setGoals] = useState(getInitial)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
  }, [goals])

  const addGoal = (name, targetAmount, deadline, monthlyContribution) => {
    const newGoal = {
      id: uuidv4(),
      name,
      targetAmount: parseFloat(targetAmount),
      deadline: deadline || null,
      monthlyContribution: parseFloat(monthlyContribution) || 0,
      savedAmount: 0,
      createdAt: new Date().toISOString(),
      createdAtMonth: new Date().toISOString().slice(0, 7)
    }
    setGoals(prev => [...prev, newGoal])
  }

  const updateGoal = (id, updates) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g))
  }

  const deleteGoal = (id) => {
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  const addSavings = (id, amount) => {
    setGoals(prev => prev.map(g => 
      g.id === id ? { ...g, savedAmount: g.savedAmount + parseFloat(amount) } : g
    ))
  }

  return (
    <SavingsContext.Provider value={{ goals, addGoal, updateGoal, deleteGoal, addSavings }}>
      {children}
    </SavingsContext.Provider>
  )
}

export function useSavings() {
  const context = useContext(SavingsContext)
  if (!context) throw new Error('useSavings must be used within SavingsProvider')
  return context
}