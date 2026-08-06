import { createContext, useContext, useMemo, useState } from 'react'

const ConnectModalContext = createContext(null)

export function ConnectModalProvider({ children }) {
  const [state, setState] = useState({ isOpen: false, type: 'connection' })

  const value = useMemo(
    () => ({
      isOpen: state.isOpen,
      type: state.type,
      open: (type = 'connection') => setState({ isOpen: true, type }),
      close: () => setState((s) => ({ ...s, isOpen: false })),
      setType: (type) => setState((s) => ({ ...s, type })),
    }),
    [state]
  )

  return (
    <ConnectModalContext.Provider value={value}>
      {children}
    </ConnectModalContext.Provider>
  )
}

export function useConnectModal() {
  const ctx = useContext(ConnectModalContext)
  if (!ctx) {
    throw new Error('useConnectModal must be used inside a ConnectModalProvider')
  }
  return ctx
}
