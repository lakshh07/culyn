import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

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
