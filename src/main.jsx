import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { TransactionProvider } from './context/TransactionContext'
import { CategoriesProvider } from './context/CategoriesContext'
import { BudgetProvider } from './context/BudgetContext'
import { PrivacyProvider } from './context/PrivacyContext'
import { SavingsProvider } from './context/SavingsContext'
import { ThemeProvider } from './context/ThemeContext'  // 👈 nuovo

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/finanze-personali/">
      <ThemeProvider>  {/* 👈 deve essere il più esterno per applicare il tema a tutto */}
        <PrivacyProvider>
          <BudgetProvider>
            <CategoriesProvider>
              <TransactionProvider>
                <SavingsProvider>
                  <App />
                </SavingsProvider>
              </TransactionProvider>
            </CategoriesProvider>
          </BudgetProvider>
        </PrivacyProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)