type IngredientKeywordConfig = {
  slug: string
  keywords: string[]
}

const INGREDIENT_KEYWORDS: IngredientKeywordConfig[] = [
  { slug: 'pepper', keywords: ['pepper', 'peppers'] },
  {
    slug: 'potato',
    keywords: [
      'potato',
      'potatoes',
      'slice of potato',
      'slices of potato',
      'diced potato',
      'diced potatoes',
      'boiled potato',
      'baked potato',
      'mashed potato',
    ],
  },
  {
    slug: 'garlic',
    keywords: ['garlic', 'garlic cloves', 'garlic cloves minced'],
  },
  { slug: 'egg', keywords: ['egg'] },
  { slug: 'butter', keywords: ['butter'] },
  { slug: 'milk', keywords: ['milk'] },
  { slug: 'cheese', keywords: ['cheese'] },
  { slug: 'coriander', keywords: ['coriander', 'coriander leaves', 'dhaniya'] },
  { slug: 'bread', keywords: ['bread', 'slice of bread', 'slices of bread'] },
  {
    slug: 'green-chili',
    keywords: ['green chilli', 'green chillies', 'green chilies', 'green chili'],
  },
  { slug: 'besan', keywords: ['besan', 'gram flour'] },
  { slug: 'paneer', keywords: ['paneer', 'paneer cubes'] },
  {
    slug: 'curry-leaves',
    keywords: ['curry leaves', 'curry leaf', 'kadi patta'],
  },
  { slug: 'cucumber', keywords: ['cucumber', 'cucumbers'] },
  { slug: 'yogurt', keywords: ['yogurt', 'curd', 'dahi'] },
  { slug: 'cumin-seeds', keywords: ['cumin seeds', 'cumin seed', 'jeera'] },
  {
    slug: 'turmeric-powder',
    keywords: ['turmeric powder', 'turmeric', 'haldi'],
  },
  { slug: 'water', keywords: ['water'] },
  {
    slug: 'aamchur',
    keywords: ['aamchur', 'amchur', 'amchoor', 'dried mango powder', 'dry mango powder'],
  },
  {
    slug: 'onion',
    keywords: ['onion', 'onions', 'slice of onion'],
  },
  {
    slug: 'mustard-seeds',
    keywords: ['mustard seeds', 'mustard seed', 'rai', 'rai seeds'],
  },
  {
    slug: 'schezwan-chutney',
    keywords: ['schezwan chutney', 'schezwan chutney paste', 'schezwan chutney sauce'],
  },
  {
    slug: 'green-chutney',
    keywords: ['green chutney', 'green chutney paste', 'green chutney sauce'],
  },
  { slug: 'tomato', keywords: ['tomato', 'tomatoes'] },
  { slug: 'mushrooms', keywords: ['mushroom', 'mushrooms'] },
  { slug: 'lemon', keywords: ['lemon', 'lemons'] },
  { slug: 'black-pepper', keywords: ['black pepper', 'black peppercorns'] },
  { slug: 'chilli-flakes', keywords: ['chilli flakes', 'chilli powder'] },
  { slug: 'dried-oregano', keywords: ['dried oregano', 'oregano'] },
  {
    slug: 'red-chilli-powder',
    keywords: ['red chilli powder', 'red chilli', 'red chilli flakes'],
  },
  { slug: 'ghee', keywords: ['ghee', 'clarified butter'] },
  { slug: 'salt', keywords: ['salt'] },
  { slug: 'oil', keywords: ['oil', 'cooking oil'] },
  { slug: 'spinach', keywords: ['spinach', 'spinach leaves'] },
  { slug: 'cream', keywords: ['cream', 'fresh cream'] },
  { slug: 'honey', keywords: ['honey'] },
  { slug: 'raw-pecans', keywords: ['raw pecans', 'pecans'] },
  { slug: 'orange', keywords: ['orange', 'oranges'] },
  { slug: 'dijon-mustard', keywords: ['dijon mustard', 'dijon mustard paste'] },
  { slug: 'cranberries', keywords: ['cranberries', 'cranberry'] },
  { slug: 'scallions', keywords: ['scallions', 'green onions'] },
  {
    slug: 'dried-cranberries',
    keywords: ['dried cranberries', 'dried cranberry'],
  },
  {
    slug: 'salmon-filet',
    keywords: ['salmon filet', 'salmon fillet', 'filet', 'fillet'],
  },
  { slug: 'sugar', keywords: ['icing sugar', 'sugar'] },
  { slug: 'nutella', keywords: ['nutella', 'nutella spread'] },
  { slug: 'roll-puff-pastry', keywords: ['roll puff pastry'] },
  { slug: 'mixed-herbs', keywords: ['mixed herbs', 'herbs'] },
]

const normalize = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const getIngredientSlugFromText = (input: string): string | null => {
  if (!input) return null

  const normalizedInput = normalize(input)

  for (const { slug, keywords } of INGREDIENT_KEYWORDS) {
    for (const keyword of keywords) {
      const normalizedKeyword = normalize(keyword)

      if (!normalizedKeyword) continue

      if (normalizedInput.includes(normalizedKeyword)) {
        return slug
      }
    }
  }

  return null
}

export const getIngredientImageUrl = (input: string, ingredientImageBaseUrl: string): string => {
  const slug = getIngredientSlugFromText(input)
  if (!slug) return ''

  return `${ingredientImageBaseUrl}/ingredients/${slug}.png`
}

export { INGREDIENT_KEYWORDS }
