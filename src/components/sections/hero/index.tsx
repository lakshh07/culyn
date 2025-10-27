'use client';

import { FC, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';

const getMealTypeByTime = (): string => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) {
    return 'breakfast';
  } else if (hour >= 11 && hour < 16) {
    return 'lunch';
  } else if (hour >= 16 && hour < 21) {
    return 'dinner';
  } else {
    return 'late night snacks';
  }
};

const MotionButton = motion.create(Button);

export const HeroSection: FC = () => {
  const currentMeal = useMemo(() => getMealTypeByTime(), []);

  return (
    <section className='flex relative items-center justify-center min-h-[80vh] px-4'>
      <div className='mx-auto text-center space-y-8'>
        <div className='space-y-4 font-sharp-grotesk'>
          <motion.h1
            className='text-4xl font-bold bg-linear-to-b from-black to-gray-400 bg-clip-text text-transparent '
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Discover & save the latest trending recipes.
          </motion.h1>
          <motion.p
            className='text-4xl text-gray-600'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Here&apos;s what others are making for{' '}
            <em className='italic text-gray-950 pr-0.5'>{currentMeal}</em>{' '}
            today.
          </motion.p>
        </div>

        <MotionButton
          className='mt-6 transition-none'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          See more recipes
        </MotionButton>

        <div className='-mt-4'>
          <motion.p
            className='text-gray-500 text-xs font-mono '
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            Already have an account?{' '}
            <span className='underline cursor-pointer'>Log in</span>
          </motion.p>
        </div>
      </div>
    </section>
  );
};
