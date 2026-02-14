import z from 'zod';

/**
 * Schema for creating a recipe request (used by AI extraction)
 */
export const CreateRecipeRequestSchema = z
  .object({
    title: z.string().describe('The title of the recipe'),
    short_title: z
      .string()
      .describe(
        'A concise and catchy version of the recipe title (3-7 words, no hyphens or long descriptors)'
      ),
    description: z.string().describe('A brief, appetizing description of the recipe'),
    calories: z.number().describe('Total calories per serving'),
    carbs_g: z.number().describe('Total carbohydrates in grams per serving'),
    protein_g: z.number().describe('Total protein in grams per serving'),
    fat_g: z.number().describe('Total fat in grams per serving'),
    tagline: z
      .string()
      .describe(
        'A concise tagline like "#HighProtein, #LowFat", "#Balanced", "#LowCarbs, #HighFat"'
      ),
    cook_time_minutes: z.number().describe('Total cooking time in minutes'),
    servings: z.number().describe('Number of servings the recipe makes'),
    difficulty: z
      .enum(['EASY', 'MEDIUM', 'HARD'])
      .describe('The difficulty level of preparing this recipe'),
    ingredients: z
      .array(
        z.object({
          name: z.string().describe('The name of the ingredient (standardized and clean)'),
          quantity: z
            .string()
            .describe('The quantity with unit (e.g., "2 tbsp", "1 cup", "1/2 tsp")'),
        })
      )
      .describe('List of all ingredients needed for the recipe'),
    cooking_steps: z
      .array(
        z.object({
          step_number: z.number().describe('The sequential step number (1, 2, 3, etc.)'),
          step_description: z.string().describe('Clear, concise instruction for this cooking step'),
          tools_required: z
            .array(z.string())
            .describe(
              'Physical kitchen tools needed for this step (e.g., "knife", "mixing bowl", "oven", "pan")'
            ),
          ingredients_used: z
            .array(
              z.object({
                name: z.string().describe('Name of the ingredient used in this step'),
                quantity: z
                  .string()
                  .describe(
                    'Quantity of this ingredient used in this step (e.g., "1 cup", "2 tbsp")'
                  ),
              })
            )
            .describe('Ingredients used specifically in this cooking step'),
        })
      )
      .describe('Step-by-step cooking instructions'),
    tags: z
      .array(
        z.object({
          type: z
            .enum(['CUISINE', 'MEAL_TYPE', 'DIET', 'SEASON', 'OCCASION', 'CUSTOM'])
            .describe('The category type of this tag'),
          value: z
            .string()
            .describe(
              'The tag value (e.g., "Italian", "Dinner", "Vegetarian", "Summer", "Holiday", "Quick & Easy")'
            ),
        })
      )
      .describe('Tags that categorize and describe the recipe'),
  })
  .describe('Complete structured recipe data extracted from the input');

export type CreateRecipeRequest = z.infer<typeof CreateRecipeRequestSchema>;
