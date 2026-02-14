import z from 'zod';
import { SourcePlatformSchema } from '../places';

// ============================================================================
// Enums
// ============================================================================

export const ProductCategorySchema = z.enum([
  'BEAUTY',
  'TECH',
  'FASHION',
  'KITCHEN',
  'HOME',
  'HEALTH',
  'SPORTS',
  'BOOKS',
  'TOYS',
  'OTHER',
]);

export type ProductCategory = z.infer<typeof ProductCategorySchema>;

// ============================================================================
// Query Parameters
// ============================================================================

export const ListProductsQuerySchema = z.object({
  category: ProductCategorySchema.optional(),
  brand: z.string().optional(),
  q: z.string().optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  sortBy: z
    .enum(['newest', 'oldest', 'popular', 'price_asc', 'price_desc', 'random'])
    .optional()
    .default('newest'),
  limit: z.coerce.number().optional().default(20),
  offset: z.coerce.number().optional().default(0),
});

export type ListProductsQuery = z.infer<typeof ListProductsQuerySchema>;

// ============================================================================
// Request Schemas
// ============================================================================

export const GenerateProductRequestSchema = z.object({
  url: z.string().url().describe('The URL to generate a product from'),
  sourceType: SourcePlatformSchema.describe('The source platform type'),
});

export type GenerateProductRequest = z.infer<typeof GenerateProductRequestSchema>;

export const CreateProductRequestSchema = z
  .object({
    name: z.string().describe('The name of the product'),
    short_name: z.string().optional(),
    description: z.string().optional(),
    category: ProductCategorySchema.describe('The product category'),
    brand: z.string().optional(),
    model_number: z.string().optional(),
    price: z.number().optional(),
    currency: z.string().optional().default('USD'),
    purchase_url: z.string().optional(),
    specifications: z.any().optional(),
    features: z.array(z.string()).optional(),
    notes: z.string().optional(),
    tags: z
      .array(
        z.object({
          type: z.enum([
            'CUISINE',
            'MEAL_TYPE',
            'DIET',
            'SEASON',
            'OCCASION',
            'CUSTOM',
          ]),
          value: z.string(),
        })
      )
      .optional(),
  })
  .describe('Structured product data extracted from input');

export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>;

// ============================================================================
// Response Schemas
// ============================================================================

export const ProductTagSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
});

export const ProductListItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string().nullable(),
  shortName: z.string().nullable(),
  category: ProductCategorySchema,
  brand: z.string().nullable(),
  price: z.any().nullable(),
  currency: z.string().nullable(),
  imageUrl: z.string().nullable(),
  tags: z.array(
    z.object({
      tag: ProductTagSchema,
    })
  ),
  ProductFavorite: z.array(
    z.object({
      id: z.string(),
    })
  ),
  _count: z.object({
    ProductFavorite: z.number(),
  }),
});

export type ProductListItem = z.infer<typeof ProductListItemSchema>;

export const ProductDetailSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string().nullable(),
  shortName: z.string().nullable(),
  description: z.string().nullable(),
  category: ProductCategorySchema,
  brand: z.string().nullable(),
  modelNumber: z.string().nullable(),
  price: z.any().nullable(),
  currency: z.string().nullable(),
  imageUrl: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  videoUrl: z.string().nullable(),
  sourceType: SourcePlatformSchema,
  sourceUrl: z.string().nullable(),
  sourceName: z.string().nullable(),
  purchaseUrl: z.string().nullable(),
  affiliateUrl: z.string().nullable(),
  specifications: z.any().nullable(),
  features: z.any().nullable(),
  notes: z.string().nullable(),
  metadata: z.any().nullable(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  deletedAt: z.string().or(z.date()).nullable(),
  userId: z.string().nullable(),
  ProductFavorite: z.array(
    z.object({
      id: z.string(),
    })
  ),
});

export type ProductDetail = z.infer<typeof ProductDetailSchema>;

export const GenerateProductResponseSchema = z.object({
  status: z.literal(202),
  data: z.object({
    productId: z.string(),
    bullJobId: z.string(),
    jobId: z.string(),
  }),
});

export type GenerateProductResponse = z.infer<typeof GenerateProductResponseSchema>;
