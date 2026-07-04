import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { TransactionProvider } from './context/TransactionContext'
import { CategoriesProvider } from './context/CategoriesContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/finanze-personali">   {/* <-- aggiunto */}
      <CategoriesProvider>
        <TransactionProvider>
          <App />
        </TransactionProvider>
      </CategoriesProvider>
    </BrowserRouter>
  </React.StrictMode>
)