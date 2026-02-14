import db from '@/lib/prisma'
import type { CreateProductRequest } from '@culyn/shared/schemas'
import { TagType } from '@prisma/client'
import slugify from 'slugify'

export interface SaveProductOptions {
  productId: string
  productData: CreateProductRequest
}

export class ProductPersistenceService {
  async saveProduct(options: SaveProductOptions): Promise<string> {
    const { productId, productData } = options

    const slug = slugify(productData.name || '', { lower: true, strict: true }) || productId

    await db.product.update({
      where: { id: productId },
      data: {
        slug,
        name: productData.name,
        shortName: productData.short_name,
        description: productData.description,
        category: productData.category,
        brand: productData.brand,
        modelNumber: productData.model_number,
        price: productData.price,
        currency: productData.currency,
        purchaseUrl: productData.purchase_url,
        specifications: productData.specifications,
        features: productData.features,
        notes: productData.notes,
      },
    })

    if (productData.tags && productData.tags.length > 0) {
      await this.saveTags(productId, productData.tags)
    }

    return slug
  }

  async updateProductImage(productId: string, imageUrl: string): Promise<void> {
    await db.product.update({
      where: { id: productId },
      data: { imageUrl },
    })
  }

  private async saveTags(
    productId: string,
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

        return db.productTag.upsert({
          where: {
            productId_tagId: {
              productId,
              tagId: tag.id,
            },
          },
          update: {},
          create: {
            productId,
            tagId: tag.id,
          },
        })
      })
    )
  }
}

export const productPersistenceService = new ProductPersistenceService()
