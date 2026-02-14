import z from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const SourcePlatformSchema = z.enum([
  'INSTAGRAM_REEL',
  'INSTAGRAM_POST',
  'INSTAGRAM_VIDEO',
  'TIKTOK',
  'YOUTUBE_SHORT',
  'MANUAL',
]);

export type SourcePlatform = z.infer<typeof SourcePlatformSchema>;

export const PlaceTypeSchema = z.enum([
  'RESTAURANT',
  'CAFE',
  'BAR',
  'BAKERY',
  'FOOD_TRUCK',
  'MARKET',
  'GROCERY_STORE',
  'SPECIALTY_SHOP',
  'OTHER',
]);

export type PlaceType = z.infer<typeof PlaceTypeSchema>;

// ============================================================================
// Query Parameters
// ============================================================================

export const ListPlacesQuerySchema = z.object({
  tagId: z.string().optional(),
  type: PlaceTypeSchema.optional(),
  city: z.string().optional(),
  q: z.string().optional(),
  sortBy: z
    .enum(['newest', 'oldest', 'popular', 'random'])
    .optional()
    .default('newest'),
  limit: z.coerce.number().optional().default(20),
  offset: z.coerce.number().optional().default(0),
});

export type ListPlacesQuery = z.infer<typeof ListPlacesQuerySchema>;

// ============================================================================
// Request Schemas
// ============================================================================

export const GeneratePlaceRequestSchema = z.object({
  url: z.string().url().describe('The URL to generate a place from'),
  sourceType: SourcePlatformSchema.describe('The source platform type'),
});

export type GeneratePlaceRequest = z.infer<typeof GeneratePlaceRequestSchema>;

export const CreatePlaceRequestSchema = z
  .object({
    name: z.string().describe('The official name of the place'),
    short_name: z.string().optional().describe('A shortened or informal name'),
    description: z
      .string()
      .optional()
      .describe('Cleaned description of the place'),
    type: PlaceTypeSchema.describe('Primary place type'),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postal_code: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    phone_number: z.string().optional(),
    website: z.string().optional(),
    price_range: z.string().optional().describe('e.g. $, $$, $$$, $$$$'),
    cuisine: z.string().optional(),
    hours: z.any().optional(),
    rating: z.number().optional(),
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
        }),
      )
      .optional(),
  })
  .describe('Structured place data extracted from input');

export type CreatePlaceRequest = z.infer<typeof CreatePlaceRequestSchema>;

// ============================================================================
// Response Schemas
// ============================================================================

export const PlaceTagSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
});

export const PlaceListItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string().nullable(),
  shortName: z.string().nullable(),
  type: PlaceTypeSchema,
  city: z.string().nullable(),
  imageUrl: z.string().nullable(),
  cuisine: z.string().nullable(),
  priceRange: z.string().nullable(),
  rating: z.any().nullable(),
  latitude: z.any().nullable(),
  longitude: z.any().nullable(),
  tags: z.array(
    z.object({
      tag: PlaceTagSchema,
    }),
  ),
  PlaceFavorite: z.array(
    z.object({
      id: z.string(),
    }),
  ),
  _count: z.object({
    PlaceFavorite: z.number(),
  }),
});

export type PlaceListItem = z.infer<typeof PlaceListItemSchema>;

export const PlaceDetailSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string().nullable(),
  shortName: z.string().nullable(),
  description: z.string().nullable(),
  type: PlaceTypeSchema,
  address: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  country: z.string().nullable(),
  postalCode: z.string().nullable(),
  latitude: z.any().nullable(),
  longitude: z.any().nullable(),
  imageUrl: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  videoUrl: z.string().nullable(),
  sourceType: SourcePlatformSchema,
  sourceUrl: z.string().nullable(),
  sourceName: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  website: z.string().nullable(),
  priceRange: z.string().nullable(),
  cuisine: z.string().nullable(),
  hours: z.any().nullable(),
  rating: z.any().nullable(),
  notes: z.string().nullable(),
  metadata: z.any().nullable(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  deletedAt: z.string().or(z.date()).nullable(),
  userId: z.string().nullable(),
  PlaceFavorite: z.array(
    z.object({
      id: z.string(),
    }),
  ),
});

export type PlaceDetail = z.infer<typeof PlaceDetailSchema>;

export const GeneratePlaceResponseSchema = z.object({
  status: z.literal(202),
  data: z.object({
    placeId: z.string(),
    bullJobId: z.string(),
    jobId: z.string(),
  }),
});

export type GeneratePlaceResponse = z.infer<typeof GeneratePlaceResponseSchema>;
