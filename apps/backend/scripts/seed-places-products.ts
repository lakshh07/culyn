#!/usr/bin/env bun
/// <reference types="bun" />
/**
 * CLI to seed sample places and products.
 *
 * Usage:
 *   bun run seed:sample -- [options]
 *
 * Options:
 *   --places N       Number of sample places to create (default: 5)
 *   --products N     Number of sample products to create (default: 5)
 *   --email EMAIL    Target user email (required; user must exist)
 *   --dry-run        Print what would be created without writing to DB
 *   --help           Show this help
 */

import 'dotenv/config'

import type { PlaceType, ProductCategory, SourcePlatform } from '@prisma/client'
import db from '../src/lib/prisma'

const SAMPLE_PLACES: Array<{
  name: string
  shortName?: string
  description?: string
  type: PlaceType
  address?: string
  city?: string
  state?: string
  country?: string
  latitude?: number
  longitude?: number
  cuisine?: string
  priceRange?: string
  rating?: number
  website?: string
  tags?: Array<{ type: string; value: string }>
}> = [
  {
    name: 'Blue Bottle Coffee',
    shortName: 'Blue Bottle',
    description: 'Artisan coffee roastery with minimal, design-forward spaces.',
    type: 'CAFE',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    latitude: 37.7749,
    longitude: -122.4194,
    cuisine: 'Coffee',
    priceRange: '$$',
    rating: 4.5,
    website: 'https://bluebottlecoffee.com',
    tags: [{ type: 'CUISINE', value: 'Coffee' }, { type: 'MEAL_TYPE', value: 'Breakfast' }],
  },
  {
    name: 'Tartine Bakery',
    shortName: 'Tartine',
    description: 'Renowned sourdough bakery and cafe.',
    type: 'BAKERY',
    address: '600 Guerrero St',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    latitude: 37.7612,
    longitude: -122.4244,
    cuisine: 'Bakery',
    priceRange: '$$',
    rating: 4.7,
    tags: [{ type: 'CUISINE', value: 'French' }, { type: 'MEAL_TYPE', value: 'Breakfast' }],
  },
  {
    name: 'Bar Agricole',
    shortName: 'Bar Agricole',
    description: 'Farm-to-table cocktail bar with seasonal ingredients.',
    type: 'BAR',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    latitude: 37.7618,
    longitude: -122.4092,
    cuisine: 'American',
    priceRange: '$$$',
    rating: 4.4,
    tags: [{ type: 'CUISINE', value: 'American' }, { type: 'OCCASION', value: 'Date Night' }],
  },
  {
    name: 'Bi-Rite Creamery',
    shortName: 'Bi-Rite',
    description: 'Locally-sourced ice cream and baked goods.',
    type: 'SPECIALTY_SHOP',
    address: '369 18th St',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    latitude: 37.7611,
    longitude: -122.424,
    cuisine: 'Ice Cream',
    priceRange: '$',
    rating: 4.6,
    tags: [{ type: 'MEAL_TYPE', value: 'Dessert' }, { type: 'SEASON', value: 'Summer' }],
  },
  {
    name: 'The Ferry Building Marketplace',
    shortName: 'Ferry Building',
    description: 'Historic waterfront marketplace with artisan food vendors.',
    type: 'MARKET',
    address: '1 Ferry Building',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    latitude: 37.7956,
    longitude: -122.3935,
    cuisine: 'Various',
    priceRange: '$$',
    rating: 4.8,
    website: 'https://ferrybuildingmarketplace.com',
    tags: [{ type: 'OCCASION', value: 'Weekend Brunch' }, { type: 'CUSTOM', value: 'Local' }],
  },
  {
    name: 'Zuni Cafe',
    shortName: 'Zuni',
    description: 'Mediterranean-style restaurant known for roast chicken.',
    type: 'RESTAURANT',
    address: '1658 Market St',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    latitude: 37.7732,
    longitude: -122.4211,
    cuisine: 'Mediterranean',
    priceRange: '$$$',
    rating: 4.5,
    tags: [{ type: 'CUISINE', value: 'Mediterranean' }, { type: 'MEAL_TYPE', value: 'Dinner' }],
  },
  {
    name: 'Tacolicious',
    shortName: 'Tacolicious',
    description: 'California-style Mexican tacos and margaritas.',
    type: 'RESTAURANT',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    latitude: 37.7878,
    longitude: -122.3985,
    cuisine: 'Mexican',
    priceRange: '$$',
    rating: 4.2,
    tags: [{ type: 'CUISINE', value: 'Mexican' }, { type: 'MEAL_TYPE', value: 'Lunch' }],
  },
  {
    name: 'Sightglass Coffee',
    shortName: 'Sightglass',
    description: 'Single-origin coffee roasted in-house.',
    type: 'CAFE',
    address: '3014 20th St',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    latitude: 37.7589,
    longitude: -122.4108,
    cuisine: 'Coffee',
    priceRange: '$$',
    rating: 4.5,
    tags: [{ type: 'CUISINE', value: 'Coffee' }, { type: 'CUSTOM', value: 'Third Wave' }],
  },
]

