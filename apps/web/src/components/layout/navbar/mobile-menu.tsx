'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { ArrowIcon, MobileIcon } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { useSession } from '@/hooks/use-session'
import { Button } from '@/components/ui/button'
import { useMediaQuery } from 'usehooks-ts'

interface NavItem {
  label: string
  href?: string
  onClick?: () => void
}

const menuVariants = {
  closed: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
      when: 'afterChildren',
    },
  },
  open: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
      when: 'beforeChildren',
    },
  },
}

const menuItemVariants = {
  closed: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: [0.42, 0, 0.58, 1] as [number, number, number, number],
    },
  },
  open: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
}

export const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { session } = useSession()
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const handleSignOut = async () => {
    await authClient.signOut()
    setIsOpen(false)
    router.push('/')
  }

  const menuItems: NavItem[] = [
    { label: 'Discover', href: '/discover' },
    { label: 'Cookbook', href: '/cookbook' },
    { label: 'Shopping List', href: '/lists' },
    { label: 'Profile', href: '/profile' },
    { label: 'Subscription', href: '/subscription' },
    { label: 'Logout', onClick: handleSignOut },
  ]

  const toggleMenu = () => setIsOpen(!isOpen)

  if (isDesktop) return null

  return (
    <>
      <motion.button
        onClick={toggleMenu}
        className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle menu">
        <motion.span
          className="h-0.5 w-5 rounded-full bg-neutral-950"
          animate={{
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 4 : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
        <motion.span
          className="h-0.5 w-5 rounded-full bg-neutral-950"
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? -4 : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed top-20 right-3 left-3 z-40 rounded-lg bg-neutral-50/95 p-6 shadow-xl backdrop-blur-md lg:hidden">
            <motion.nav
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="flex flex-col space-y-4">
              {/* User Greeting */}
              {session?.user.name && (
                <motion.div
                  variants={menuItemVariants}
                  className="border-b border-neutral-200 pb-4">
                  <p className="font-mono text-sm font-semibold text-neutral-950">
                    Hi, {session.user.name}
                  </p>
                </motion.div>
              )}

              {menuItems.map(item => (
                <motion.div key={item.label} variants={menuItemVariants}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex items-center justify-between rounded-md px-3 py-2.5 transition-colors',
                        'hover:bg-neutral-100 active:bg-neutral-200'
                      )}>
                      <span className="font-mono text-sm font-semibold text-neutral-950">
                        {item.label}
                      </span>
                      <ArrowIcon className="size-3" />
                    </Link>
                  ) : (
                    <button
                      onClick={item.onClick}
                      className={cn(
                        'flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition-colors',
                        'hover:bg-neutral-100 active:bg-neutral-200',
                        item.label === 'Logout' && 'text-red-600'
                      )}>
                      <span className="font-mono text-sm font-semibold">{item.label}</span>
                      <ArrowIcon className="size-3" />
                    </button>
                  )}
                </motion.div>
              ))}

              <motion.div
                variants={menuItemVariants}
                className="flex justify-between gap-2 border-t border-neutral-200 pt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <MobileIcon className="size-4" />
                  App
                </Button>

                <Button size="sm" className="flex-1">
                  Try Culina Pro
                </Button>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
