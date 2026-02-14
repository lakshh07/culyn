import z from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const ContentCategorySchema = z.enum(['RECIPE', 'PLACE', 'PRODUCT']);

export type ContentCategory = z.infer<typeof ContentCategorySchema>;

// ============================================================================
// Unified Content
// ============================================================================

export const UnifiedContentItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  category: ContentCategorySchema,
  title: z.string().nullable(),
  imageUrl: z.string().nullable(),
  isFavorited: z.boolean(),
  createdAt: z.string().or(z.date()),
  // Category-specific optional fields
  cookTime: z.number().nullable().optional(), // Recipe
  calories: z.number().nullable().optional(), // Recipe
  city: z.string().nullable().optional(), // Place
  placeType: z.string().nullable().optional(), // Place
  brand: z.string().nullable().optional(), // Product
  price: z.any().nullable().optional(), // Product
});

export type UnifiedContentItem = z.infer<typeof UnifiedContentItemSchema>;

// ============================================================================
// Query Parameters
// ============================================================================

export const ListUnifiedContentQuerySchema = z.object({
  category: ContentCategorySchema.optional(),
  q: z.string().optional(),
  sortBy: z
    .enum(['newest', 'oldest', 'popular'])
    .optional()
    .default('newest'),
  limit: z.coerce.number().optional().default(50),
  offset: z.coerce.number().optional().default(0),
});

export type ListUnifiedContentQuery = z.infer<typeof ListUnifiedContentQuerySchema>;

// ============================================================================
// Content Import
// ============================================================================

export const ImportContentRequestSchema = z.object({
  url: z.string().url().describe('The URL to import content from'),
});

export type ImportContentRequest = z.infer<typeof ImportContentRequestSchema>;

export const ImportContentResponseSchema = z.object({
  jobId: z.string(),
});

export type ImportContentResponse = z.infer<typeof ImportContentResponseSchema>;
