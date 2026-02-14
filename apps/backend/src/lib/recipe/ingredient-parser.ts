const UNICODE_FRACTIONS: Record<string, number> = {
  '½': 0.5,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
  '¼': 0.25,
  '¾': 0.75,
  '⅕': 0.2,
  '⅖': 0.4,
  '⅗': 0.6,
  '⅘': 0.8,
  '⅙': 1 / 6,
  '⅚': 5 / 6,
  '⅛': 0.125,
  '⅜': 0.375,
  '⅝': 0.625,
  '⅞': 0.875,
}

const UNIT_NORMALIZATIONS: Record<string, string> = {
  tbsp: 'tablespoon',
  tsp: 'teaspoon',
  oz: 'ounce',
  lb: 'pound',
  lbs: 'pound',
  g: 'gram',
  kg: 'kilogram',
  ml: 'milliliter',
  l: 'liter',
  'fl oz': 'fluid ounce',
  pt: 'pint',
  qt: 'quart',
  gal: 'gallon',
  c: 'cup',
  cups: 'cup',
  tablespoons: 'tablespoon',
  teaspoons: 'teaspoon',
  ounces: 'ounce',
  pounds: 'pound',
  grams: 'gram',
  kilograms: 'kilogram',
  milliliters: 'milliliter',
  liters: 'liter',
}

const parseFraction = (str: string): number => {
  try {
    const cleaned = str.trim().replace(/\s+/g, '')

    for (const [unicode, value] of Object.entries(UNICODE_FRACTIONS)) {
      if (cleaned.includes(unicode)) {
        return value
      }
    }

    if (cleaned.includes('/')) {
      const [numerator, denominator] = cleaned.split('/')
      const num = parseFloat(numerator)
      const den = parseFloat(denominator)

      if (isNaN(num) || isNaN(den) || den === 0) {
        throw new Error(`Invalid fraction: ${str}`)
      }

      return num / den
    }

    const parsed = parseFloat(cleaned)
    if (isNaN(parsed)) {
      throw new Error(`Invalid number: ${str}`)
    }

    return parsed
  } catch (error) {
    console.warn(`Failed to parse fraction "${str}":`, error)
    return 0
  }
}

export const parseQuantity = (quantity: string): { amount: number | null; unit: string | null } => {
  const trimmed = quantity.trim().toLowerCase()

  if (trimmed === 'to taste' || trimmed.includes('to taste')) {
    return { amount: null, unit: 'to taste' }
  }

  if (trimmed.includes('pinch')) {
    return { amount: null, unit: 'pinch' }
  }

  if (trimmed.startsWith('zest of')) {
    const zestMatch = trimmed.match(/zest of (\d+(?:[\/\d]*)?(?:\s*½|\s*¼|\s*¾)?)/i)
    const amount = zestMatch ? parseFraction(zestMatch[1]) : null
    return { amount, unit: trimmed }
  }

  const patterns = [
    // Mixed numbers: "1 1/2 cups", "2½ tbsp"
    /^(\d+)\s*([½¼¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|\d+\/\d+)\s*(.*)$/,
    // Ranges: "2-3 cups", "1 to 2 tbsp"
    /^(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(.*)$/,
    // Standard: "2 cups", "1.5 tbsp", "1/2 tsp"
    /^(\d+(?:\.\d+)?(?:\s*\/\s*\d+)?)\s*(.*)$/,
    // Unicode fractions: "½ cup"
    /^([½¼¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\s*(.*)$/,
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match) {
      let amount: number
      let unit: string | null = null

      if (pattern === patterns[0]) {
        amount = parseFraction(match[1]) + parseFraction(match[2])
        unit = match[3].trim() || null
      } else if (pattern === patterns[1]) {
        amount = (parseFraction(match[1]) + parseFraction(match[2])) / 2
        unit = match[3].trim() || null
      } else {
        amount = parseFraction(match[1])
        unit = match[2]?.trim() || null
      }

      if (unit) {
        unit = UNIT_NORMALIZATIONS[unit] || unit
      }

      return { amount, unit }
    }
  }

  return { amount: null, unit: trimmed }
}
