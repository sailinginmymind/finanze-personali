import { createContext, useContext, useState, useEffect } from 'react'

const PrivacyContext = createContext()

const STORAGE_KEY = 'finanze_privacy'

function getInitial() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'true'
  } catch (e) {
    return false
  }
}

export function PrivacyProvider({ children }) {
  const [isPrivacyEnabled, setIsPrivacyEnabled] = useState(getInitial)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, isPrivacyEnabled)
  }, [isPrivacyEnabled])

  const togglePrivacy = () => setIsPrivacyEnabled(prev => !prev)

  return (
    <PrivacyContext.Provider value={{ isPrivacyEnabled, togglePrivacy }}>
      {children}
    </PrivacyContext.Provider>
  )
}

export function usePrivacy() {
  const context = useContext(PrivacyContext)
  if (!context) throw new Error('usePrivacy must be used within PrivacyProvider')
  return context
}