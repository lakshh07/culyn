'use client'

import React, { FC, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSession } from '@/hooks/use-session'
import { useUserStats } from '@/hooks/use-user-stats'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { MobileMenu } from './mobile-menu'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { BasketIcon, BookIcon, HomeIcon } from '@/components/icons'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
}

const MotionLink = motion.create(Link)

const stringToColor = (str: string): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const orangeVariations = ['#FF9800', '#FF6F00', '#FFB74D', '#FB8C00', '#FFA726', '#F57C00']
  return orangeVariations[Math.abs(hash) % orangeVariations.length]
}

const getComplementaryColor = (str: string): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const complementaryColors = ['#FFD54F', '#FFAB00', '#FFC107', '#FF6E40', '#FFCA28']
  return complementaryColors[Math.abs(hash) % complementaryColors.length]
}

interface NavLinkProps {
  item: NavItem
  isActive: boolean
}

const NavLink: React.FC<NavLinkProps> = React.memo(({ item, isActive }) => {
  const iconWithClass = React.cloneElement(
    item.icon as React.ReactElement<{ className?: string }>,
    {
      className: cn('size-3.5 transition-colors', isActive && 'fill-neutral-500'),
    }
  )

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
          transition: { duration: 0.3 },
        },
        hover: {
          scale: 1.03,

          transition: { duration: 0.3 },
        },
      }}
      href={item.href}
      prefetch
      className={cn(
        'relative flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-bold',
        'text-neutral-950'
      )}>
      {iconWithClass}
      <span className={cn('relative font-mono font-semibold')}>{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <Badge
          variant="secondary"
          className={cn(
            'relative ml-1 items-center justify-center rounded-md p-0 px-2 py-0.5 text-[10px] font-bold transition-colors',
            isActive && 'bg-white'
          )}>
          {item.badge}
        </Badge>
      )}
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="bg-secondary absolute inset-0 -z-1 rounded-full"
          initial={false}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        />
      )}
    </MotionLink>
  )
})

NavLink.displayName = 'NavLink'

export const ProtectedNavbar: FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { session, isLoading } = useSession()
  const { cookbookCount, shoppingListCount } = useUserStats()

  const navItemsWithBadges = useMemo(
    () => [
      {
        label: 'Discover',
        href: '/discover',
        icon: <HomeIcon />,
      },
      {
        label: 'Cookbook',
        href: '/cookbook',
        icon: <BookIcon />,
        badge: cookbookCount,
      },
      {
        label: 'Shopping List',
        href: '/lists',
        icon: <BasketIcon />,
        badge: shoppingListCount,
      },
    ],
    [cookbookCount, shoppingListCount]
  )

  const sideNavLinks = useMemo(
    () =>
      navItemsWithBadges.map(item => (
        <NavLink key={item.label} item={item} isActive={pathname === item.href} />
      )),
    [pathname, navItemsWithBadges]
  )

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push('/')
  }

  return (
    <motion.div
      className={cn('fixed top-0 left-0 z-50 w-full select-none')}
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
      <ProgressiveBlur height="150%" position="top" />
      <motion.nav
        className={cn(
          'bg- relative z-50 flex items-center justify-between gap-8 px-8 py-3',
          'max-w-full'
        )}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}>
        <motion.div
          className="flex w-full items-center gap-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}>
          <h1 className="font-leckerli mr-6 bg-linear-to-b from-neutral-950 to-neutral-500 bg-clip-text text-2xl text-transparent">
            Culina
          </h1>

          {sideNavLinks}
        </motion.div>

        <div className="flex w-full items-center justify-end gap-2">
          <div className="hidden w-full items-center justify-end space-x-4 lg:flex">
            <Button size="sm" className="rounded-full px-4 py-2 text-xs font-bold">
              Try Culina Pro
            </Button>
            {isLoading ? (
              <div className="flex items-center gap-3 rounded-full px-4 py-1">
                <Skeleton className="size-9 rounded-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="hover:bg-secondary/50 flex cursor-pointer items-center gap-3 rounded-full px-4 py-1.5 transition-all">
                    <Avatar>
                      <AvatarImage className="size-10" src={session?.user.image ?? ''} />
                      <AvatarFallback
                        className="relative size-8 overflow-hidden font-mono text-xs font-semibold text-white"
                        style={{
                          background: `linear-gradient(135deg, ${stringToColor(session?.user.name ?? 'User')} 0%, ${getComplementaryColor(session?.user.name ?? 'User')} 100%)`,
                        }}>
                        <svg
                          className="absolute inset-0 size-full opacity-70"
                          xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <pattern
                              id="avatar-pattern"
                              x="0"
                              y="0"
                              width="50"
                              height="50"
                              patternUnits="userSpaceOnUse">
                              <circle
                                cx="25"
                                cy="25"
                                r="5"
                                fill="none"
                                stroke="white"
                                strokeWidth="0.5"
                              />
                              <circle
                                cx="25"
                                cy="25"
                                r="12"
                                fill="none"
                                stroke="white"
                                strokeWidth="0.5"
                                opacity="0.7"
                              />
                              <circle
                                cx="25"
                                cy="25"
                                r="20"
                                fill="none"
                                stroke="white"
                                strokeWidth="0.5"
                                opacity="0.4"
                              />
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#avatar-pattern)" />
                        </svg>
                        <span className="relative z-10">
                          {session?.user.name
                            ?.split(' ')
                            .map(name => name[0])
                            .join('')}
                        </span>
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="font-mono text-xs font-bold">{session?.user.name}</p>
                      <p className="max-w-[100px] truncate font-mono text-xs text-neutral-500">
                        {session?.user.email}
                      </p>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Subscription</DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <MobileMenu />
      </motion.nav>
    </motion.div>
  )
}
