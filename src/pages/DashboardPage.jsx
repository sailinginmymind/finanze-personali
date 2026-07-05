import { useState } from 'react'
import MonthSelector from '../components/MonthSelector'
import Dashboard from '../components/Dashboard'
import { useTransactions } from '../context/TransactionContext'

export default function DashboardPage() {
  const { monthFilter, setMonthFilter } = useTransactions()

  return (
    <div className="space-y-6">
      <MonthSelector value={monthFilter} onChange={setMonthFilter} />
      <Dashboard />
    </div>
  )
}