const SAMPLE_PRODUCTS: Array<{
  name: string
  shortName?: string
  description?: string
  category: ProductCategory
  brand?: string
  price?: number
  currency?: string
  features?: string[]
  tags?: Array<{ type: string; value: string }>
}> = [
  {
    name: 'Le Creuset Dutch Oven',
    shortName: 'Dutch Oven',
    description: 'Enameled cast iron 5.5qt round Dutch oven for braising and baking.',
    category: 'KITCHEN',
    brand: 'Le Creuset',
    price: 379.99,
    currency: 'USD',
    features: ['Enameled cast iron', 'Oven-safe to 500°F', 'Lifetime warranty'],
    tags: [{ type: 'OCCASION', value: 'Everyday' }, { type: 'CUSTOM', value: 'Essential' }],
  },
  {
    name: 'Dyson Airwrap Complete',
    shortName: 'Airwrap',
    description: 'Multi-styler that uses air to dry, curl, and smooth hair.',
    category: 'BEAUTY',
    brand: 'Dyson',
    price: 599.99,
    currency: 'USD',
    features: ['Coanda airflow', 'Multiple attachments', 'Intelligent heat control'],
    tags: [{ type: 'CUSTOM', value: 'Hair Care' }],
  },
  {
    name: 'KitchenAid Professional 600',
    shortName: 'Stand Mixer',
    description: '6-quart professional stand mixer with powerful motor.',
    category: 'KITCHEN',
    brand: 'KitchenAid',
    price: 449.99,
    currency: 'USD',
    features: ['6-quart capacity', '10 speeds', 'Durable metal construction'],
    tags: [{ type: 'OCCASION', value: 'Baking' }, { type: 'CUSTOM', value: 'Baker Essential' }],
  },
  {
    name: 'The Ordinary Niacinamide 10% + Zinc 1%',
    shortName: 'Niacinamide Serum',
    description: 'Lightweight serum to reduce blemishes and balance sebum.',
    category: 'BEAUTY',
    brand: 'The Ordinary',
    price: 5.9,
    currency: 'USD',
    features: ['Oil-free', 'Vegan', 'Cruelty-free'],
    tags: [{ type: 'CUSTOM', value: 'Skincare' }, { type: 'DIET', value: 'Vegan' }],
  },
  {
    name: 'Vitamix A3500 Ascent',
    shortName: 'Vitamix',
    description: 'Smart blender with programmable settings and self-detect containers.',
    category: 'KITCHEN',
    brand: 'Vitamix',
    price: 549.95,
    currency: 'USD',
    features: ['Variable speed control', 'Self-detect technology', '64oz container'],
    tags: [{ type: 'MEAL_TYPE', value: 'Breakfast' }, { type: 'CUSTOM', value: 'Smoothies' }],
  },
  {
    name: 'Apple AirPods Pro',
    shortName: 'AirPods Pro',
    description: 'Active noise cancellation and transparency mode.',
    category: 'TECH',
    brand: 'Apple',
    price: 249,
    currency: 'USD',
    features: ['ANC', 'Spatial audio', 'MagSafe charging'],
    tags: [{ type: 'CUSTOM', value: 'Audio' }],
  },
  {
    name: 'Lululemon Align High-Rise Leggings',
    shortName: 'Align Leggings',
    description: 'Nulu fabric leggings for yoga and low-impact activities.',
    category: 'FASHION',
    brand: 'Lululemon',
    price: 98,
    currency: 'USD',
    features: ['Nulu fabric', 'High-rise', '4-way stretch'],
    tags: [{ type: 'CUSTOM', value: 'Athleisure' }, { type: 'SEASON', value: 'Year-round' }],
  },
  {
    name: 'Hydro Flask 32oz Wide Mouth',
    shortName: 'Hydro Flask',
    description: 'Insulated stainless steel water bottle keeps drinks cold 24h.',
    category: 'HOME',
    brand: 'Hydro Flask',
    price: 44.95,
    currency: 'USD',
    features: ['TempShield insulation', 'BPA-free', 'Lifetime warranty'],
    tags: [{ type: 'CUSTOM', value: 'Hydration' }, { type: 'CUSTOM', value: 'Eco-friendly' }],
  },
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function parseArgs(): {
  places: number
  products: number
  email: string | null
  dryRun: boolean
  help: boolean
} {
  const args = process.argv.slice(2)
  let places = 5
  let products = 5
  let email: string | null = null
  let dryRun = false
  let help = false

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--places' && args[i + 1]) {
      places = Math.max(1, parseInt(args[++i], 10) || 5)
    } else if (arg === '--products' && args[i + 1]) {
      products = Math.max(1, parseInt(args[++i], 10) || 5)
    } else if (arg === '--email' && args[i + 1]) {
      email = args[++i]
    } else if (arg === '--dry-run') {
      dryRun = true
    } else if (arg === '--help' || arg === '-h') {
      help = true
    }
  }

  return { places, products, email, dryRun, help }
}

