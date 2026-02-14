import z from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const ChatContextTypeSchema = z.enum([
  'GENERAL',
  'RECIPE',
  'PLACE',
  'PRODUCT',
]);

export type ChatContextType = z.infer<typeof ChatContextTypeSchema>;

export const ChatRoleSchema = z.enum(['USER', 'ASSISTANT', 'SYSTEM']);

export type ChatRole = z.infer<typeof ChatRoleSchema>;

// ============================================================================
// Query Parameters
// ============================================================================

export const ListConversationsQuerySchema = z.object({
  contextType: ChatContextTypeSchema.optional(),
  limit: z.coerce.number().optional().default(50),
  offset: z.coerce.number().optional().default(0),
});

export type ListConversationsQuery = z.infer<typeof ListConversationsQuerySchema>;

// ============================================================================
// Request Schemas
// ============================================================================

export const CreateChatRequestSchema = z.object({
  title: z.string().optional(),
  contextType: ChatContextTypeSchema.optional().default('GENERAL'),
  recipeId: z.string().optional(),
  placeId: z.string().optional(),
  productId: z.string().optional(),
});

export type CreateChatRequest = z.infer<typeof CreateChatRequestSchema>;

export const SendMessageRequestSchema = z.object({
  content: z.string().min(1).describe('The message content'),
});

export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;

// ============================================================================
// Response Schemas
// ============================================================================

export const ChatMessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  role: ChatRoleSchema,
  content: z.string(),
  model: z.string().nullable(),
  tokens: z.number().nullable(),
  createdAt: z.string().or(z.date()),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatConversationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().nullable(),
  contextType: ChatContextTypeSchema,
  recipeId: z.string().nullable(),
  placeId: z.string().nullable(),
  productId: z.string().nullable(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export type ChatConversation = z.infer<typeof ChatConversationSchema>;

export const ChatConversationWithMessagesSchema = ChatConversationSchema.extend({
  messages: z.array(ChatMessageSchema),
});

export type ChatConversationWithMessages = z.infer<
  typeof ChatConversationWithMessagesSchema
>;

export const StreamMessageEventSchema = z.object({
  type: z.enum(['token', 'done', 'error']),
  content: z.string().optional(),
  messageId: z.string().optional(),
  error: z.string().optional(),
});

export type StreamMessageEvent = z.infer<typeof StreamMessageEventSchema>;
