import db from '@/lib/prisma'
import type { CreatePlaceRequest } from '@culyn/shared/schemas'
import { TagType } from '@prisma/client'
import slugify from 'slugify'

export interface SavePlaceOptions {
  placeId: string
  placeData: CreatePlaceRequest
}

export class PlacePersistenceService {
  async savePlace(options: SavePlaceOptions): Promise<string> {
    const { placeId, placeData } = options

    const slug = slugify(placeData.name || '', { lower: true, strict: true }) || placeId

    await db.place.update({
      where: { id: placeId },
      data: {
        slug,
        name: placeData.name,
        shortName: placeData.short_name,
        description: placeData.description,
        type: placeData.type,
        address: placeData.address,
        city: placeData.city,
        state: placeData.state,
        country: placeData.country,
        postalCode: placeData.postal_code,
        latitude: placeData.latitude,
        longitude: placeData.longitude,
        phoneNumber: placeData.phone_number,
        website: placeData.website,
        priceRange: placeData.price_range,
        cuisine: placeData.cuisine,
        rating: placeData.rating,
        notes: placeData.notes,
      },
    })

    if (placeData.tags && placeData.tags.length > 0) {
      await this.saveTags(placeId, placeData.tags)
    }

    return slug
  }

  async updatePlaceImage(placeId: string, imageUrl: string): Promise<void> {
    await db.place.update({
      where: { id: placeId },
      data: { imageUrl },
    })
  }

  private async saveTags(
    placeId: string,
    tags: Array<{ type: string; value: string }>
  ): Promise<void> {
    await Promise.all(
      tags.map(async tagData => {
        const slug = slugify(tagData.value, { lower: true, strict: true })
        const tag = await db.tag.upsert({
          where: { slug },
          update: {},
          create: {
            name: tagData.value,
            slug,
            type: tagData.type as TagType,
          },
        })

        return db.placeTag.upsert({
          where: {
            placeId_tagId: {
              placeId,
              tagId: tag.id,
            },
          },
          update: {},
          create: {
            placeId,
            tagId: tag.id,
          },
        })
      })
    )
  }
}

export const placePersistenceService = new PlacePersistenceService()
