'use client'

import React, { useState, useEffect, FC, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowIcon } from '@/components/icons'
import { cn } from '@/lib/utils'
import { AuthModal } from '@/modals/auth'

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

const NavLink: React.FC<NavLinkProps> = React.memo(({ item }) => (
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
    <span className="relative font-mono font-medium">
      {item.label}
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
  </MotionLink>
))

NavLink.displayName = 'NavLink'

const LoginButton = () => (
  <motion.button
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
      Login
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
)

export const Navbar: FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showNavbar, setShowNavbar] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      const isAtBottom = currentScrollY + windowHeight >= documentHeight - 500

      setIsScrolled(currentScrollY > 40)
      if (currentScrollY <= 0) {
        setShowNavbar(true)
      } else if (currentScrollY > lastScrollY) {
        setShowNavbar(false)
      } else if (isAtBottom) {
        setShowNavbar(false)
      } else {
        setShowNavbar(true)
      }
      setLastScrollY(currentScrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const sideNavLinks = useMemo(
    () => sideNavItems.map(item => <NavLink key={item.label} item={item} />),
    []
  )

  return (
    <motion.div
      className={cn('fixed left-0 z-50 w-full select-none', isScrolled ? 'top-6' : 'top-8')}
      initial={{ y: -100 }}
      animate={{
        y: showNavbar ? 0 : -100,
        opacity: showNavbar ? 1 : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.3,
      }}>
      <motion.nav
        className={cn(
          'mx-auto flex items-center justify-between rounded-full bg-white/80 py-2 pr-6 pl-6 backdrop-blur-sm',
          isScrolled ? 'max-w-3xl' : 'max-w-5xl'
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
          <AuthModal trigger={LoginButton()} type="signIn" />
        </div>
      </motion.nav>
    </motion.div>
  )
}
