'use client'

import React, { useState, useEffect, FC, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowIcon } from '@/components/icons'
import { cn } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

interface NavItem {
  label: string
  href: string
}

const sideNavItems: NavItem[] = [
  {
    label: 'Discover',
    href: '/discover',
  },
]

const MotionLink = motion.create(Link)

interface NavLinkProps {
  item: NavItem
}

const NavLink: React.FC<NavLinkProps> = React.memo(({ item }) => {
  const pathname = usePathname()

  const isActive = (href: string) => pathname.replace(/\/$/, '') === href

  return (
    <MotionLink
      key={item.label}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      variants={{
        initial: { scale: 1 },
        tap: {
          scale: 0.95,
          transition: { duration: 0.2 },
        },
      }}
      href={item.href}
      prefetch
      className={cn(
        'relative flex cursor-pointer items-center gap-3 text-sm font-normal',
        'text-zinc-950'
      )}>
      <span className={cn('relative font-mono font-medium')}>
        {item.label}
        <motion.span
          className={cn('absolute -bottom-1 left-0 h-px w-full rounded-sm', 'bg-zinc-950')}
          variants={{
            initial: {
              scaleX: isActive(item.href) ? 1 : 0,
              transformOrigin: 'right',
              transition: { duration: 0.3, ease: 'easeInOut' },
            },
            hover: {
              scaleX: isActive(item.href) ? 1 : 0,
              transformOrigin: 'left',
              transition: { duration: 0.3, ease: 'easeInOut' },
            },
          }}
        />
      </span>
      <ArrowIcon className="size-3" />
    </MotionLink>
  )
})

NavLink.displayName = 'NavLink'

export const ProtectedNavbar: FC = () => {
  const router = useRouter()

  const sideNavLinks = useMemo(
    () => sideNavItems.map(item => <NavLink key={item.label} item={item} />),
    []
  )

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push('/')
  }

  return (
    <motion.div
      className={cn('fixed top-5 left-0 z-50 w-full select-none')}
      initial={{ y: -100 }}
      animate={{
        y: 0,
        opacity: 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.3,
      }}>
      <motion.nav
        className={cn(
          'flex items-center justify-between rounded-md bg-neutral-50/80 py-2 pr-6 pl-6 backdrop-blur-sm',
          'mx-5 max-w-full'
        )}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}>
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}>
          <h1 className="font-autography text-2xl">Culina</h1>
        </motion.div>

        <div className="flex items-center space-x-8">
          {sideNavLinks}

          <motion.button
            onClick={handleSignOut}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            variants={{
              initial: { scale: 1 },
              tap: {
                scale: 0.95,
                transition: { duration: 0.2 },
              },
            }}
            className={cn(
              'relative flex cursor-pointer items-center gap-3 text-sm font-normal',
              'text-zinc-950'
            )}>
            <span className="relative font-mono font-medium">
              Logout
              <motion.span
                className={cn('absolute -bottom-1 left-0 h-px w-full rounded-sm', 'bg-zinc-950')}
                variants={{
                  initial: {
                    scaleX: 0,
                    transformOrigin: 'right',
                    transition: { duration: 0.3, ease: 'easeInOut' },
                  },
                  hover: {
                    scaleX: 1,
                    transformOrigin: 'left',
                    transition: { duration: 0.3, ease: 'easeInOut' },
                  },
                }}
              />
            </span>
            <ArrowIcon className="size-3" />
          </motion.button>
        </div>
      </motion.nav>
    </motion.div>
  )
}
