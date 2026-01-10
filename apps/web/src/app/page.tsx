'use client'

import { Navbar } from '@/components/layout/navbar'
import Iphone15Pro from '@/components/ui/iphone-15-pro'
import { useSession } from '@/hooks/use-session'
import { cn } from '@/lib/utils'
import { useScroll, motion, useTransform, easeInOut } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import Features from '@/components/sections/hero/features'
import { ChefHatIcon, ListCheckIcon, ScanIcon } from '@/components/icons'
import { appConfig as app } from '@/configs/app'
import { AuthModal } from '@/modals/auth'

const steps = [
  {
    icon: (
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-600">
        <ScanIcon />
      </span>
    ),
    title: 'Import Any Recipe Instantly',
    desc: 'Simply drop in a link or video, and Culyn extracts the full recipe automatically.',
  },
  {
    icon: (
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-600">
        <ListCheckIcon />
      </span>
    ),
    title: 'Everything Gets Organized for You',
    desc: 'Ingredients, steps, nutrition, timings - beautifully structured and ready to cook.',
  },
  {
    icon: (
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-600">
        <ChefHatIcon />
      </span>
    ),
    title: 'Cook With Guided Confidence',
    desc: 'Follow clear, step-by-step instructions with real-time AI support.',
  },
]

export default function Home() {
  const { session, isLoading } = useSession()
  const containerRef = useRef<HTMLDivElement>(null)
  const lastSectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const { scrollYProgress: lastSectionProgress } = useScroll({
    target: lastSectionRef,
    offset: ['start end', 'end start'],
  })

  const opacity = useTransform(lastSectionProgress, [0, 0.2], [1, 0], {
    ease: easeInOut,
  })

  const backgroundColor = useTransform(
    lastSectionProgress,
    [0, 0.2],
    ['rgb(255, 255, 255)', 'rgb(0, 0, 0)'],
    {
      ease: easeInOut,
    }
  )

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [3, 0.81]
  }

  const rotate = useTransform(scrollYProgress, [0, 1], [30, 0])
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions())
  const translateY = useTransform(scrollYProgress, [0, 1], [200, 180])
  const translateX = useTransform(scrollYProgress, [0, 1], [0, -300])
  const textOpacity = useTransform(scrollYProgress, [0.9, 1], [0, 1])
  const textTranslateY = useTransform(scrollYProgress, [0.9, 1], [40, 0])

  return (
    <>
      <motion.section style={{ backgroundColor }} className="font-thicccboi select-none">
        <motion.main className="h-full w-full space-y-40 rounded-md p-2 sm:p-3 lg:p-4" id="home">
          <div ref={containerRef} className="relative">
            <div
              className="absolute inset-0 h-full w-full rounded-t-lg"
              style={{
                backgroundImage: `
                  linear-gradient(
                    to bottom, 
                    rgba(255,255,255,0) 75%, 
                    #fff 100%
                  ),
                  url('/assets/misc/bg.avif')
              
                `,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />

            <Navbar />

            <div className="relative overflow-hidden pb-4">
              <div className="relative top-[30px] flex h-screen w-full flex-col items-center justify-center px-3 sm:top-[100px] sm:h-[70vh] sm:px-0 lg:top-[170px] lg:h-auto">
                <motion.h1
                  className="mb-6 text-[11vw] leading-tight font-black tracking-tight text-gray-950 uppercase sm:text-center sm:text-[2.8rem] lg:text-[3.8rem] xl:text-[5.5rem]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}>
                  Cook amazing meals without <span className="font-bold italic">Stress</span>,
                  <span className="font-bold italic"> Mess</span>{' '}
                  <span className="font-bold lowercase italic">or</span>
                  <span className="font-bold italic"> Confusion</span>
                </motion.h1>

                <motion.p
                  className="z-20 mb-8 max-w-2xl text-sm font-normal text-gray-700 sm:text-center lg:max-w-4xl lg:text-base xl:text-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}>
                  Import any recipe, get instant ingredients and nutrition, and cook with
                  step-by-step AI guidance <br /> all in one simple, intelligent app.
                </motion.p>

                <motion.div
                  className="z-20 mb-10 flex w-full flex-wrap items-center justify-start gap-4 sm:justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}>
                  <AuthModal
                    trigger={
                      <motion.button
                        className={cn(
                          'cursor-pointer rounded-full bg-black px-4 py-2 text-sm font-medium text-white sm:px-5 sm:py-2 lg:px-6 lg:py-3 lg:text-base',
                          app.isInProduction && 'cursor-progress'
                        )}
                        whileHover={{ scale: 1.05, backgroundColor: '#333' }}
                        whileTap={{ scale: 0.95 }}>
                        {app.isInProduction ? 'Coming Soon' : 'Get Started'}
                      </motion.button>
                    }
                    type="signUp"
                  />

                  <motion.button
                    className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 lg:text-base"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}>
                    <div className="flex items-center justify-center rounded-full bg-white shadow-sm sm:size-6 lg:size-8">
                      <svg
                        className="size-3.5 lg:size-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <span>How it works</span>
                  </motion.button>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="relative hidden items-center justify-center gap-4 p-2 md:p-20 lg:flex">
                <div
                  className="relative w-full"
                  style={{
                    perspective: '140px',
                  }}>
                  <motion.div
                    style={{
                      rotateX: rotate,
                      scale,
                      translateY,
                      translateX,
                    }}
                    className="flex w-full justify-center">
                    <Iphone15Pro src={'/assets/misc/mockup.png'} />
                  </motion.div>
                </div>

                <div className="absolute right-0 bottom-14 hidden w-1/2 pr-20 md:block">
                  <motion.div style={{ opacity: textOpacity, translateY: textTranslateY }}>
                    <div className="mx-auto flex max-w-6xl flex-col items-center gap-16 px-4 md:flex-row md:gap-24">
                      <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.7 }}
                        viewport={{ once: true }}
                        className="flex-1">
                        <h2 className="mb-3 text-5xl leading-tight font-extrabold text-gray-950">
                          How Culyn Works
                        </h2>
                        <p className="mb-10 text-xl text-gray-600">
                          Just a few taps - import, organize, and start cooking smarter with Culyn.
                        </p>
                        <div className="space-y-10">
                          {steps.map((step, idx) => (
                            <motion.div
                              key={step.title}
                              initial={{ opacity: 0, y: 30 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{
                                delay: 0.3 + idx * 0.2,
                                duration: 0.6,
                              }}
                              viewport={{ once: true }}
                              className="flex items-start gap-5">
                              {step.icon}
                              <div>
                                <h3 className="mb-1 text-xl font-semibold text-gray-800 md:text-2xl">
                                  {step.title}
                                </h3>
                                <p className="text-base text-gray-500 md:text-lg">{step.desc}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.12, duration: 0.6 }}
                          viewport={{ once: true }}
                          className="mt-12">
                          <AuthModal
                            trigger={
                              <motion.button
                                className={cn(
                                  'flex cursor-pointer items-center gap-2 rounded-full bg-black px-6 py-3 font-medium text-white shadow hover:bg-gray-800',
                                  app.isInProduction && 'cursor-progress'
                                )}
                                whileHover={{ scale: 1.05, backgroundColor: '#333' }}
                                whileTap={{ scale: 0.95 }}>
                                {app.isInProduction ? 'Coming Soon' : 'Get Started'}
                              </motion.button>
                            }
                            type="signUp"
                          />
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          <Features opacity={opacity} />

          <section ref={lastSectionRef} id="contact">
            <div className="relative flex items-center justify-between px-2 pb-10 sm:px-4">
              <motion.div
                className="z-0"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}>
                <div className="grid grid-cols-7 grid-rows-8 gap-2">
                  {[
                    [true, false, false, false, false, false, false], // row 1
                    [true, true, false, false, false, false, false], // row 2
                    [true, true, true, false, false, false, false], // row 3
                    [true, true, true, false, false, false, false], // row 4
                    [true, true, true, true, false, false, false], // row 5
                    [true, true, true, true, true, false, false], // row 6
                    [true, true, true, true, true, true, false], // row 7
                    [true, true, true, true, true, true, true], // row 8
                  ].flatMap((row, rowIdx) =>
                    row.map((visible, colIdx) => {
                      let color = ''
                      let glow = ''
                      let isGlow = false
                      if (rowIdx === 6 && colIdx === 3) {
                        color = 'bg-cyan-600' //#A0FFB3
                        glow = 'bg-cyan-600/60'
                        isGlow = true
                      }
                      if (rowIdx === 5 && colIdx === 1) {
                        color = 'bg-pink-500'
                        glow = 'bg-pink-500/60'
                        isGlow = true
                      }
                      if (rowIdx === 4 && colIdx === 2) {
                        color = 'bg-green-300'
                        glow = 'bg-green-300/60'
                        isGlow = true
                      }
                      return visible ? (
                        <motion.div
                          key={`l-${rowIdx}-${colIdx}`}
                          className="relative flex items-center justify-center"
                          initial={{ opacity: 0, scale: 0.5 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: 0.5,
                            delay: (rowIdx + colIdx) * 0.05,
                            type: 'spring',
                            stiffness: 100,
                          }}
                          viewport={{ once: true }}>
                          {isGlow && (
                            <motion.span
                              className={cn(
                                `absolute size-20 rounded-full opacity-90 blur-2xl xl:size-24`,
                                isGlow ? glow : 'bg-transparent'
                              )}
                              initial={{ scale: 0, opacity: 0 }}
                              whileInView={{ scale: 1, opacity: 0.9 }}
                              transition={{
                                duration: 0.5,
                                delay: (rowIdx + colIdx) * 0.05,
                                type: 'spring',
                                stiffness: 100,
                              }}
                              viewport={{ once: true }}
                            />
                          )}
                          <motion.div
                            className={cn(
                              `size-4 rounded-md backdrop-blur-md transition sm:size-10 sm:rounded-xl lg:size-12 xl:size-16`,
                              isGlow ? color : 'bg-[#181a20]/60'
                            )}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{
                              duration: 0.5,
                              delay: (rowIdx + colIdx) * 0.05,
                            }}
                            viewport={{ once: true }}
                          />
                        </motion.div>
                      ) : (
                        <div key={`l-${rowIdx}-${colIdx}`} />
                      )
                    })
                  )}
                </div>
              </motion.div>

              <motion.div
                className="z-0"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}>
                <div className="grid grid-cols-7 grid-rows-8 gap-2">
                  {[
                    [false, false, false, false, false, false, true],
                    [false, false, false, false, false, true, true],
                    [false, false, false, false, true, true, true],
                    [false, false, false, false, true, true, true],
                    [false, false, false, true, true, true, true],
                    [false, false, true, true, true, true, true],
                    [false, true, true, true, true, true, true],
                    [true, true, true, true, true, true, true],
                  ].flatMap((row, rowIdx) =>
                    row.map((visible, colIdx) => {
                      let color = ''
                      let glow = ''
                      let isGlow = false
                      if (rowIdx === 6 && colIdx === 1) {
                        color = 'bg-yellow-400'
                        glow = 'bg-yellow-400/60'
                        isGlow = true
                      }
                      if (rowIdx === 7 && colIdx === 5) {
                        color = 'bg-green-400'
                        glow = 'bg-green-400/60'
                        isGlow = true
                      }
                      return visible ? (
                        <motion.div
                          key={`r-${rowIdx}-${colIdx}`}
                          className="relative flex items-center justify-center"
                          initial={{ opacity: 0, scale: 0.5 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: 0.5,
                            delay: (rowIdx + colIdx) * 0.05,
                            type: 'spring',
                            stiffness: 100,
                          }}
                          viewport={{ once: true }}>
                          {isGlow && (
                            <motion.span
                              className={cn(
                                `absolute size-16 rounded-full opacity-90 blur-2xl sm:size-20 xl:size-24`,
                                isGlow ? glow : 'bg-transparent'
                              )}
                              initial={{ scale: 0, opacity: 0 }}
                              whileInView={{ scale: 1, opacity: 0.9 }}
                              transition={{
                                duration: 0.5,
                                delay: (rowIdx + colIdx) * 0.05,
                                type: 'spring',
                                stiffness: 100,
                              }}
                              viewport={{ once: true }}
                            />
                          )}
                          <motion.div
                            className={cn(
                              `size-4 rounded-md backdrop-blur-md transition sm:size-10 sm:rounded-xl lg:size-12 xl:size-16`,
                              isGlow ? color : 'bg-[#161616]/60'
                            )}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{
                              duration: 0.5,
                              delay: (rowIdx + colIdx) * 0.05,
                            }}
                            viewport={{ once: true }}
                          />
                        </motion.div>
                      ) : (
                        <div key={`r-${rowIdx}-${colIdx}`} />
                      )
                    })
                  )}
                </div>
              </motion.div>

              <motion.div
                className="absolute inset-0 -top-22 z-10 flex flex-col items-center justify-center sm:top-0"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: true }}>
                <div className="flex flex-col items-center justify-center">
                  <motion.h2
                    className="mb-4 bg-linear-to-b from-white to-gray-400 bg-clip-text text-center text-[7.5vw] leading-tight font-bold tracking-tight text-transparent sm:text-5xl lg:text-6xl xl:text-[80px]"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    viewport={{ once: true }}>
                    Get started with Culyn
                  </motion.h2>

                  <motion.p
                    className="mb-10 max-w-lg text-center text-[3.5vw] text-gray-300 lg:max-w-xl lg:text-lg xl:max-w-2xl xl:text-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    viewport={{ once: true }}>
                    A smarter, calmer way to save recipes, plan meals, and cook beautifully -
                    without the stress or clutter.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    viewport={{ once: true }}>
                    <AuthModal
                      trigger={
                        <motion.button
                          className={cn(
                            'mb-4 flex cursor-pointer items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-medium text-black shadow-lg lg:text-sm xl:text-base',
                            app.isInProduction && 'cursor-progress'
                          )}
                          whileHover={{ scale: 1.05, backgroundColor: '#f5f5f5' }}
                          whileTap={{ scale: 0.95 }}>
                          {app.isInProduction ? 'Coming Soon' : 'Get Started'}
                        </motion.button>
                      }
                      type="signUp"
                    />
                  </motion.div>
                </div>
              </motion.div>
            </div>

            <motion.div
              className="flex w-full flex-col justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              viewport={{ once: true }}>
              <div className="flex items-end justify-between p-4 select-none">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                  viewport={{ once: true }}>
                  <h2 className="font-leckerli text-xl font-normal text-white lg:text-2xl xl:text-3xl">
                    Culyn
                  </h2>
                  <motion.a
                    href="mailto:contact@culyn.app"
                    whileHover={{ color: '#fff' }}
                    whileTap={{ scale: 0.95 }}
                    className="cursor-pointer text-xs text-gray-400 lg:text-sm">
                    contact@culyn.app
                  </motion.a>
                </motion.div>
                <motion.div
                  className="flex flex-row items-center justify-center gap-4"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                  viewport={{ once: true }}>
                  <span className="cursor-pointer text-xs text-gray-400 transition-all duration-300 hover:text-gray-100 lg:text-sm xl:text-base">
                    Privacy
                  </span>
                  <span className="cursor-pointer text-xs text-gray-400 transition-all duration-300 hover:text-gray-100 lg:text-sm xl:text-base">
                    Terms
                  </span>
                </motion.div>
              </div>

              <hr className="w-full border-gray-700" />

              <motion.p
                className="p-4 text-center text-xs text-gray-400 lg:text-sm"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                viewport={{ once: true }}>
                &copy; {new Date().getFullYear()} Culyn. All rights reserved.
              </motion.p>
            </motion.div>
          </section>
        </motion.main>
      </motion.section>
    </>
  )
}
