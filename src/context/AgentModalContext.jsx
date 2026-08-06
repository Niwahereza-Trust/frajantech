import { createContext, useContext, useMemo, useState } from 'react'

const AgentModalContext = createContext(null)

export function AgentModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)

  const value = useMemo(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [isOpen]
  )

  return (
    <AgentModalContext.Provider value={value}>
      {children}
    </AgentModalContext.Provider>
  )
}

export function useAgentModal() {
  const ctx = useContext(AgentModalContext)
  if (!ctx) {
    throw new Error('useAgentModal must be used inside an AgentModalProvider')
  }
  return ctx
}
