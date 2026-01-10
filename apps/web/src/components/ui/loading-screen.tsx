import React from 'react'
import { Spinner } from './spinner'

export const LoadingScreen = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 font-mono text-neutral-500">
      <Spinner className="size-4" />
      <p className="text-sm sm:text-sm">the best things in life are worth the wait</p>
    </div>
  )
}
