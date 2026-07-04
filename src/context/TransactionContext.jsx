import { createContext, useContext, useReducer, useEffect, useState, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'

const TransactionContext = createContext()
const STORAGE_KEY = 'finance_transactions'

const getInitialState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch (e) { console.error('Errore lettura localStorage', e) }
  return []
}

function transactionReducer(state, action) {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return [{ id: uuidv4(), ...action.payload, date: action.payload.date || new Date().toISOString().slice(0,10) }, ...state]
    case 'DELETE_TRANSACTION':
      return state.filter(t => t.id !== action.payload)
    default:
      return state
  }
}

export function TransactionProvider({ children }) {
  const [transactions, dispatch] = useReducer(transactionReducer, [], getInitialState)
  const [monthFilter, setMonthFilter] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    if (monthFilter === 'all') return transactions
    return transactions.filter(t => t.date.startsWith(monthFilter))
  }, [transactions, monthFilter])

  const addTransaction = (t) => dispatch({ type: 'ADD_TRANSACTION', payload: t })
  const deleteTransaction = (id) => dispatch({ type: 'DELETE_TRANSACTION', payload: id })

  return (
    <TransactionContext.Provider value={{
      transactions, filteredTransactions, monthFilter, setMonthFilter, addTransaction, deleteTransaction
    }}>
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactions() {
  const ctx = useContext(TransactionContext)
  if (!ctx) throw new Error('useTransactions must be used within TransactionProvider')
  return ctx
}