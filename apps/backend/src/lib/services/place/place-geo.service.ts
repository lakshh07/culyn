export interface GeoEnrichmentInput {
  name?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  postal_code?: string | null
}

export interface GeoEnrichmentResult {
  latitude: number
  longitude: number
  formattedAddress?: string
  phone_number?: string
  website?: string
  rating?: number
  price_range?: string
  hours?: Record<string, string>
}

const GOOGLE_PRICE_LEVEL_MAP: Record<string, string> = {
  PRICE_LEVEL_FREE: '$',
  PRICE_LEVEL_INEXPENSIVE: '$',
  PRICE_LEVEL_MODERATE: '$$',
  PRICE_LEVEL_EXPENSIVE: '$$$',
  PRICE_LEVEL_VERY_EXPENSIVE: '$$$$',
}

const FIELD_MASK = [
  'places.location',
  'places.formattedAddress',
  'places.internationalPhoneNumber',
  'places.websiteUri',
  'places.rating',
  'places.priceLevel',
  'places.regularOpeningHours',
].join(',')

export class PlaceGeoService {
  private apiKey: string | undefined

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY
  }

  async enrich(input: GeoEnrichmentInput): Promise<GeoEnrichmentResult | null> {
    if (!this.apiKey) {
      console.warn('[PlaceGeo] GOOGLE_MAPS_API_KEY not set, skipping geocoding')
      return null
    }

    const query = this.buildSearchQuery(input)
    if (!query) {
      console.warn('[PlaceGeo] Insufficient address data, skipping geocoding')
      return null
    }

    try {
      const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': FIELD_MASK,
        },
        body: JSON.stringify({ textQuery: query }),
      })

      if (!response.ok) {
        console.error(`[PlaceGeo] API error: ${response.status} ${response.statusText}`)
        return null
      }

      const data = (await response.json()) as { places?: Record<string, any>[] }

      console.log(data, 'data')
      const place = data.places?.[0]
      if (!place?.location) {
        console.warn('[PlaceGeo] No results found for query:', query)
        return null
      }

      return {
        latitude: place.location.latitude,
        longitude: place.location.longitude,
        formattedAddress: place.formattedAddress ?? undefined,
        phone_number: place.internationalPhoneNumber ?? undefined,
        website: place.websiteUri ?? undefined,
        rating: place.rating ?? undefined,
        price_range: place.priceLevel ? GOOGLE_PRICE_LEVEL_MAP[place.priceLevel] : undefined,
        hours: this.parseHours(place.regularOpeningHours),
      }
    } catch (error) {
      console.error('[PlaceGeo] Failed to enrich place:', error)
      return null
    }
  }

  private buildSearchQuery(input: GeoEnrichmentInput): string | null {
    const { name, address, city, state, country } = input

    if (!name && !address && !city) {
      return null
    }

    const parts = [name, address, city, state, country].filter(Boolean)
    return parts.join(', ')
  }

  private parseHours(
    openingHours?: { weekdayDescriptions?: string[] } | null
  ): Record<string, string> | undefined {
    if (!openingHours?.weekdayDescriptions?.length) {
      return undefined
    }

    const hours: Record<string, string> = {}
    for (const desc of openingHours.weekdayDescriptions) {
      const colonIndex = desc.indexOf(':')
      if (colonIndex === -1) continue
      const day = desc.slice(0, colonIndex).trim()
      const time = desc.slice(colonIndex + 1).trim()
      if (day && time) {
        hours[day] = time
      }
    }

    return Object.keys(hours).length > 0 ? hours : undefined
  }
}

export const placeGeoService = new PlaceGeoService()