function showHelp(): void {
  const msg = `
seed-places-products - Create sample places and products

Usage:
  bun run seed:sample -- [options]

Options:
  --places N       Number of sample places to create (default: 5)
  --products N     Number of sample products to create (default: 5)
  --email EMAIL     Target user email (required; user must exist)
  --dry-run         Print what would be created without writing to DB
  --help, -h        Show this help

Examples:
  bun run seed:sample -- --email dev@example.com --places 5 --products 5
  bun run seed:sample -- --email dev@example.com --dry-run
`
  console.log(msg.trim())
}

async function main(): Promise<void> {
  const { places, products, email, dryRun, help } = parseArgs()

  if (help) {
    showHelp()
    process.exit(0)
  }

  if (!email) {
    console.error('Error: --email is required. Use --help for usage.')
    process.exit(1)
  }

  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL is not set. Ensure .env is loaded.')
    process.exit(1)
  }

  try {
    const user = await db.user.findUnique({
      where: { email: email! },
      select: { id: true, defaultOrgId: true },
    })

    if (!user) {
      console.error(`Error: No user found with email "${email}". Create a user first.`)
      process.exit(1)
    }

    const uid = user.id
    const orgId =
      user.defaultOrgId ??
      (await db.organization.findFirst({
        where: { ownerId: uid },
        select: { id: true },
      }))?.id

    if (!orgId) {
      console.error(`Error: User has no organization. Cannot seed.`)
      process.exit(1)
    }

    const placeCount = Math.min(places, SAMPLE_PLACES.length)
    const productCount = Math.min(products, SAMPLE_PRODUCTS.length)

    if (dryRun) {
      console.log(`[dry-run] Would create ${placeCount} places and ${productCount} products for ${email}`)
      const placeNames = SAMPLE_PLACES.slice(0, placeCount).map(p => p.name)
      const productNames = SAMPLE_PRODUCTS.slice(0, productCount).map(p => p.name)
      console.log('Places:', placeNames.join(', '))
      console.log('Products:', productNames.join(', '))
      process.exit(0)
    }

    let createdPlaces = 0
    let createdProducts = 0

    for (let i = 0; i < placeCount; i++) {
      const sample = SAMPLE_PLACES[i]
      const baseSlug = slugify(sample.name)
      let slug = baseSlug
      let suffix = 0
      while (await db.place.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${++suffix}`
      }

      await db.place.create({
        data: {
          slug,
          name: sample.name,
          shortName: sample.shortName,
          description: sample.description,
          type: sample.type,
          address: sample.address,
          city: sample.city,
          state: sample.state,
          country: sample.country,
          latitude: sample.latitude,
          longitude: sample.longitude,
          cuisine: sample.cuisine,
          priceRange: sample.priceRange,
          rating: sample.rating,
          website: sample.website,
          sourceType: 'MANUAL' as SourcePlatform,
          userId: uid,
          orgId,
          isPublic: false,
        },
      })

      if (sample.tags?.length) {
        const place = await db.place.findUnique({ where: { slug } })
        if (place) {
          for (const tagData of sample.tags) {
            const tagSlug = slugify(tagData.value)
            const tag = await db.tag.upsert({
              where: { slug: tagSlug },
              create: { slug: tagSlug, name: tagData.value, type: tagData.type as any },
              update: {},
            })
            await db.placeTag.create({
              data: { placeId: place.id, tagId: tag.id },
            }).catch(() => {})
          }
        }
      }

      createdPlaces++
      console.log(`  Created place: ${sample.name} (${slug})`)
    }

    for (let i = 0; i < productCount; i++) {
      const sample = SAMPLE_PRODUCTS[i]
      const baseSlug = slugify(sample.name)
      let slug = baseSlug
      let suffix = 0
      while (await db.product.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${++suffix}`
      }

      await db.product.create({
        data: {
          slug,
          name: sample.name,
          shortName: sample.shortName,
          description: sample.description,
          category: sample.category,
          brand: sample.brand,
          price: sample.price,
          currency: sample.currency ?? 'USD',
          features: sample.features,
          sourceType: 'MANUAL' as SourcePlatform,
          userId: uid,
          orgId,
          isPublic: false,
        },
      })

      if (sample.tags?.length) {
        const product = await db.product.findUnique({ where: { slug } })
        if (product) {
          for (const tagData of sample.tags) {
            const tagSlug = slugify(tagData.value)
            const tag = await db.tag.upsert({
              where: { slug: tagSlug },
              create: { slug: tagSlug, name: tagData.value, type: tagData.type as any },
              update: {},
            })
            await db.productTag.create({
              data: { productId: product.id, tagId: tag.id },
            }).catch(() => {})
          }
        }
      }

      createdProducts++
      console.log(`  Created product: ${sample.name} (${slug})`)
    }

    console.log(`\nDone. Created ${createdPlaces} places and ${createdProducts} products for ${email}.`)
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

main()
