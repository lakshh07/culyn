import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { appConfig as app } from '@/configs/app'
import { AuthModal } from '@/modals/auth'

export const Navbar = () => {
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

  return (
    <motion.div
      className={cn('fixed left-0 z-50 w-full', isScrolled ? 'top-6' : 'top-6 sm:top-8')}
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
          'mx-4 flex items-center justify-between rounded-full bg-white/80 py-1 pr-1 pl-6 backdrop-blur-xs sm:mx-auto lg:py-2 lg:pr-2',
          isScrolled
            ? 'max-w-md sm:max-w-xl lg:max-w-3xl'
            : 'max-w-md sm:max-w-xl lg:max-w-4xl xl:max-w-5xl'
        )}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          layout: {
            ease: 'easeIn',
            duration: 1.3,
          },
        }}
        layout
        layoutRoot>
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}>
          <h1 className="font-leckerli text-lg lg:text-xl xl:text-2xl">Culyn</h1>
        </motion.div>

        <div className="hidden items-center space-x-6 lg:flex">
          {[
            { name: 'Home', href: '#home' },
            { name: 'Features', href: '#features' },
            { name: 'Contact', href: '#contact' },
          ].map((item, index) => (
            <motion.div
              key={item.name}
              onClick={() => {
                const element = document.querySelector(item.href)
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.2,
                delay: 0.3 + index * 0.05,
              }}>
              <motion.button
                whileHover={{ color: '#101828', scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer text-sm font-normal text-gray-600 xl:text-base">
                {item.name}
              </motion.button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}>
          <AuthModal
            trigger={
              <motion.button
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-full bg-black px-4 py-1.5 text-xs text-white lg:py-2 lg:text-base',
                  app.isInProduction && 'cursor-progress'
                )}
                whileHover={{ scale: 1.02, backgroundColor: '#333' }}
                whileTap={{ scale: 0.98 }}
                disabled={app.isInProduction}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                {app.isInProduction ? 'Coming Soon' : 'Sign In'}
                <motion.svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </motion.svg>
              </motion.button>
            }
            type="signIn"
          />
        </motion.div>
      </motion.nav>
    </motion.div>
  )
}
