import { DateTime } from 'luxon';

export * from './zod';

export const getMealTypeByTime = ({
  prefix = '',
  suffix = '',
}: {
  prefix?: string;
  suffix?: string;
}): string => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) {
    return `${prefix}breakfast${suffix}`;
  } else if (hour >= 11 && hour < 16) {
    return `${prefix}lunch${suffix}`;
  } else if (hour >= 16 && hour < 21) {
    return `${prefix}dinner${suffix}`;
  } else {
    return `${prefix}late night snacks${suffix}`;
  }
};

export const getCurrentDate = () => {
  const now = DateTime.now();
  const day = now.day;

  const getOrdinalSuffix = (num: number) => {
    const b = num % 10;
    return ~~((num % 100) / 10) === 1
      ? 'th'
      : b === 1
      ? 'st'
      : b === 2
      ? 'nd'
      : b === 3
      ? 'rd'
      : 'th';
  };

  const suffix = getOrdinalSuffix(day);
  return now.toFormat(`cccc, MMMM d'${suffix}'`);
};

const COMMON_FRACTIONS = [
  { decimal: 0.125, str: '1/8' },
  { decimal: 0.25, str: '1/4' },
  { decimal: 0.333, str: '1/3' },
  { decimal: 0.5, str: '1/2' },
  { decimal: 0.666, str: '2/3' },
  { decimal: 0.75, str: '3/4' },
] as const;

export const DIFFICULTY_MAP: Record<string, string> = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
};

export const scaleIngredientQuantity = (
  amount: string,
  scale: number
): string => {
  if (!amount || scale === 1) return amount;

  const fractionMatch = amount.match(/^(\d+)?\s*(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const whole = fractionMatch[1] ? parseInt(fractionMatch[1]) : 0;
    const numerator = parseInt(fractionMatch[2]);
    const denominator = parseInt(fractionMatch[3]);
    const decimal = whole + numerator / denominator;
    const scaled = decimal * scale;

    if (scaled < 1) {
      for (const frac of COMMON_FRACTIONS) {
        if (Math.abs(scaled - frac.decimal) < 0.05) {
          return frac.str;
        }
      }
    }

    return scaled % 1 === 0 ? scaled.toFixed(0) : scaled.toFixed(1);
  }

  const rangeMatch = amount.match(/^(\d+\.?\d*)\s*-\s*(\d+\.?\d*)$/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]) * scale;
    const max = parseFloat(rangeMatch[2]) * scale;
    const formatNum = (n: number) =>
      n % 1 === 0 ? n.toFixed(0) : n.toFixed(1);
    return `${formatNum(min)}-${formatNum(max)}`;
  }

  const numMatch = amount.match(/^(\d+\.?\d*)/);
  if (numMatch) {
    const num = parseFloat(numMatch[1]);
    const scaled = num * scale;
    const formatted = scaled % 1 === 0 ? scaled.toFixed(0) : scaled.toFixed(1);
    return amount.replace(numMatch[1], formatted);
  }

  return amount;
};
