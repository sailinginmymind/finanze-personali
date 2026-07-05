import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { TransactionProvider } from './context/TransactionContext'
import { CategoriesProvider } from './context/CategoriesContext'
import { BudgetProvider } from './context/BudgetContext'
import { PrivacyProvider } from './context/PrivacyContext'
import { SavingsProvider } from './context/SavingsContext'  // 👈 nuovo

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/finanze-personali/">
      <PrivacyProvider>
        <BudgetProvider>
          <CategoriesProvider>
            <TransactionProvider>
              <SavingsProvider>  {/* 👈 avvolge tutto */}
                <App />
              </SavingsProvider>
            </TransactionProvider>
          </CategoriesProvider>
        </BudgetProvider>
      </PrivacyProvider>
    </BrowserRouter>
  </React.StrictMode>
)