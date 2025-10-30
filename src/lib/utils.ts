import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { DateTime } from 'luxon'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const getMealTypeByTime = ({
  prefix = '',
  suffix = '',
}: {
  prefix?: string
  suffix?: string
}): string => {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 11) {
    return `${prefix}breakfast${suffix}`
  } else if (hour >= 11 && hour < 16) {
    return `${prefix}lunch${suffix}`
  } else if (hour >= 16 && hour < 21) {
    return `${prefix}dinner${suffix}`
  } else {
    return `${prefix}late night snacks${suffix}`
  }
}

export const getCurrentDate = () => {
  const now = DateTime.now()
  const day = now.day

  const getOrdinalSuffix = (num: number) => {
    const b = num % 10
    return ~~((num % 100) / 10) === 1
      ? 'th'
      : b === 1
        ? 'st'
        : b === 2
          ? 'nd'
          : b === 3
            ? 'rd'
            : 'th'
  }

  const suffix = getOrdinalSuffix(day)
  return now.toFormat(`cccc, MMMM d'${suffix}'`)
}
