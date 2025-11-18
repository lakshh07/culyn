import { FC } from 'react'
import { motion } from 'motion/react'
import NumberFlow from '@number-flow/react'

export const CircularProgress: FC<{ progress: number }> = ({ progress }) => {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative -ml-[0.5px] flex size-24 items-center justify-center">
      <svg className="absolute inset-0 size-24 -rotate-90 transform" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-neutral-200"
        />
        {/* Progress circle */}
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          className="text-neutral-600"
          style={{
            strokeDasharray: circumference,
          }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{
            duration: 0.8,
            ease: 'easeInOut',
          }}
        />
      </svg>
      <NumberFlow value={progress} suffix="%" className="font-mono text-sm font-medium" />
    </div>
  )
}
