import { motion, MotionValue } from 'motion/react'
import {
  ClipboardListIcon,
  ChefHatIcon,
  SettingsIcon,
  BasketCheckIcon,
  MoodSmileIcon,
  TrophyIcon,
  CheckIcon,
} from '@/components/icons'
import { cn } from '@/lib/utils'

const Features = ({ opacity }: { opacity: MotionValue<number> }) => {
  const features = [
    {
      title: 'Effortless Recipe Management',
      description:
        'Save and organize every recipe from Instagram, YouTube, or anywhere else - without the chaos of screenshots and scattered notes.',
      icon: <ClipboardListIcon className="text-orange-500" />,
      colors: {
        bg: 'bg-orange-50/50',
        bgIcon: 'bg-orange-100',
        text: 'text-orange-500',
      },
      listItems: [
        'Import recipes from any source in one tap',
        'Keep your cooking life organized and clutter-free',
      ],
    },
    {
      title: 'Smarter Cooking Starts Here',
      description:
        'Get instant breakdowns of ingredients, steps, and nutrition. Make confident cooking decisions with AI that actually understands food.',
      icon: <ChefHatIcon className="text-green-500" />,
      colors: {
        bg: 'bg-green-50/50',
        bgIcon: 'bg-green-100',
        text: 'text-green-500',
      },
      listItems: [
        'Automatic ingredient + step extraction',
        'Nutrition insights for every recipe you cook',
      ],
    },
    {
      title: 'Your Kitchen on Autopilot',
      description:
        'Let Culyn handle the hard parts - from parsing recipes to planning meals. Cook without stress while AI works quietly in the background.',
      icon: <SettingsIcon className="text-cyan-500" />,
      colors: {
        bg: 'bg-cyan-50/50',
        bgIcon: 'bg-cyan-100',
        text: 'text-cyan-500',
      },
      listItems: [
        'AI organizes and prepares recipes for you',
        'Meal planning without the mental load',
      ],
    },
    {
      title: 'Instant Grocery Lists',
      description:
        'Get clean, structured shopping lists auto-generated from any recipe or meal plan - so you shop faster and never forget an ingredient.',
      icon: <BasketCheckIcon className="text-sky-500" />,
      colors: {
        bg: 'bg-sky-50/50',
        bgIcon: 'bg-sky-100',
        text: 'text-sky-500',
      },
      listItems: [
        'Auto-create shopping lists from recipes',
        'Easily track ingredients you have or need',
      ],
    },
    {
      title: 'Weekly Kitchen Vibes',
      description:
        'Stay on top of your cooking flow with a weekly check-in - no pressure, just gentle reminders, recipe ideas, and smart suggestions.',
      icon: <MoodSmileIcon className="text-blue-500" />,
      colors: {
        bg: 'bg-blue-50/50',
        bgIcon: 'bg-blue-100',
        text: 'text-blue-500',
      },
      listItems: [
        'Effortless weekly cooking insights',
        'AI recommends recipes based on your taste',
      ],
    },
    {
      title: 'Crush Your Cooking Goals',
      description:
        "Whether it's eating cleaner, cooking more at home, or trying new cuisines - Culyn helps you level up one delicious win at a time.",
      icon: <TrophyIcon className="text-yellow-500" />,
      colors: {
        bg: 'bg-yellow-50/50',
        bgIcon: 'bg-yellow-100',
        text: 'text-yellow-500',
      },
      listItems: [
        'Reach your cooking and nutrition goals',
        'Build habits you can actually stick to',
      ],
    },
  ]

  return (
    <motion.div className="mx-auto max-w-7xl px-4 py-16" style={{ opacity }} id="features">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16 flex flex-col items-center justify-center overflow-hidden">
        <h2 className="mb-3 text-center text-2xl font-extrabold text-gray-950 sm:text-3xl lg:text-4xl xl:text-5xl">
          Smarter Cooking Habits,
          <br />
          Made Effortless
        </h2>
        <p className="mb-4 max-w-xl text-center text-sm text-gray-600 sm:text-base lg:max-w-2xl lg:text-lg xl:max-w-3xl xl:text-xl">
          Culyn helps you import recipes, auto-organize ingredients, and cook with AI guidance -
          without the chaos of screenshots or scattered notes.
        </p>
      </motion.div>

      <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
        {features.map((feature, i) => {
          return (
            <motion.div
              key={i}
              className={cn(
                `flex flex-col items-center rounded-3xl p-8 text-center shadow`,
                feature.colors.bg
              )}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 120,
                delay: i * 0.1,
              }}>
              <div className="mb-6">
                <div
                  className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-full',
                    feature.colors.bgIcon
                  )}>
                  {feature.icon}
                </div>
              </div>
              <h3
                className={cn(
                  'mb-3 text-base font-bold sm:text-lg lg:text-xl xl:text-2xl',
                  feature.colors.text
                )}>
                {feature.title}
              </h3>
              <p className="mb-5 text-sm text-gray-600 xl:text-base">{feature.description}</p>
              <ul className="space-y-2 text-left">
                {feature.listItems.map((item, i) => {
                  return (
                    <li
                      key={i}
                      className="flex items-start justify-start gap-2 text-sm text-gray-700 xl:text-base">
                      <span
                        className={cn(
                          'mt-0.5 flex items-center justify-center rounded-full p-1',
                          feature.colors.bgIcon
                        )}>
                        <CheckIcon className={cn('size-3', feature.colors.text)} />
                      </span>
                      {item}
                    </li>
                  )
                })}
              </ul>
            </motion.div>
          )
        })}

        <div className="hidden md:block" />
      </div>
    </motion.div>
  )
}

export default Features
