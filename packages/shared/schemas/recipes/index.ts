import z from 'zod';

// ============================================================================
// Query Parameters
// ============================================================================

/**
 * Schema for listing recipes with filters
 */
export const ListRecipesQuerySchema = z.object({
  tagId: z.string().optional(),
  sortBy: z
    .enum(['newest', 'oldest', 'popular', 'random'])
    .optional()
    .default('newest'),
  q: z.string().optional(),
  cookTimeMin: z.coerce.number().optional(),
  cookTimeMax: z.coerce.number().optional(),
  caloriesMin: z.coerce.number().optional(),
  caloriesMax: z.coerce.number().optional(),
  proteinMin: z.coerce.number().optional(),
  proteinMax: z.coerce.number().optional(),
  ingredientIds: z.string().optional(), // comma-separated ingredient IDs
  limit: z.coerce.number().optional().default(20),
  offset: z.coerce.number().optional().default(0),
});

export type ListRecipesQuery = z.infer<typeof ListRecipesQuerySchema>;

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * Schema for generating a recipe from a URL
 */
export const GenerateRecipeRequestSchema = z.object({
  url: z.string().url().describe('The URL of the recipe to generate'),
  sourceType: z
    .enum([
      'MANUAL',
      'INSTAGRAM_REEL',
      'INSTAGRAM_POST',
      'INSTAGRAM_VIDEO',
      'TIKTOK',
    ])
    .describe('The type of the recipe source'),
});

export type GenerateRecipeRequest = z.infer<typeof GenerateRecipeRequestSchema>;

/**
 * Schema for updating a list item
 */
export const UpdateListItemRequestSchema = z.union([
  z.object({
    clearAll: z.boolean(),
  }),
  z.object({
    checked: z.boolean(),
  }),
  z.object({
    notes: z.string(),
  }),
  z.object({}),
]);

export type UpdateListItemRequest = z.infer<typeof UpdateListItemRequestSchema>;

// ============================================================================
// Response Schemas
// ============================================================================

/**
 * Schema for tag in recipe list
 */
export const RecipeTagSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
});

export type RecipeTag = z.infer<typeof RecipeTagSchema>;

/**
 * Schema for ingredient in recipe list
 */
export const RecipeIngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type RecipeIngredient = z.infer<typeof RecipeIngredientSchema>;

/**
 * Schema for a recipe in the list view
 */
export const RecipeListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  shortTitle: z.string(),
  imageUrl: z.string().nullable(),
  cookTime: z.number().nullable(),
  calories: z.number().nullable(),
  tags: z.array(
    z.object({
      tag: RecipeTagSchema,
    })
  ),
  RecipeIngredient: z.array(
    z.object({
      ingredient: RecipeIngredientSchema,
    })
  ),
  RecipeFavorite: z.array(
    z.object({
      id: z.string(),
    })
  ),
  _count: z.object({
    RecipeFavorite: z.number(),
  }),
});

export type RecipeListItem = z.infer<typeof RecipeListItemSchema>;

/**
 * Schema for detailed recipe ingredient with quantity
 */
export const DetailedRecipeIngredientSchema = z.object({
  amount: z.string(),
  unit: z.string().nullable(),
  ingredient: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
  }),
});

export type DetailedRecipeIngredient = z.infer<
  typeof DetailedRecipeIngredientSchema
>;

export const CookingStepSchema = z.object({
  step_number: z.number(),
  step_description: z.string(),
  tools_required: z.array(z.string()),
  ingredients_used: z.array(
    z.object({
      name: z.string(),
      quantity: z.string(),
    })
  ),
});

export type CookingStep = z.infer<typeof CookingStepSchema>;

/**
 * Schema for a single recipe detail view
 */
export const RecipeDetailSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string().nullable(),
  shortTitle: z.string().nullable(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  videoUrl: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  cookTime: z.number().nullable(),
  servings: z.number().nullable(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).nullable(),
  calories: z.number().nullable(),
  protein: z.number().nullable(),
  carbs: z.number().nullable(),
  fat: z.number().nullable(),
  tagline: z.string().nullable(),
  cookingSteps: z.array(CookingStepSchema),
  sourceUrl: z.string().nullable(),
  sourceType: z.enum([
    'MANUAL',
    'INSTAGRAM_REEL',
    'INSTAGRAM_POST',
    'INSTAGRAM_VIDEO',
    'TIKTOK',
  ]),
  sourceName: z.string().nullable(),
  imagePrompt: z.string().nullable(),
  metadata: z.any().nullable(), // JSON field
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  deletedAt: z.string().or(z.date()).nullable(),
  userId: z.string(),
  organizationId: z.string(),
  RecipeIngredient: z.array(DetailedRecipeIngredientSchema),
  RecipeFavorite: z.array(
    z.object({
      id: z.string(),
    })
  ),
});

export type RecipeDetail = z.infer<typeof RecipeDetailSchema>;

/**
 * Schema for generate recipe response
 */
export const GenerateRecipeResponseSchema = z.object({
  status: z.literal(202),
  data: z.object({
    recipeId: z.string(),
    bullJobId: z.string(),
    jobId: z.string(),
  }),
});

export type GenerateRecipeResponse = z.infer<
  typeof GenerateRecipeResponseSchema
>;

/**
 * Schema for add to cookbook response
 */
export const AddToCookbookResponseSchema = z.object({
  message: z.string(),
  favorite: z
    .object({
      id: z.string(),
      recipeId: z.string(),
      userId: z.string(),
      createdAt: z.string().or(z.date()),
      updatedAt: z.string().or(z.date()),
      deletedAt: z.string().or(z.date()).nullable(),
    })
    .optional(),
});

export type AddToCookbookResponse = z.infer<typeof AddToCookbookResponseSchema>;
