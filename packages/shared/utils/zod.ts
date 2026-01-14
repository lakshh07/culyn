import type { ZodError } from 'zod';

/**
 * Helper function to format Zod errors
 */
export function formatZodError(err: ZodError) {
  const errors = {} as Record<string, string>;

  err.issues.forEach((issue) => {
    if (issue.path.length > 0) {
      const key = issue.path.join('.');
      if (!errors[key]) {
        errors[key] = issue.message;
      }
    }
  });

  return errors;
}
