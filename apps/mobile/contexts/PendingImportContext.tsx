import React, { createContext, useContext, useState } from 'react'

interface PendingImportContextValue {
  pendingJobId: string | null
  setPendingJobId: (id: string | null) => void
}

const PendingImportContext = createContext<PendingImportContextValue>({
  pendingJobId: null,
  setPendingJobId: () => {},
})

export function PendingImportProvider({ children }: { children: React.ReactNode }) {
  const [pendingJobId, setPendingJobId] = useState<string | null>(null)

  return (
    <PendingImportContext.Provider value={{ pendingJobId, setPendingJobId }}>
      {children}
    </PendingImportContext.Provider>
  )
}

export function usePendingImport() {
  return useContext(PendingImportContext)
}
