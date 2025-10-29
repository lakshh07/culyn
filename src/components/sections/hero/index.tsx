'use client'

import { FC, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'motion/react'
import { AuthModal } from '@/modals/auth'

const getMealTypeByTime = (): string => {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 11) {
    return 'breakfast'
  } else if (hour >= 11 && hour < 16) {
    return 'lunch'
  } else if (hour >= 16 && hour < 21) {
    return 'dinner'
  } else {
    return 'late night snacks'
  }
}

const MotionButton = motion.create(Button)

export const HeroSection: FC = () => {
  const currentMeal = useMemo(() => getMealTypeByTime(), [])

  return (
    <section className="relative flex min-h-[80vh] items-center justify-center px-4">
      <div className="mx-auto space-y-8 text-center">
        <div className="font-sharp-grotesk space-y-4">
          <motion.h1
            className="bg-linear-to-b from-black to-neutral-400 bg-clip-text text-[3vw] leading-[1.1] font-bold text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}>
            Discover & save the latest trending recipes.
          </motion.h1>
          <motion.p
            className="text-[3vw] leading-none text-neutral-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}>
            Here&apos;s what others are making for{' '}
            <em className="pr-0.5 text-neutral-900 italic">{currentMeal}</em> today.
          </motion.p>
        </div>

        <AuthModal
          trigger={
            <MotionButton
              className="mt-6 transition-none"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}>
              See more recipes
            </MotionButton>
          }
          type="signUp"
        />

        <motion.div
          className="-mt-4 flex items-center justify-center gap-1 font-mono text-xs text-neutral-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}>
          <p className="">Already have an account?</p>
          <AuthModal
            trigger={<span className="cursor-pointer font-medium underline">Log in</span>}
            type="signIn"
          />
        </motion.div>
      </div>
    </section>
  )
}
