import React, { createContext, useContext } from 'react'

interface ShareImportContextValue {
  triggerImport: (url: string) => void
  resumeImport: (jobId: string) => void
}

const ShareImportContext = createContext<ShareImportContextValue>({
  triggerImport: () => {},
  resumeImport: () => {},
})

export function ShareImportProvider({
  children,
  triggerImport,
  resumeImport,
}: {
  children: React.ReactNode
  triggerImport: (url: string) => void
  resumeImport: (jobId: string) => void
}) {
  return (
    <ShareImportContext.Provider value={{ triggerImport, resumeImport }}>
      {children}
    </ShareImportContext.Provider>
  )
}

export function useShareImportContext() {
  return useContext(ShareImportContext)
}
